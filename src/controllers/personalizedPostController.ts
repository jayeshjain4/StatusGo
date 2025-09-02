import { Request, Response } from 'express';
import prisma from '../prisma';
import { sendResponse } from '../utils/responseUtils';
import STATUS_CODES from '../utils/statusCodes';

// GET /api/posts/personalized - Get personalized posts based on user preferences
export const getPersonalizedPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      sendResponse(res, false, null, 'User not authenticated', STATUS_CODES.UNAUTHORIZED);
      return;
    }

    // Get page and limit from query parameters, with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Validate page and limit
    if (page < 1) {
      sendResponse(res, false, null, 'Page number must be greater than 0', STATUS_CODES.BAD_REQUEST);
      return;
    }
    
    if (limit < 1 || limit > 100) {
      sendResponse(res, false, null, 'Limit must be between 1 and 100', STATUS_CODES.BAD_REQUEST);
      return;
    }

    // Get user's preferences
    const userPreferences = await (prisma as any).userPreference.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { weight: 'desc' }
    });

    // Check if user has set preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasSetPreferences: true } as any
    });

    let posts;
    let totalPosts;

    if (!(user as any)?.hasSetPreferences || userPreferences.length === 0) {
      // If user hasn't set preferences, show posts ordered by popularity and recency
      posts = await prisma.post.findMany({
        orderBy: [
          { likeCount: 'desc' }, // Most liked first
          { createdAt: 'desc' }  // Then most recent
        ],
        skip: offset,
        take: limit,
        include: {
          _count: {
            select: {
              likes: true,
              comments: true
            }
          },
          category: true
        }
      });

      totalPosts = await prisma.post.count();
    } else {
      // Get category IDs from user preferences, ordered by weight
      const preferredCategoryIds = userPreferences.map((pref: any) => pref.categoryId);
      
      // Get user's liked posts to understand their behavior
      const userLikes = await prisma.like.findMany({
        where: { userId },
        include: { post: { include: { category: true } } }
      });

      // Calculate category engagement scores based on user's likes
      const categoryEngagement: { [key: number]: number } = {};
      userLikes.forEach(like => {
        if (like.post.categoryId) {
          categoryEngagement[like.post.categoryId] = (categoryEngagement[like.post.categoryId] || 0) + 1;
        }
      });

      // Build scoring query with preference weights
      const preferenceWeights: { [key: number]: number } = {};
      userPreferences.forEach((pref: any) => {
        preferenceWeights[pref.categoryId] = pref.weight;
      });

      // Get posts from preferred categories with sophisticated scoring
      const postsWithScores = await prisma.$queryRaw<any[]>`
        SELECT 
          p.*,
          c.id as category_id,
          c.name as category_name,
          c.imageUrl as category_imageUrl,
          c.popularity as category_popularity,
          COALESCE(like_counts.count, 0) as like_count,
          COALESCE(comment_counts.count, 0) as comment_count,
          CASE 
            WHEN p."categoryId" = ANY(${preferredCategoryIds}::int[]) THEN
              -- Base preference score
              CASE p."categoryId"
                ${userPreferences.map((pref: any) => 
                  `WHEN ${pref.categoryId} THEN ${pref.weight * 100}`
                ).join(' ')}
                ELSE 50
              END
              -- Engagement bonus (user's past likes in this category)
              + COALESCE(${JSON.stringify(categoryEngagement)}::jsonb ->> p."categoryId"::text, '0')::int * 20
              -- Popularity bonus (category popularity)
              + c.popularity * 5
              -- Recency bonus (newer posts get higher score)
              + (EXTRACT(epoch FROM NOW() - p."createdAt") / 3600) * -0.1
              -- Like ratio bonus
              + COALESCE(like_counts.count, 0) * 2
            ELSE 
              -- For non-preferred categories, much lower base score
              10
              + c.popularity * 2
              + COALESCE(like_counts.count, 0) * 1
              + (EXTRACT(epoch FROM NOW() - p."createdAt") / 3600) * -0.05
          END as relevance_score
        FROM post p
        LEFT JOIN category c ON p."categoryId" = c.id
        LEFT JOIN (
          SELECT "postId", COUNT(*) as count 
          FROM like 
          GROUP BY "postId"
        ) like_counts ON p.id = like_counts."postId"
        LEFT JOIN (
          SELECT "postId", COUNT(*) as count 
          FROM comment 
          GROUP BY "postId"
        ) comment_counts ON p.id = comment_counts."postId"
        WHERE c."isDeleted" = false OR c."isDeleted" IS NULL
        ORDER BY relevance_score DESC, p."createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Transform the raw query results to match expected format
      posts = postsWithScores.map(post => ({
        id: post.id,
        attachment: post.attachment,
        categoryId: post.categoryId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likeCount: post.likeCount || parseInt(post.like_count) || 0,
        _count: {
          likes: parseInt(post.like_count) || 0,
          comments: parseInt(post.comment_count) || 0
        },
        category: post.categoryId ? {
          id: post.category_id,
          name: post.category_name,
          imageUrl: post.category_imageUrl,
          popularity: post.category_popularity
        } : null,
        relevanceScore: parseFloat(post.relevance_score) // For debugging purposes
      }));

      // Get total count for preferred categories
      totalPosts = await prisma.post.count({
        where: {
          OR: [
            { categoryId: { in: preferredCategoryIds } },
            { categoryId: null } // Include posts without category
          ]
        }
      });
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalPosts / limit);

    // Prepare pagination metadata
    const pagination = {
      currentPage: page,
      totalPages: totalPages,
      totalPosts: totalPosts,
      postsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    };

    const responseData = {
      posts: posts,
      pagination: pagination,
      personalization: {
        hasSetPreferences: (user as any)?.hasSetPreferences || false,
        preferredCategories: userPreferences.map((pref: any) => ({
          id: pref.category.id,
          name: pref.category.name,
          weight: pref.weight
        }))
      }
    };

    sendResponse(res, true, responseData, 'Personalized posts fetched successfully', STATUS_CODES.OK);
  } catch (error: any) {
    console.error('Get personalized posts error:', error);
    sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

// GET /api/posts/suggested - Get post suggestions for users who haven't set preferences
export const getSuggestedPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      sendResponse(res, false, null, 'User not authenticated', STATUS_CODES.UNAUTHORIZED);
      return;
    }

    // Get page and limit from query parameters, with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get trending posts (most liked in the last 7 days)
    const trendingPosts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: [
        { likeCount: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: offset,
      take: limit,
      include: {
        _count: {
          select: {
            likes: true,
            comments: true
          }
        },
        category: true
      }
    });

    const totalTrendingPosts = await prisma.post.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalTrendingPosts / limit);

    // Prepare pagination metadata
    const pagination = {
      currentPage: page,
      totalPages: totalPages,
      totalPosts: totalTrendingPosts,
      postsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    };

    const responseData = {
      posts: trendingPosts,
      pagination: pagination,
      suggestion: {
        type: 'trending',
        description: 'Posts that are trending in the last 7 days'
      }
    };

    sendResponse(res, true, responseData, 'Suggested posts fetched successfully', STATUS_CODES.OK);
  } catch (error: any) {
    console.error('Get suggested posts error:', error);
    sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
  }
};
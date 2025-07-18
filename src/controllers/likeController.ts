import { Request, Response } from 'express';
import prisma from '../prisma';
import { sendResponse } from '../utils/responseUtils';
import STATUS_CODES from '../utils/statusCodes';
import { AuthRequest } from '../middlewares/authMiddleware';

// POST /api/posts/:postId/like - Like/Unlike a post
export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user!.id; // User is authenticated, so we know this exists

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        _count: {
          select: { likes: true }
        }
      }
    });

    if (!post) {
      return sendResponse(res, false, null, 'Post not found', STATUS_CODES.NOT_FOUND);
    }

    // Check if user has already liked the post
    const existingLike = await prisma.like.findFirst({
      where: {
        AND: [
          { postId: postId },
          { userId: userId }
        ]
      }
    });

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      });

      return sendResponse(res, true, { 
        liked: false, 
        likeCount: post._count.likes - 1 
      }, 'Post unliked successfully', STATUS_CODES.OK);
    }

    // Like the post
    await prisma.like.create({
      data: {
        postId,
        userId
      }
    });

    return sendResponse(res, true, { 
      liked: true, 
      likeCount: post._count.likes + 1 
    }, 'Post liked successfully', STATUS_CODES.OK);
  } catch (error: any) {
    return sendResponse(res, false, null, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

// GET /api/posts/:postId/likes - Get all likes for a post
export const getLikes = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return sendResponse(res, false, null, 'Post not found', STATUS_CODES.NOT_FOUND);
    }

    const totalLikes = await prisma.like.count({
      where: { postId }
    });

    const likes = await prisma.like.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const totalPages = Math.ceil(totalLikes / limit);

    const responseData = {
      likes,
      pagination: {
        currentPage: page,
        totalPages,
        totalLikes,
        likesPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };

    return sendResponse(res, true, responseData, 'Likes retrieved successfully', STATUS_CODES.OK);
  } catch (error: any) {
    return sendResponse(res, false, null, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

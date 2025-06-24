import { Request, Response } from 'express';
import prisma from '../prisma';
import cloudinary from '../utils/cloudinary';
import fs from 'fs';
import { sendResponse } from '../utils/responseUtils';
import STATUS_CODES from '../utils/statusCodes';


// POST /api/post - Upload a post (photo or video)
export const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      sendResponse(res, false, null, 'No file uploaded', STATUS_CODES.BAD_REQUEST);
      return;
    }

    const { categoryId } = req.body;

    // Validate categoryId if provided
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) }
      });
      
      if (!categoryExists) {
        sendResponse(res, false, null, 'Category not found', STATUS_CODES.BAD_REQUEST);
        return;
      }
    }

    // Check if the uploaded file is a video
    const isVideo = req.file.mimetype.startsWith('video/');
    
    let uploadOptions: any = {
      folder: 'posts',
      resource_type: 'auto',
    };

    // If it's a video, apply compression to 480x720
    if (isVideo) {
      uploadOptions = {
        ...uploadOptions,
        resource_type: 'video',
        transformation: [
          {
            width: 480,
            height: 720,
            crop: 'limit', // Maintains aspect ratio, fits within 480x720
            quality: 'auto:good', // Automatic quality optimization
            format: 'mp4' // Convert to MP4 for better compatibility
          }
        ]
      };
    } else {
      // For images, you can also add some optimization
      uploadOptions = {
        ...uploadOptions,
        resource_type: 'image',
        transformation: [
          {
            quality: 'auto:good', // Automatic quality optimization for images
            fetch_format: 'auto' // Automatic format selection (WebP, etc.)
          }
        ]
      };
    }

    // Upload to Cloudinary with specified transformations
    const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);
    
    fs.unlinkSync(req.file.path); // Remove local file
    
    // Create post data object
    const postData: any = {
      attachment: result.secure_url,
    };

    // Add categoryId if provided
    if (categoryId) {
      postData.categoryId = parseInt(categoryId);
    }    const post = await prisma.post.create({
      data: postData
    });
    
    sendResponse(res, true, post, 'Post uploaded successfully', STATUS_CODES.CREATED);
  } catch (error: any) {
    sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

// GET /api/post - Get all posts with pagination
export const getAllPosts = async (req: Request, res: Response) => {
  try {
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

    // Get total count of posts
    const totalPosts = await prisma.post.count();
    
    // Calculate total pages
    const totalPages = Math.ceil(totalPosts / limit);
      // Get posts with pagination
    const posts = await prisma.post.findMany({ 
      orderBy: { id: 'asc' }, // Order by ID ascending to get oldest first
      skip: offset,
      take: limit
    });
    
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
      pagination: pagination
    };

    sendResponse(res, true, responseData, 'Posts fetched successfully', STATUS_CODES.OK);
  } catch (error: any) {
    sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

// GET /api/post/category/:categoryId - Get posts by category with pagination
export const getPostsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    
    // Get page and limit from query parameters, with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Validate categoryId
    if (!categoryId || isNaN(parseInt(categoryId))) {
      sendResponse(res, false, null, 'Invalid category ID', STATUS_CODES.BAD_REQUEST);
      return;
    }

    // Validate page and limit
    if (page < 1) {
      sendResponse(res, false, null, 'Page number must be greater than 0', STATUS_CODES.BAD_REQUEST);
      return;
    }
    
    if (limit < 1 || limit > 100) {
      sendResponse(res, false, null, 'Limit must be between 1 and 100', STATUS_CODES.BAD_REQUEST);
      return;
    }

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) }
    });

    if (!categoryExists) {
      sendResponse(res, false, null, 'Category not found', STATUS_CODES.NOT_FOUND);
      return;
    }

    // Get total count of posts in this category
    const totalPosts = await prisma.post.count({
      where: {
        categoryId: parseInt(categoryId)
      } as any
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(totalPosts / limit);    const posts = await prisma.post.findMany({
      where: {
        categoryId: parseInt(categoryId)
      } as any,
      orderBy: { id: 'asc' }, // Order by ID ascending
      skip: offset,
      take: limit
    });

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
      category: {
        id: categoryExists.id,
        name: categoryExists.name,
        imageUrl: categoryExists.imageUrl
      }
    };

    sendResponse(res, true, responseData, `Posts from category '${categoryExists.name}' fetched successfully`, STATUS_CODES.OK);
  } catch (error: any) {
    sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

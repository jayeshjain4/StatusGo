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

// GET /api/post - Get all posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({ 
      orderBy: { createdAt: 'desc' }
    });
    sendResponse(res, true, posts, 'All posts fetched successfully', STATUS_CODES.OK);
  } catch (error: any) {
    sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

// GET /api/post/category/:categoryId - Get posts by category
export const getPostsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    
    // Validate categoryId
    if (!categoryId || isNaN(parseInt(categoryId))) {
      sendResponse(res, false, null, 'Invalid category ID', STATUS_CODES.BAD_REQUEST);
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

    const posts = await prisma.post.findMany({
      where: {
        categoryId: parseInt(categoryId)
      } as any,
      orderBy: { createdAt: 'desc' }
    });

    sendResponse(res, true, posts, `Posts from category '${categoryExists.name}' fetched successfully`, STATUS_CODES.OK);
  } catch (error: any) {
    sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

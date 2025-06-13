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
    // Upload to Cloudinary (auto-detect resource type)
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'posts',
      resource_type: 'auto',
    });
    fs.unlinkSync(req.file.path); // Remove local file
    const post = await prisma.post.create({
      data: {
        attachment: result.secure_url,
      },
    });
    sendResponse(res, true, post, 'Post uploaded successfully', STATUS_CODES.CREATED);
  } catch (error: any) {
    sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

// GET /api/post - Get all posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
    sendResponse(res, true, posts, 'All posts fetched successfully', STATUS_CODES.OK);
  } catch (error: any) {
    sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

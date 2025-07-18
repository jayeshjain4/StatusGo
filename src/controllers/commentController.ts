import { Request, Response } from 'express';
import prisma from '../prisma';
import { sendResponse } from '../utils/responseUtils';
import STATUS_CODES from '../utils/statusCodes';
import { AuthRequest } from '../middlewares/authMiddleware';

// POST /api/posts/:postId/comments - Create a comment
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user!.id; // User is authenticated
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return sendResponse(res, false, null, 'Comment content is required', STATUS_CODES.BAD_REQUEST);
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return sendResponse(res, false, null, 'Post not found', STATUS_CODES.NOT_FOUND);
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      }
    });

    return sendResponse(res, true, comment, 'Comment created successfully', STATUS_CODES.CREATED);
  } catch (error: any) {
    return sendResponse(res, false, null, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

// GET /api/posts/:postId/comments - Get all comments for a post
export const getComments = async (req: Request, res: Response) => {
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

    const totalComments = await prisma.comment.count({
      where: { postId }
    });

    const comments = await prisma.comment.findMany({
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

    const totalPages = Math.ceil(totalComments / limit);

    const responseData = {
      comments,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        commentsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };

    return sendResponse(res, true, responseData, 'Comments retrieved successfully', STATUS_CODES.OK);
  } catch (error: any) {
    return sendResponse(res, false, null, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

// DELETE /api/posts/:postId/comments/:commentId - Delete a comment
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const userId = req.user!.id; // User is authenticated

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return sendResponse(res, false, null, 'Comment not found', STATUS_CODES.NOT_FOUND);
    }

    // Check if user owns the comment
    if (comment.userId !== userId) {
      return sendResponse(res, false, null, 'Not authorized to delete this comment', STATUS_CODES.FORBIDDEN);
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    return sendResponse(res, true, null, 'Comment deleted successfully', STATUS_CODES.OK);
  } catch (error: any) {
    return sendResponse(res, false, null, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

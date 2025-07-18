import { Router } from 'express';
import { createComment, getComments, deleteComment } from '../controllers/commentController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Routes for comments
router.post('/posts/:postId/comments', authenticate, createComment);
router.get('/posts/:postId/comments', getComments);
router.delete('/posts/:postId/comments/:commentId', authenticate, deleteComment);

export default router;

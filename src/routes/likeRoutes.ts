import { Router } from 'express';
import { toggleLike, getLikes } from '../controllers/likeController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Routes for likes
router.post('/posts/:postId/like', authenticate, toggleLike);
router.get('/posts/:postId/likes', getLikes);

export default router;

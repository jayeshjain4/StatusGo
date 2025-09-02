import { Router } from 'express';
import { createPost, getAllPosts, getPostsByCategory, searchPosts } from '../controllers/postController';
import { getPersonalizedPosts, getSuggestedPosts } from '../controllers/personalizedPostController';
import { authenticate } from '../middlewares/authMiddleware';
import { upload } from '../../middleware/upload';

const router = Router();

// POST /api/posts - upload photo or video
router.post('/', upload.single('attachment'), createPost);

// GET /api/posts/search - search posts
router.get('/search', searchPosts);

// GET /api/posts/personalized - get personalized posts (requires authentication)
router.get('/personalized', authenticate, getPersonalizedPosts);

// GET /api/posts/suggested - get suggested posts for users without preferences (requires authentication)
router.get('/suggested', authenticate, getSuggestedPosts);

// GET /api/posts - get all posts
router.get('/', getAllPosts);

// GET /api/posts/category/:categoryId - get posts by category
router.get('/category/:categoryId', getPostsByCategory);

export default router;

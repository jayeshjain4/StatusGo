import { Router } from 'express';
import { createPost, getAllPosts, getPostsByCategory, searchPosts } from '../controllers/postController';
import { upload } from '../../middleware/upload';

const router = Router();

// POST /api/post - upload photo or video
router.post('/', upload.single('attachment'), createPost);

// GET /api/post/search - search posts
router.get('/search', searchPosts);

// GET /api/post - get all posts
router.get('/', getAllPosts);

// GET /api/post/category/:categoryId - get posts by category
router.get('/category/:categoryId', getPostsByCategory);

export default router;

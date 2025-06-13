import { Router } from 'express';
import { createPost, getAllPosts } from '../controllers/postController';
import { upload } from '../../middleware/upload';

const router = Router();

// POST /api/post - upload photo or video
router.post('/', upload.single('attachment'), createPost);

// GET /api/post - get all posts
router.get('/', getAllPosts);

export default router;

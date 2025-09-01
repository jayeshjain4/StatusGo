import { Router } from 'express';
import authRoutes from './authRoutes';
import categoryRoutes from './categoryRoutes';
import postRoutes from './postRoutes';
import likeRoutes from './likeRoutes';
import commentRoutes from './commentRoutes';

const router = Router();

// Register all routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/posts', postRoutes);
router.use('/', likeRoutes);
router.use('/', commentRoutes);

export default router;
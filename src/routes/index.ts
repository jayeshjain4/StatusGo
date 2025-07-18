import { Router } from 'express';
import postRoutes from './postRoutes';
import likeRoutes from './likeRoutes';
import commentRoutes from './commentRoutes';

const router = Router();

// Register all routes
router.use('/', likeRoutes);
router.use('/', commentRoutes);
router.use('/post', postRoutes);

export default router;
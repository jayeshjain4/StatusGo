import { Router } from 'express';
import authRoutes from './auth.routes';
import postRoutes from './postRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/post', postRoutes);

export default router;
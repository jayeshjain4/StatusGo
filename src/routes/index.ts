import { Router } from 'express';
import postRoutes from './postRoutes';

const router = Router();


router.use('/post', postRoutes);

export default router;
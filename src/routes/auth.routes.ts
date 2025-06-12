import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller';
import { validateSignup, validateLogin } from '../middlewares/validation';
import { upload } from '../../middleware/upload';

const router = Router();

router.post('/signup', upload.single('profileImage'), validateSignup, signup);
router.post('/login', validateLogin, login);

export default router;
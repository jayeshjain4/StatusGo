import { Router } from 'express';
import { signup, login, getUserProfile, updateUserProfile, getAllUsers, syncFirebaseOtpUser } from '../controllers/auth.controller';
import { validateSignup, validateLogin } from '../middlewares/validation';
import { authenticate, isAdmin } from '../middlewares/authMiddleware';
import { upload } from '../../middleware/upload';

const router = Router();

// Public routes
router.post('/register', upload.single('profileImage'), validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/firebase-otp-login', syncFirebaseOtpUser);

// Protected routes (require authentication)
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, upload.single('profileImage'), updateUserProfile);

// Admin only routes
router.get('/users', authenticate, isAdmin, getAllUsers);

export default router;
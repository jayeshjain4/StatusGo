import { Router } from 'express';
import { signup, login, getUserProfile, updateUserProfile, getAllUsers, syncFirebaseOtpUser, setUserPreferences, getUserPreferences } from '../controllers/auth.controller';
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

// Preferences routes
router.post('/set-preferences', authenticate, setUserPreferences);
router.get('/get-preferences', authenticate, getUserPreferences);

// Admin only routes
router.get('/users', authenticate, isAdmin, getAllUsers);

export default router;
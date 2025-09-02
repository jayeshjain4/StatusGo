import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
  setUserPreferences,
  getUserPreferences,
  updatePreferenceWeight,
  removePreference
} from '../controllers/preferencesController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// POST /api/preferences - Set user category preferences
router.post('/', setUserPreferences);

// GET /api/preferences - Get user preferences
router.get('/', getUserPreferences);

// PUT /api/preferences/:categoryId/weight - Update preference weight for a category
router.put('/:categoryId/weight', updatePreferenceWeight);

// DELETE /api/preferences/:categoryId - Remove a category from preferences
router.delete('/:categoryId', removePreference);

export default router;

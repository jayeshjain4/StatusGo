import { Router } from 'express';
import { createCategory, deleteCategoryById, editCategoryById, getAllCateogories } from '../controllers/categoryController';
import { authenticate, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.post("/create-category", authenticate, isAdmin , createCategory);
router.put("/edit-category/:id", authenticate, isAdmin, editCategoryById);
router.delete("/delete-category/:id", authenticate, isAdmin, deleteCategoryById);

router.get("/get-allCategories", authenticate, getAllCateogories);

export default router;
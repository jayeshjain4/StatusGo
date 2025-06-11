import { Router, Request, Response } from 'express';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import STATUS_CODES from './utils/statusCodes';
import { sendResponse } from './utils/responseUtils';

const router = Router();

router.get("/", (req: Request, res: Response) => {
    sendResponse(res, true, null, "Server is running", STATUS_CODES.OK);
})

router.use("/auth", authRoutes);
router.use("/category", categoryRoutes);

export default router;
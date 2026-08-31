import { Router } from 'express';
import { updateProfile, updatePassword } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Protected settings routes
router.put('/profile', protect, updateProfile as any);
router.put('/password', protect, updatePassword as any);

export default router;

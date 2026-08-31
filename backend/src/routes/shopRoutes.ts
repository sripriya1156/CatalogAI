import { Router } from 'express';
import {
  createShop,
  getAllShops,
  getMyShops,
  getShopBySlug,
  getShopById,
  updateShop,
  deleteShop,
} from '../controllers/shopController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getAllShops);
router.get('/slug/:slug', getShopBySlug);

// Protected routes
router.get('/my', protect, getMyShops as any);
router.get('/:id', protect, getShopById as any);
router.post('/', protect, createShop as any);
router.put('/:id', protect, updateShop as any);
router.delete('/:id', protect, deleteShop as any);

export default router;

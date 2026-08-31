import { Router } from 'express';
import {
  createProduct,
  getProductsByShop,
  getProductById,
  updateProduct,
  deleteProduct,
  incrementViews,
  incrementClicks,
} from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/shop/:shopId', getProductsByShop);
router.get('/:id', getProductById);
router.post('/:id/view', incrementViews);
router.post('/:id/click', incrementClicks);

// Protected routes
router.post('/', protect, createProduct as any);
router.put('/:id', protect, updateProduct as any);
router.delete('/:id', protect, deleteProduct as any);

export default router;

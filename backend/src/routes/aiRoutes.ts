import { Router } from 'express';
import {
  generateDescription,
  improveDescription,
  generateTags,
  generateSEOMetadata,
  generateImage,
} from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';
import { aiLimiter } from '../middleware/aiLimiter';

const router = Router();

// Apply IP-based rate limiting on all AI assistant endpoints
router.use(aiLimiter);

// Protect all routes requiring authentication
router.post('/generate-description', protect, generateDescription as any);
router.post('/improve-description', protect, improveDescription as any);
router.post('/generate-tags', protect, generateTags as any);
router.post('/generate-seo', protect, generateSEOMetadata as any);
router.post('/generate-image', protect, generateImage as any);

export default router;

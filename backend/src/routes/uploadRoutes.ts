import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController';
import { protect } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.post('/', protect, upload.single('file'), uploadImage as any);

export default router;

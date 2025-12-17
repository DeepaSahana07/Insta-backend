import express from 'express';
import { register, login, getMe, verifyPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-password', verifyPassword);
router.get('/me', protect, getMe);

export default router;
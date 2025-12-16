import express from 'express';
import {
  getUserProfile,
  followUser,
  getSuggestedUsers,
  updateProfile,
  searchUsers,
  deleteAccount
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/profile/:username', protect, getUserProfile);
router.post('/follow/:userId', protect, followUser);
router.get('/suggested', protect, getSuggestedUsers);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);
router.get('/search', protect, searchUsers);
router.delete('/account', protect, deleteAccount);

export default router;
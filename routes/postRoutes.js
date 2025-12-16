import express from 'express';
import {
  createPost,
  getFeedPosts,
  getExplorePosts,
  likePost,
  commentOnPost,
  deletePost,
  getPost
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), createPost);
router.get('/feed', protect, getFeedPosts);
router.get('/explore', protect, getExplorePosts);
router.get('/:postId', protect, getPost);
router.post('/:postId/like', protect, likePost);
router.post('/:postId/comment', protect, commentOnPost);
router.delete('/:postId', protect, deletePost);

export default router;
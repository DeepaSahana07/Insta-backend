import Post from '../models/Post.js';
import User from '../models/User.js';

export const createPost = async (req, res) => {
  try {
    const { caption, location, imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    // Create post with image URL
    const post = await Post.create({
      user: req.user.id,
      image: imageUrl,
      caption: caption || '',
      location: location || ''
    });

    // Add post to user's posts array and increment count
    await User.findByIdAndUpdate(req.user.id, {
      $push: { posts: post._id },
      $inc: { postsCount: 1 }
    });

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username profilePicture fullName')
      .populate('likes', 'username profilePicture')
      .populate('comments.user', 'username profilePicture');

    res.status(201).json({ success: true, post: populatedPost });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFeedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const following = user.following;

    const posts = await Post.find({
      user: { $in: [...following, req.user.id] }
    })
    .populate('user', 'username profilePicture fullName')
    .populate('likes', 'username profilePicture')
    .populate('comments.user', 'username profilePicture')
    .sort({ createdAt: -1 }) // This ensures newest posts first
    .limit(50);

    res.json({ success: true, posts });
  } catch (error) {
    console.error('Get feed posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getExplorePosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username profilePicture fullName')
      .populate('likes', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({ success: true, posts });
  } catch (error) {
    console.error('Get explore posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      post.likes.pull(req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();

    res.json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      isLiked: !isLiked,
      likesCount: post.likes.length
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user.id,
      text,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'username profilePicture');

    const newComment = populatedPost.comments[populatedPost.comments.length - 1];

    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    console.error('Comment on post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Verify ownership
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Remove post from user's posts array and decrement count
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { posts: post._id },
      $inc: { postsCount: -1 }
    });

    await Post.findByIdAndDelete(req.params.postId);

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('user', 'username profilePicture fullName')
      .populate('likes', 'username profilePicture')
      .populate('comments.user', 'username profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ success: true, post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
import User from '../models/User.js';
import Post from '../models/Post.js';
import cloudinary from '../config/cloudinary.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username profilePicture fullName')
      .populate('following', 'username profilePicture fullName');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get only posts created by this specific user
    const userPosts = await Post.find({ user: user._id })
      .populate('user', 'username profilePicture fullName')
      .populate('likes', 'username')
      .populate('comments.user', 'username profilePicture')
      .sort({ createdAt: -1 });

    // Add posts to user object
    const userWithPosts = {
      ...user.toObject(),
      posts: userPosts
    };

    res.json({ success: true, user: userWithPosts });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(userToFollow._id);
      userToFollow.followers.pull(currentUser._id);
      currentUser.followingCount = Math.max(0, (currentUser.followingCount || 0) - 1);
      userToFollow.followersCount = Math.max(0, (userToFollow.followersCount || 0) - 1);
    } else {
      // Follow
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
      currentUser.followingCount = (currentUser.followingCount || 0) + 1;
      userToFollow.followersCount = (userToFollow.followersCount || 0) + 1;
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      success: true,
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing,
      currentUserFollowingCount: currentUser.followingCount,
      targetUserFollowersCount: userToFollow.followersCount
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const following = currentUser.following;

    const suggestedUsers = await User.find({
      _id: { $nin: [...following, req.user.id] }
    })
    .select('username fullName profilePicture followers')
    .limit(5);

    res.json({ success: true, users: suggestedUsers });
  } catch (error) {
    console.error('Get suggested users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, username } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    let profilePicture = user.profilePicture;

    // Upload new profile picture if provided
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'instagram-clone/profiles' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      const uploadResult = await uploadPromise;
      profilePicture = uploadResult.secure_url;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName: fullName || user.fullName,
        bio: bio || user.bio,
        username: username || user.username,
        profilePicture
      },
      { new: true }
    ).select('-password');

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    let users;
    
    if (!query || query.trim() === '') {
      // Return all users for account switching
      users = await User.find({})
        .select('username fullName profilePicture email followers')
        .limit(20);
    } else {
      // Search users by query
      users = await User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { fullName: { $regex: query, $options: 'i' } }
        ]
      })
      .select('username fullName profilePicture email followers')
      .limit(10);
    }

    res.json({ success: true, users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete all posts by this user
    await Post.deleteMany({ user: userId });
    
    // Remove user from followers/following lists of other users
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId }, $inc: { followersCount: -1 } }
    );
    
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId }, $inc: { followingCount: -1 } }
    );
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
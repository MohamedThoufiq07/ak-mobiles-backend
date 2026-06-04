const User = require('../models/User');

// @desc    Get all users (admin)
// @route   GET /api/users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (admin)
// @route   GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById };

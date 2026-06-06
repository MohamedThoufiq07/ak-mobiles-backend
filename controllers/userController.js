const User = require('../models/User');

// @desc    Get all users (admin)
// @route   GET /api/users
const getAllUsers = async (req, res, next) => {
  try {
    const pageNum = Number(req.query.page) || 1;
    const limitNum = Number(req.query.limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const query = { role: 'user' };
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      users,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
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

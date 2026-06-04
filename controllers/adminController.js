const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    const revenueResult = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // Order status breakdown
    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    // Monthly revenue (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalOrders,
        totalProducts,
        totalRevenue,
        recentOrders,
        statusBreakdown,
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales report
// @route   GET /api/admin/reports/sales
const getSalesReport = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;

    let groupBy;
    let startDate = new Date();

    if (period === 'daily') {
      startDate.setDate(startDate.getDate() - 30);
      groupBy = {
        day: { $dayOfMonth: '$createdAt' },
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' },
      };
    } else {
      startDate.setMonth(startDate.getMonth() - 12);
      groupBy = {
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' },
      };
    }

    const salesData = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
          items: { $sum: { $size: '$orderItems' } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    res.status(200).json({ success: true, salesData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top selling products
// @route   GET /api/admin/reports/top-products
const getTopSellingProducts = async (req, res, next) => {
  try {
    const topProducts = await Product.find()
      .sort({ numSold: -1 })
      .limit(10)
      .select('name brand offerPrice numSold images');

    res.status(200).json({ success: true, products: topProducts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getSalesReport,
  getTopSellingProducts,
};

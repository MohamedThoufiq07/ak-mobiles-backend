const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSalesReport,
  getTopSellingProducts,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/reports/sales', getSalesReport);
router.get('/reports/top-products', getTopSellingProducts);

module.exports = router;

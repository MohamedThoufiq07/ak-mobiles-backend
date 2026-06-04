const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

// All order routes require authentication
router.use(protect);

router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/stats', admin, getOrderStats);
router.get('/:id', getOrderById);

// Admin routes
router.get('/', admin, getAllOrders);
router.put('/:id/status', admin, updateOrderStatus);

module.exports = router;

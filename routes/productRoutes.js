const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getTopProducts,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

// Public routes (order matters — specific routes before :id)
router.get('/featured', getFeaturedProducts);
router.get('/top', getTopProducts);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);

// Protected routes
router.post('/:id/reviews', protect, createReview);

// Admin routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;

const Product = require('../models/Product');

// @desc    Get all products with filters, sorting, and pagination
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const {
      brand,
      category,
      minPrice,
      maxPrice,
      ram,
      storage,
      rating,
      sort,
      search,
      keyword,
      page = 1,
      limit = 12,
    } = req.query;

    const searchVal = search || keyword;

    let query = {};

    // Filter by brand
    if (brand) {
      query.brand = { $in: brand.split(',') };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.offerPrice = {};
      if (minPrice) query.offerPrice.$gte = Number(minPrice);
      if (maxPrice) query.offerPrice.$lte = Number(maxPrice);
    }

    // Filter by RAM
    if (ram) {
      query['specifications.ram'] = { $in: ram.split(',') };
    }

    // Filter by Storage
    if (storage) {
      query['specifications.storage'] = { $in: storage.split(',') };
    }

    // Filter by rating
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Search by name or brand
    if (searchVal) {
      query.$or = [
        { name: { $regex: searchVal, $options: 'i' } },
        { brand: { $regex: searchVal, $options: 'i' } },
        { description: { $regex: searchVal, $options: 'i' } },
      ];
    }

    // Sort options
    let sortQuery = {};
    switch (sort) {
      case 'price_low':
        sortQuery = { offerPrice: 1 };
        break;
      case 'price_high':
        sortQuery = { offerPrice: -1 };
        break;
      case 'popular':
        sortQuery = { numSold: -1 };
        break;
      case 'rating':
        sortQuery = { rating: -1 };
        break;
      case 'newest':
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8);
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top rated products
// @route   GET /api/products/top
const getTopProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(8);
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related products (same brand or category)
// @route   GET /api/products/:id/related
const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const related = await Product.find({
      _id: { $ne: product._id },
      $or: [{ brand: product.brand }, { category: product.category }],
    }).limit(5);

    res.status(200).json({ success: true, products: related });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (admin)
// @route   POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product.',
      });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ success: true, message: 'Review added' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getTopProducts,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
};

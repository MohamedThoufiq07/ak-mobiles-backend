const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Smartphones', 'Accessories', 'Smart Watches', 'Earbuds', 'Chargers', 'Power Banks'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    highlights: [String],
    specifications: {
      processor: String,
      ram: String,
      storage: String,
      display: String,
      camera: String,
      battery: String,
      os: String,
      connectivity: String,
      weight: String,
      colors: String,
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: '' },
      },
    ],
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
    },
    offerPrice: {
      type: Number,
      required: [true, 'Offer price is required'],
    },
    discount: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    flashSale: {
      type: Boolean,
      default: false,
    },
    numSold: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate discount percentage before saving
productSchema.pre('save', function (next) {
  if (this.originalPrice && this.offerPrice) {
    this.discount = Math.round(
      ((this.originalPrice - this.offerPrice) / this.originalPrice) * 100
    );
  }
  next();
});

// Text index for search
productSchema.index({ name: 'text', brand: 'text', description: 'text' });

// Indexes for the storefront filters & sorts (getProducts) — these turn
// full-collection scans into index lookups as the catalog grows.
productSchema.index({ brand: 1 });
productSchema.index({ category: 1 });
productSchema.index({ offerPrice: 1 });   // price filter + price sort
productSchema.index({ rating: -1 });      // rating filter + rating sort
productSchema.index({ numSold: -1 });     // "popular" sort
productSchema.index({ discount: -1 });    // discount filter
productSchema.index({ createdAt: -1 });   // default "newest" sort
productSchema.index({ isFeatured: 1 });   // featured products query
productSchema.index({ flashSale: 1 });     // flash sale products query

module.exports = mongoose.model('Product', productSchema);

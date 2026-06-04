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

module.exports = mongoose.model('Product', productSchema);

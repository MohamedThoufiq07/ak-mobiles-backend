const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    shippingAddress: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    paymentInfo: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending',
      },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
    statusHistory: [
      {
        status: String,
        date: { type: Date, default: Date.now },
        description: String,
      },
    ],
    estimatedDelivery: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Set estimated delivery (5 days from order)
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    this.statusHistory.push({
      status: 'Placed',
      date: new Date(),
      description: 'Order has been placed successfully',
    });
  }
  next();
});

// Indexes for order lookups
orderSchema.index({ user: 1, createdAt: -1 }); // getMyOrders: filter by user, sort newest
orderSchema.index({ orderStatus: 1 });         // admin filter by status
orderSchema.index({ createdAt: -1 });          // admin list + stats by date

module.exports = mongoose.model('Order', orderSchema);

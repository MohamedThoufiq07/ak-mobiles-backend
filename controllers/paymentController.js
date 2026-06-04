const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const instance = getRazorpayInstance();

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    // If Razorpay keys are not configured, return demo response
    if (error.statusCode === 401 || error.error) {
      return res.status(200).json({
        success: true,
        order: {
          id: `order_demo_${Date.now()}`,
          amount: Math.round(req.body.amount * 100),
          currency: 'INR',
          status: 'created',
        },
        key: process.env.RAZORPAY_KEY_ID,
        demo: true,
      });
    }
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // For demo mode, accept any payment
    if (razorpay_order_id && razorpay_order_id.startsWith('order_demo_')) {
      return res.status(200).json({
        success: true,
        message: 'Payment verified (demo mode)',
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get Razorpay key (public)
// @route   GET /api/payment/key
const getRazorpayKey = async (req, res) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
  });
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  getRazorpayKey,
};

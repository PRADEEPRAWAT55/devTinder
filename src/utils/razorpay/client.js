const razorpay = require("razorpay");

const razorpayClient = new razorpay({
  key_id: process.env.ROZERPAY_KEY_ID,
  key_secret: process.env.ROZERPAY_KEY_SECRET,
});

module.exports = razorpayClient;



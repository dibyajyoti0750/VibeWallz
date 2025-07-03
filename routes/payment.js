const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const { isLoggedIn } = require("../middleware");

const razorpay = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET,
});

router.post("/order", isLoggedIn, async (req, res) => {
  try {
    const user = req.user;
    const amountInPaise = 2900; // ₹29 = 2900 paise
    const currency = "INR";
    const receipt = `rcpt_${user._id.toString().slice(-6)}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      payment_capture: 1,
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: amountInPaise,
      currency,
      key: process.env.RZP_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    res.status(500).json({ success: false, message: "Payment order failed" });
  }
});

module.exports = router;

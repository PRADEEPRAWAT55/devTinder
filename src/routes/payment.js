const razorpayClient = require("../utils/razorpay/client");
const express = require("express");
const { Payment } = require("../model/payment");
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')


const paymentRouter = express.Router();

paymentRouter.post("/create-order", async (req, res) => {
    try {
        const { amount = 100, currency = `INR`, receipt = `receipt#1` } = req.body;
        const options = {
            amount: amount * 100,
            currency,
            receipt,
            notes: {
                username: req.user.firstName + " " + !!req.user.lastName,
                memberShip: "premium"
            }
        };

        const order = await razorpayClient.orders.create(options);

        const payment = new Payment({
            userId: req.user._id,
            amount: order.amount / 100,
            currency: order.currency,
            orderId: order.id,
            status: order.status,
            notes: order.notes,
        });

        const result = await payment.save();

        res.status(201).json({ result, key: process.env.RAZORPAY_KEY_ID, message: "Order created successfully" });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

paymentRouter.post("/verify-payment", async (req, res) => {
    try {
        const { userId, amount, currency, orderId, status, notes } = req.body;

        const webhookSignature = req.headers['x-razorpay-signature'];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const webhookBody = req.body;


        const isValid = validateWebhookSignature(JSON.stringify(webhookBody), webhookSignature, webhookSecret)

        if (!isValid) {
            return res.status(400).json({ message: "Invalid webhook signature" });
        }
        const paymentDetails = req.body.payload.payment.entity;

        const payment = Payment.findOne({ orderId: paymentDetails.order_id });
        if (!payment) {
            return res.status(404).json({ message: "Payment record not found" });
        }

        payment.status = paymentDetails.status;
        payment.paymentId = paymentDetails.id;
        payment.method = paymentDetails.method;
        payment.updatedAt = new Date();


        const result = await payment.save();


        const user = await User.findById(userId);
        if (user) {
            user.isPremium = true;
            await user.save();
        }

        res.status(201).json({ message: "Payment recorded successfully", paymentId: result._id });
    } catch (error) {
        console.error("Error recording payment:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

module.exports = paymentRouter;
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

        res.status(201).json({ result, message: "Order created successfully" });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

paymentRouter.post("/verify-payment", async (req, res) => {
    try {
        const { userId, amount, currency, orderId, status, notes } = req.body;

        const webhookSignature = req.headers['x-razorpay-signature'];
        const webhookSecret = process.env.ROZERPAY_KEY_SECRET;
        const webhookBody = req.body;


        validateWebhookSignature(JSON.stringify(webhookBody), webhookSignature, webhookSecret)


        const payment = new Payment({
            userId,
            amount,
            currency,
            orderId,
            status,
            notes,
        });

        const result = await payment.save();
        res.status(201).json({ message: "Payment recorded successfully", paymentId: result._id });
    } catch (error) {
        console.error("Error recording payment:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

module.exports = paymentRouter;
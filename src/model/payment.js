const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    orderId: { type: String, required: true },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    notes:{
        type: Object, default: {}
    }
    
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = { Payment };
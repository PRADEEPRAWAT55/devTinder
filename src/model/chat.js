const mongoose = require('mongoose');
const { Schema } = mongoose;

const messages = new Schema({
    senderId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    read: { type: Boolean, default: false },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});


const chatMessageSchema = new Schema({
    roomId: { type: String, required: true },
    message: [messages],
});


const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = { ChatMessage };
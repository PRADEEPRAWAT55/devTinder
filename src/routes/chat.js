const { ChatMessage } = require("../model/chat")
const express = require('express');

const chatRouter = express.Router();

chatRouter.get('/:roomId', async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const { roomId } = req.params;
    try {
        const chat = await ChatMessage.findOne({ roomId }).select('message').slice('message', [skip, parseInt(limit)]);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        res.status(200).json({ messages: chat.message });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = chatRouter;
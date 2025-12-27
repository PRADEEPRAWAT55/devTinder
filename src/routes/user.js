const express = require('express');

const { ConnectionRequest } = require('../model/connection');
const { User } = require('../model/user');

const userRouter = express.Router();


userRouter.get('/connections', async (req, res) => {
    const recipient = req.user._id;
    try {
        const connectionRequest = await ConnectionRequest.find({ $or: [{ requester: recipient }, { recipient: recipient }], status: 'accepted' }).populate('requester', '-password -emailId').populate('recipient', '-password -emailId');
        if (!connectionRequest) {
            return res.status(404).json({ message: 'Connection request not found.' });
        }

        res.status(200).json({ connectionRequest });
    } catch (error) {
        console.error('Error fetching connection request:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

userRouter.get('/requests', async (req, res) => {
    const recipient = req.user._id;
    try {
        const connectionRequests = await ConnectionRequest.find({ recipient, status: 'interested' }).populate('requester', '-password -emailId');
        res.status(200).json({ connectionRequests });
    } catch (error) {
        console.error('Error fetching connection requests:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


userRouter.get('/feed', async (req, res) => {
    const userId = req.user._id;
    const {page = 1, limit = 10} = req.query;
    const skip = (page - 1) * limit;
    try {
        const sentRequests = await ConnectionRequest.find({ $or: [{ requester: userId }, { recipient: userId }]}).select('recipient requester');
        const sentRecipientIds = sentRequests.map(request => request.recipient);
        const feedUsers = await User.find({ _id: { $ne: userId, $nin: sentRecipientIds } }).select('-password -emailId').skip(parseInt(skip)).limit(parseInt(limit));
        res.status(200).json({ feed: feedUsers });
    } catch (error) {
        console.error('Error fetching feed users:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = userRouter;
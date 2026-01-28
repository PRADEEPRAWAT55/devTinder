const express = require('express');

const { ConnectionRequest } = require('../model/connection');
const { User } = require('../model/user');

const userRouter = express.Router();


userRouter.get('/connections', async (req, res) => {
    const userId = req.user._id;
    try {
        const connections = await ConnectionRequest.find({
            $or: [
                { requester: userId, status: 'accepted' },
                { recipient: userId, status: 'accepted' }
            ]
        }).populate('requester', '-password -emailId').populate('recipient', '-password -emailId');
        
        if (!connections || connections.length === 0) {
            return res.status(200).json({ connections: [] });
        }

        res.status(200).json({ connections });
    } catch (error) {
        console.error('Error fetching connections:', error);
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
        // Find all requests where current user is involved (sent or received)
        const requests = await ConnectionRequest.find({
            $or: [
                { requester: userId },
                { recipient: userId }
            ]
        }).select('requester recipient');

        // Extract user IDs to exclude
        const excludedUserIds = new Set();
        excludedUserIds.add(userId.toString());
        
        requests.forEach(req => {
            excludedUserIds.add(req.requester.toString());
            excludedUserIds.add(req.recipient.toString());
        });

        // Get feed with pagination
        const feedUsers = await User.find({ 
            _id: { $nin: Array.from(excludedUserIds) } 
        }).select('-password -emailId').skip(parseInt(skip)).limit(parseInt(limit));
        
        res.status(200).json({ feed: feedUsers });
    } catch (error) {
        console.error('Error fetching feed users:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = userRouter;
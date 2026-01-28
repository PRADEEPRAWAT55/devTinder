const express = require('express');
const { ConnectionRequest } = require('../model/connection');
const { sendEmail } = require('../utils/ses/sendEmail');

const User = require('../model/user').User;


const requestRouter = express.Router();


requestRouter.post('/:status/:userId', async (req, res, next) => {
    const sender = req.user._id;
    const { userId: recipient } = req.params;
    const { status } = req.params;
    const { message } = req.body; // Get optional message from request body
    
    try {
        // Validate sender and recipient are different
        if (sender.toString() === recipient.toString()) {
            return res.status(400).json({ message: 'Cannot send connection request to yourself.' });
        }

        const recipientUser = await User.findById(recipient);
        if (!recipientUser) {
            return res.status(404).json({ message: 'Recipient user not found.' });
        }

        const STATUS_ALLOWED = ['ignore', 'interested'];
        if (!STATUS_ALLOWED.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        // Check if request already exists (in any direction)
        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { requester: sender, recipient: recipient },
                { requester: recipient, recipient: sender }
            ]
        });

        if (existingRequest) {
            if (existingRequest.status === 'accepted') {
                return res.status(400).json({ message: 'Users are already connected.' });
            } else if (existingRequest.status === 'interested') {
                return res.status(400).json({ message: 'A connection request already exists between you.' });
            } else if (existingRequest.status === 'rejected') {
                return res.status(400).json({ message: 'You have already rejected this user. Cannot send request again.' });
            }
        }

        // If status is ignore, don't create a request, just return success
        if (status === 'ignore') {
            return res.status(200).json({ message: 'User ignored.' });
        }

        // Create new request with status 'interested'
        const newRequest = new ConnectionRequest({
            requester: sender,
            recipient: recipient,
            status: 'interested',
            message: message || null // Store message if provided
        });

        // Check for match - if recipient has already sent interested request to sender
        const matchingRequest = await ConnectionRequest.findOne({
            requester: recipient,
            recipient: sender,
            status: 'interested'
        });

        if (matchingRequest) {
            // It's a match! Accept both requests
            await newRequest.save();
            await ConnectionRequest.findByIdAndUpdate(
                matchingRequest._id,
                {
                    status: 'accepted',
                    matchedBy: sender,
                    matchedAt: new Date()
                }
            );
            
            // Send match notification email (non-blocking)
            try {
                if (recipientUser.emailId) {
                    sendEmail('It\'s a Match!', `You and ${req.user.firstName} have matched! Start chatting now.`, recipientUser.emailId);
                }
            } catch (emailError) {
                console.warn('Email notification failed:', emailError.message);
            }
            
            return res.status(200).json({ message: 'It\'s a match! Connection established.', isMatch: true });
        }

        // No match, just save the request
        await newRequest.save();
        
        // Send email notification (non-blocking)
        try {
            if (recipientUser.emailId) {
                sendEmail('New Connection Request', `${req.user.firstName} is interested in connecting with you!`, recipientUser.emailId);
            }
        } catch (emailError) {
            console.warn('Email notification failed:', emailError.message);
            // Don't fail the request if email fails
        }
        
        return res.status(200).json({ message: 'Connection request sent successfully.', isMatch: false });
    } catch (error) {
        console.error('Error sending connection request:', error);
        return res.status(500).json({ message: 'Error sending connection request.', error: error.message });
    }
});


requestRouter.post('/review/:status/:requestId', async (req, res) => {
    const recipient = req.user._id;
    const { requestId, status } = req.params;

    try {
        const STATUS_ALLOWED = ['accepted', 'rejected'];
        if (!STATUS_ALLOWED.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        // Validate ObjectId format
        if (!requestId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid request ID format.' });
        }

        const connectionRequest = await ConnectionRequest.findOne({ 
            _id: requestId, 
            recipient: recipient, 
            status: 'interested' 
        });
        
        if (!connectionRequest) {
            return res.status(404).json({ message: 'Connection request not found or already reviewed.' });
        }

        connectionRequest.status = status;
        if (status === 'accepted') {
            connectionRequest.matchedBy = recipient;
            connectionRequest.matchedAt = new Date();
        }
        await connectionRequest.save();

        return res.status(200).json({ 
            message: `Connection request ${status}.`,
            requestId: connectionRequest._id
        });
    } catch (error) {
        console.error('Error reviewing connection request:', error);
        return res.status(500).json({ message: 'Error reviewing connection request.', error: error.message });
    }
});







module.exports = requestRouter;



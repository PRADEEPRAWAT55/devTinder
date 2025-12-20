const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { ConnectionRequest } = require('../model/connection');

const User = require('../model/user').User;


const requestRouter = express.Router();


requestRouter.post('/:status/:userId', async (req, res, next) => {
    const sender = req.user._id;
    const { userId: recipient } = req.params;
    try {
        const recipientUser = await User.findById(recipient);
        if (!recipientUser) {
            return res.status(404).json({ message: 'Recipient user not found.' });
        }

        const STATUS_ALLOWED = ['ignore', 'interested'];
        if (!STATUS_ALLOWED.includes(req.params.status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        const newRequest = new ConnectionRequest({
            requester: sender,
            recipient: recipient,
            status: req.params.status
        });

        const alreadyConnected = await newRequest.alreadyConnected();
        if (alreadyConnected) {
            return res.status(400).json({ message: 'Connection request already exists or users are already connected.' });
        }
        const itsMatch = await newRequest.itsMatch();
        if (itsMatch) {
            await ConnectionRequest.findOneAndUpdate(
                { requester: recipient, recipient: sender, status: 'interested' },
                {
                    status: 'accepted',
                    matchedBy: sender,
                    matchedAt: new Date()
                }
            );
            return res.status(200).json({ message: 'It\'s a match! Connection request accepted.' });
        }

        await newRequest.save();
        return res.status(200).json({ message: 'Connection request sent as interested.' });
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

        const connectionRequest = await ConnectionRequest.findById(requestId);
        if (!connectionRequest) {
            return res.status(404).json({ message: 'Connection request not found.' });
        }
        if(connectionRequest.status !== 'interested'){
            return  res.status(400).json({ message: `Connection request already reviewed with status: ${connectionRequest.status}.` });
        }
        if(connectionRequest.status === 'ignore'){
            return  res.status(400).json({ message: `Connection request was ignored by Sender.` });
        }

        if (connectionRequest.recipient.toString() !== recipient.toString()) {
            return res.status(403).json({ message: 'You are not authorized to review this connection request.' });
        }

        connectionRequest.status = status;  
        if (status === 'accepted') {
            connectionRequest.matchedBy = recipient;
            connectionRequest.matchedAt = new Date();
        }
        await connectionRequest.save();

        return res.status(200).json({ message: `Connection request ${status}.` });
    } catch (error) {
        return res.status(500).json({ message: 'Error reviewing connection request.', error: error.message });
    }


});







module.exports = requestRouter;



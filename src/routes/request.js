const express = require('express');
const { ConnectionRequest } = require('../model/connection');
const { sendEmail } = require('../utils/ses/sendEmail');

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
            return res.status(400).json({ message: 'Connection request already exists or users are already connected or interested.' });
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

        sendEmail();
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

        const connectionRequest = await ConnectionRequest.findOne({ _id: requestId, recipient, status: 'interested' });
        if (!connectionRequest) {
            return res.status(404).json({ message: 'Connection request not found.' });
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



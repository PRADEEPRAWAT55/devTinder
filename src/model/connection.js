const mongoose = require('mongoose');

const connectionRequest = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String, enum: {
            values: ['ignore', 'interested', 'accepted', 'rejected'],
            message: 'Status is either: ignore, interested, accepted, or rejected'
        },
        required: true
    },
    message: { type: String, default: null }, // Optional message from requester
    matchedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    matchedAt: { type: Date },
}, { timestamps: true });


connectionRequest.methods.alreadyConnected = async function () {
    const existingConnection = await ConnectionRequest.findOne({
        $or: [
            { requester: this.requester, recipient: this.recipient },
            { requester: this.recipient, recipient: this.requester }
        ],
        status: { $in: ['accepted' , 'interested'] }
    });
    return !!existingConnection;
};

connectionRequest.methods.itsMatch = async function () {
    const match = await ConnectionRequest.findOne({
        requester: this.recipient,
        recipient: this.requester,
        status: 'interested'
    });
    return match;
}

connectionRequest.pre('save', async function (next) {
   if (this.requester.toString() === this.recipient.toString()) {
        throw new Error('Users cannot send connection requests to themselves.');
    }
});

const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequest);

module.exports = {
    ConnectionRequest
}
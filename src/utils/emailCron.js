const cron = require('node-cron');
const { ConnectionRequest } = require('../model/connection');
const { Queue } = require('bullmq');
const { connection } = require('../redis/redis');

const emailQueue = new Queue('emailQueue', {
    connection: connection
});

cron.schedule('51 12 * * *', async () => {

    try {
        console.log('🕙 Starting daily email for users about their admirers...');


        const allInterestedRequests = await ConnectionRequest.find({ status: 'interested' }).populate('recipient', '-password').populate('requester', 'firstName lastName');

        const recipientEmails = new Map();
        allInterestedRequests.forEach(request => {
            if (request.recipient && request.recipient.emailId && request.requester) {
                const email = request.recipient.emailId;
                const recipientName = request.recipient.firstName + " " + request.recipient.lastName;
                const requesterName = request.requester.firstName + " " + request.requester.lastName;

                if (!recipientEmails.has(email)) {
                    recipientEmails.set(email, {
                        name: recipientName,
                        admirers: []
                    });
                }
                recipientEmails.get(email).admirers.push(requesterName);
            }
        });


        for (const [email, data] of recipientEmails) {
            const subject = `💕 ${data.admirers.length} people are interested in you!`;
            const body = `Hi ${data.name}! 👋\n\nGreat news! These people have shown interest in you:\n\n${data.admirers.map(person => `💖 ${person}`).join('\n')}\n\nLogin to DevTinder to respond!\n\nYour DevTinder Team 🚀`;

            try {
                const response = await emailQueue.add('sendEmail', { subject, body });
                console.log(`✅ Email queued for ${data.name} about ${data.admirers.length} admirers`);
            } catch (error) {
                console.error(`Failed to queue email to ${email}:`, error.message);
            }
        }

    } catch (error) {
        console.error("Error sending daily reminder email:", error);
    }
});


module.exports = { emailQueue };


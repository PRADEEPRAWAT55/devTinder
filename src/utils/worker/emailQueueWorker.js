const { Worker } = require('bullmq');
const { sendEmail } = require('../ses/sendEmail');
const connection = require('../../redis/redis');
const {Queue} = require("bullmq");

const failedEmailQueue = new Queue('failedEmailQueue', {
    connection
});

const emailQueueWorker = new Worker('emailQueue', async job => {
    if (job.name === 'sendEmail') {
        const { subject, body } = job.data;
        try {
            await sendEmail(subject, body);  // ses email sending
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }
},{connection});

emailQueueWorker.on('completed', job => {
    console.log(`Job ${job.id} has completed!`); // You can add additional logic here if needed
});

emailQueueWorker.on('failed', (job, err) => {
    failedEmailQueue.add('failedEmail', {
        subject: job.data.subject,
        body: job.data.body,
        reason: err.message
    });
    console.error(`Job ${job.id} has failed with error: ${err.message}`);
});

module.exports = { emailQueueWorker };
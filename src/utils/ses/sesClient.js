const { SESClient } = require("@aws-sdk/client-ses");

const accessKeyId = process.env.SES_ACCESS_KEY;
const secretAccessKey = process.env.SES_SECRET_KEY;


const sesClient = new SESClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

module.exports = sesClient;
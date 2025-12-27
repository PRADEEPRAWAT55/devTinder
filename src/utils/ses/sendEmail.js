const {
  SendEmailCommand,
} = require("@aws-sdk/client-ses");
const sesClient = require("./sesClient");

async function sendEmail(Subject, Body, toAddress = "pbhaumik200@gmail.com") {
  const command = new SendEmailCommand({
    Source: "pradeep2000rawat@gmail.com",
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Subject: {
        Data: Subject,
        Charset: "UTF-8",
      },
      Body: {
        Text: {
          Data: Body,
          Charset: "UTF-8",
        },
      },
    },
  });

  try {
    const response = await sesClient.send(command);
    console.log("Email sent:", response.MessageId);
  } catch (error) {
    console.error("SES error:", error);
  }
}

module.exports = { sendEmail };
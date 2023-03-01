
require("dotenv").config();
const axios = require("axios");
const { generateConfig } = require("./utils");
const { google } = require("googleapis");
const fs = require("fs");

//credentials configuration
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const Mail = require("../database/models/devicedata");
const fetchMail = async (url) => {
  const { token } = await oAuth2Client.getAccessToken();
  const config = generateConfig(url, token);
  const response = await axios(config);
  return response;
};


async function getMails(email) {
    var returnObj = {};
    try {
      const url = `https://gmail.googleapis.com/gmail/v1/users/testmailpush2@gmail.com/messages?q=from:${email}`;
      const { token } = await oAuth2Client.getAccessToken();
      const config = generateConfig(url, token);
      const response = await axios(config);
      const messages = response.data.messages || [];
      console.log(`Found ${messages.length} messages:`);
      // console.log(messages);
      for (const message of messages) {
        returnObj = {};
        // console.log("uniqueMessageId:" + message.id);
        returnObj["uniqueMessageId"] = message.id;
        try {
          const messageResponse = await fetchMail(
            `https://gmail.googleapis.com/gmail/v1/users/testmailpush2@gmail.com/messages/${message.id}`
          );
        }catch(e) {
          console.log("Error handled success" + e);
        }
  
        const Subject = messageResponse.data.payload.headers.find(
          (header) => header.name === "Subject"
        ).value;
        returnObj["subject"] = Subject;
        // console.log("subject:" + Subject);
  
        const deviceId = messageResponse.data.payload.headers.find(
          (header) => header.name === "From"
        ).value;
        returnObj["deviceId"] = /<(.+)>/.exec(deviceId)[1];
        // console.log("deviceId:" + deviceId);
  
        const MessageSnippet = messageResponse.data.snippet;
        returnObj["message"] = MessageSnippet;
  
        const parts = messageResponse.data.payload.parts || [];
        // Date of the Message
        const messageDate = new Date(
          parseInt(messageResponse.data.internalDate, 10)
        ).toLocaleString();
  
        returnObj["date"] = messageDate;
        // console.log("Date:" + messageDate);
  
        // Loop through all parts of the message payload
        for (const part of parts) {
          if (part.filename && part.body && part.body.attachmentId) {
            const attachmentResponse = await fetchMail(
              `https://www.googleapis.com/gmail/v1/users/testmailpush2@gmail.com/messages/${message.id}/attachments/${part.body.attachmentId}`
            );
  
            // console.log(`Attachment filename: ${part.filename}`);
            const fileName = part.filename;
            returnObj["fileName"] = `${message.id + fileName}`;
            const folderPath = "../public/images";
            const base64Data = attachmentResponse.data.data;
  
            const buffer = Buffer.from(base64Data, "base64");
  
            if (!fs.existsSync(folderPath)) {
              fs.mkdirSync(folderPath);
            }
  
            fs.writeFile(
              `${folderPath}/${message.id + fileName}`,
              buffer,
              (err) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log(`${message.id + fileName} saved to folder`);
                }
              }
            );
          }
        }
  
        console.log("-----------------------");
        console.log(returnObj);
        await Mail.findOneAndUpdate(
          { uniqueMessageId: returnObj.uniqueMessageId },
          { $setOnInsert: returnObj },
          { upsert: true, new: true }
        ).exec();

        var data = JSON.stringify({
          img_path: `${folderPath}/${message.id + fileName}`,
        });
    
        var ml_config = {
          method: "post",
          url: "http://127.0.0.1:5000/iot-image-processing",
          headers: {
            "Content-Type": "application/json",
          },
          data: data,
        };
    
        axios(ml_config)
          .then(function (response) {
            console.log(JSON.stringify(response.data));
          })
          .catch(function (error) {
            console.log(error);
          });
      }
      
  
      mongoose.connection.close();
    } catch (error) {
      console.log(error);
    }
  }


fetchMail("igcatisb@gmail.com");
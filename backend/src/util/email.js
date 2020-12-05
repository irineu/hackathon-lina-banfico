import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

AWS.config.update({region: 'us-east-1'});
  
const sendMail =  async (toAddr, htmlMessage, txtMessage, subject) => {

    var params = {
        Destination: { /* required */
            CcAddresses: [
            //'EMAIL_ADDRESS',
            ],
            ToAddresses: [
                toAddr
            ]
        },
        Message: {
            Body: {
            Html: {
                Charset: "UTF-8",
                Data: htmlMessage
            },
            Text: {
                Charset: "UTF-8",
                Data: txtMessage
            }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
        },
        Source: 'irineu@irineuantunes.com',
        ReplyToAddresses: [
            //'EMAIL_ADDRESS',
            /* more items */
        ],
    };

    var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

    return sendPromise;
}

export default sendMail;

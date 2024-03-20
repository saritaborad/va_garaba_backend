const admin = require('firebase-admin');
const allConfig = require('../config/allconfig.js');
const { logger } = require('../utilis/logger.js');
const FUNCTIONALIST = require('../helper/functions.js');
var serviceAccount = require("../config/serviceAccountKey.json");
let PENDINGNOTIFICATIONMODAL = require('../models/pendingnotification.js');
let USERMODAL = require('../models/users.model.js');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const sendNotification = async ({ fcmToken, body = 'Notification Body', title = 'Notification Title', userid = '', eventtype = '' }) => {
    let findUaseData = userid ? await USERMODAL.findOne({ _id: userid, is_deleted: false }) : '';
    const message = {
        ...(findUaseData && findUaseData.ios_device && {
            notification: {
                title,
                body,
            },
            data: {
                time: FUNCTIONALIST.currentTime(),
                date: FUNCTIONALIST.currentDate(),
            }
        }),
        ...(eventtype && {
            data: {
                eventType: eventtype
            },
        }),
        ...(findUaseData && findUaseData.android_device && {
            data: {
                title,
                body,
                time: FUNCTIONALIST.currentTime(),
                date: FUNCTIONALIST.currentDate(),
            },
        }),
        // notification: {
        //     title,
        //     body
        // },
        // "priority": "high",
        // topic: 'notifications',  // Replace with your desired topic
        token: fcmToken
    };

    logger.info(`Device message :-  ${JSON.stringify(message)}`)
    logger.info(`Device android :-  ${findUaseData?.android_device}`)
    logger.info(`Device IOS :-  ${findUaseData?.ios_device}`)
    if (userid) {
        let newPendingMessage = new PENDINGNOTIFICATIONMODAL({
            title, body, user: userid, time: FUNCTIONALIST.currentTime(),
            date: FUNCTIONALIST.currentDate(),
        })
        let createNewNotifi = await newPendingMessage.save();

        logger.info(`Device createNewNotification :-  ${JSON.stringify(createNewNotifi)}`)
        await USERMODAL.findOneAndUpdate(
            { _id: userid },
            { $addToSet: { notifications: createNewNotifi._id } }
        );
        console.log({ userid })
    }
    // Send the notification using the Firebase Admin SDK
    admin.messaging().send(message)
        .then((response) => {
            console.log('Notification sent successfully:', response);
        })
        .catch(async (error) => {
            if (error.code === 'messaging/registration-token-not-registered') {

                console.error('Registration token is not registered:', error);
                // Handle the situation, such as removing the token from your records
            } else {
                console.error('Error sending notification:', error);
            }
        });
};

module.exports = sendNotification;

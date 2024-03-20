const { StatusCodes } = require('http-status-codes');
const helaperfn = require('../helper/helper');
const { logger } = require('../utilis/logger');
const FUNCTIONALIST = require('../helper/functions');
const NOTIFICATION = require('../utilis/notification');
const NOTIFICATIONMODAL = require('../models/notifications');
const USERMODAL = require('../models/users.model');
const PASSMODAL = require('../models/passmodal');
const ocenfileupload = require('../utilis/oceanspcecode');

const querynames = helaperfn.QUERY;
module.exports = {
    createNotification: async function (req, res, next) {
        try {
            const { title, description, action, } = req.body;
            let { _id: admin_id } = req.user;

            if (title) {
                const file = req.file;
                let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'Notifications' }) : '';
                imagurlpath = status === 1 ? imagurlpath : '';
                const existNotification = await helaperfn.commonQuery(NOTIFICATIONMODAL, querynames.findOne, { title: title });
                if (existNotification.status == 1) {
                    res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.EXISTS("Notification") });
                } else {
                    const newNotification = await helaperfn.commonQuery(NOTIFICATIONMODAL, querynames.create,
                        {
                            user: admin_id, title: title, body: description,
                            time: FUNCTIONALIST.currentTime(),
                            date: FUNCTIONALIST.currentDate(),
                            image: imagurlpath
                        });
                    res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.CREATED_SUCCESS(`Notification`), data: newNotification.data });
                }
            } else {
                res.status(200).json({ status: StatusCodes.OK, message: 'Required Title' });
            }

        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while creating Notification', error: JSON.stringify(err) });
        }
    },
    updateNotification: async function (req, res, next) {
        try {
            const { notification_id } = req.body;
            const existNotification = await helaperfn.commonQuery(NOTIFICATIONMODAL, querynames.findOne, { _id: notification_id });
            if (existNotification.status == 1) {
                const updateNotification = await helaperfn.commonQuery(NOTIFICATIONMODAL, querynames.findOneAndUpdate, { _id: notification_id }, { ...req.body });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.UPDATED_SUCCESS("Notification"), data: updateNotification.data });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Notification") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updating Notification', error: err });
        }
    },
    deleteNotification: async function (req, res, next) {
        try {
            const { notification_id } = req.body;
            const existNotification = await helaperfn.commonQuery(NOTIFICATIONMODAL, querynames.findOne, { _id: notification_id });
            if (existNotification.status == 1) {
                await helaperfn.commonQuery(NOTIFICATIONMODAL, querynames.findOneAndUpdate, { _id: notification_id }, { is_deleted: true });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.DELETED_SUCCESS("Notification") });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Notification") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Notification', error: err });
        }
    },
    getAllNotification: async function (req, res, next) {
        try {
            const existNotifications = await helaperfn.commonQuery(NOTIFICATIONMODAL, querynames.find, {});
            res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Notification"), data: existNotifications.data });
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Notification', error: err });
        }
    },
    sendNotification: async function (req, res) {
        try {
            let { userids, notification_id } = req.body;
            console.log({ userids })

            const existNotification = await NOTIFICATIONMODAL.findOne({ _id: notification_id });
            if (existNotification && userids.length) {
                for (let userid of userids) {
                    console.log({ userid })
                    let findUser = await USERMODAL.findOne({ _id: userid, is_deleted: false });
                    if (findUser) {
                        sendNotification({
                            fcmtoken: findUser.fcm_token, userid: userid,
                            title: existNotification.title, body: existNotification.body
                        })
                        res.status(StatusCodes.OK).json({ status: 1, message: "Notification Sent Succefully" });
                    } else {
                        console.log('user not found', userid)

                    }
                }

            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Notification") });
            }
        } catch (err) {
            console.log({ error: err })
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while Sending Notification', error: JSON.stringify(err) });
        }
    },
    sendPassuserNotification: async function (req, res, next) {
        try {
            let { body, title } = req.body;

            let findPassuser = await PASSMODAL.find({ is_deleted: false });
            if (body && title) {
                for (let passUser of findPassuser) {

                    let userId = passUser.user;
                    if (userId) {
                        let findUser = await USERMODAL.findOne({ _id: userId, is_deleted: false });

                        if (findUser && findUser.fcm_token) {
                            sendNotification({
                                fcmtoken: findUser.fcm_token, userid: userId,
                                title: title, body: body
                            })
                            // NOTIFICATION({ fcmToken: findUser.fcm_token, title, body, userid: userId })
                            res.status(StatusCodes.OK).json({ status: 1, message: "Notification Sent Succefully" });
                        } else {
                            console.log('user not found', userId)
                        }
                    } else {
                        console.log('user not found', userId)
                    }
                }
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: 'Please Enter Valid Value' });
            }
        } catch (err) {
            console.log({ error: err })
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while Sending Notification', error: JSON.stringify(err) });
        }
    },
    sendUserNotification: async function (req, res, next) {
        try {

            // sendeData = {
            //     type: 'ticket'
            //     gender: 'male',
            //     gender: 'female',
            // }
            let { body, title, type, gender } = req.body;
            // let setRoles = allnuser ? 'n-user' : allpuser ? 'p-user ' : alladmin ? 'admin' : allsponsore ? 'sponsore' : 'superadmin';
            logger.info(`sendUserNotification Body :- ${JSON.stringify(req.body)}`);
            let findUsers = await USERMODAL.find({
                is_deleted: false,
                ...(type && { roles: type }),
                ...(gender && { gender: gender })
            });
            if (body && title) {
                for (let userData of findUsers) {

                    let userId = userData?._id;
                    logger.info(`sendUserNotification user id :- ${userId}`);
                    if (userId) {
                        if (userData && userData.fcm_token) {
                            sendNotification({
                                fcmtoken: userData.fcm_token, userid: userId,
                                title: title, body: body
                            })
                            // NOTIFICATION({ fcmToken: findUser.fcm_token, title, body, userid: userId })
                        } else {
                            logger.info(`sendUserNotification user fcm token not found :- ${userId}`);
                        }
                    } else {
                        logger.info(`sendUserNotification user not found :- ${userId}`);
                    }
                }
                res.status(StatusCodes.OK).json({ status: 1, message: "Notification Sent Succefully" });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: 'Please Enter Valid Value' });
            }
        } catch (err) {
            console.log({ error: err })
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while Sending Notification', error: JSON.stringify(err) });
        }
    },
}

function sendNotification({ fcmtoken = '', title = '', body = '', userid = '' }) {
    console.log({ fcmtoken })
    if (fcmtoken) {
        NOTIFICATION({ fcmToken: fcmtoken, title, body, userid })
    } else {
        console.log({ msg: 'Token not found', userid });
    }
}

async function aaaaa() {
    let findUsers = await USERMODAL.find({
        is_deleted: false,
        roles: 'n-user',
        // ...(gender && { gender: gender })
    });
    console.log(findUsers.length);
    for (let userData of findUsers) {

        let userId = userData?._id;
        logger.info(`sendUserNotification user id :- ${userId}`);
        logger.info(`sendUserNotification userData.fcm_token :- ${userData.fcm_token}`);
        if (userId) {
            if (userData && userData.fcm_token) {
                sendNotification({
                    fcmtoken: userData.fcm_token, userid: userId,
                    title: 'title', body: 'body'
                })
                // NOTIFICATION({ fcmToken: findUser.fcm_token, title, body, userid: userId })


            } else {
                logger.info(`sendUserNotification user fcm token not found :- ${userId}`);
            }
        } else {
            logger.info(`sendUserNotification user not found :- ${userId}`);
        }
    }
    // res.status(StatusCodes.OK).json({ status: 1, message: "Notification Sent Succefully" });
}
// aaaaa()
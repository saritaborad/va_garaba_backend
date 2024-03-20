const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const winlogger = require('../utilis/logger');
const SERVER_LOG_MODAL = require('../models/serverlogs_model');
const moment = require('moment');
const IP = require('ip');
let JWT = require('jsonwebtoken');
const userValidator = require('../validator/uservalidate');
const { QUERY, commonMessages, commonQuery, generateToken, checkBcryptPassword } = require('../helper/helper');
const ocenfileupload = require('../utilis/oceanspcecode');
const { OK, CREATED, INTERNAL_SERVER_ERROR, BAD_REQUEST } = StatusCodes;
const { find, findOne, create } = QUERY;
const querynames = QUERY;
const path = require("path");
const XLSX = require("xlsx");
const FUNCTIONSLIST = require("../helper/functions");
const tokensByUserId = {};
const fs = require('fs');
const RANDOMID = require('../utilis/miscellaneous');
const sendotpfn = require('../utilis/nodemailer');
const BillDeskFn = require('../utilis/billdeskpayment');

const NOTIFICATION = require('../utilis/notification');
// const sentjwtToken = require('../utilis/jwttoken');
const AXIOS = require('axios');
const allconfig = require('../config/allconfig');
// MODELS
const ZONE_MODAL = require('../models/zonemodal');
const User = require('../models/users.model');
const SAVEOTPS = require('../models/saveotps');
const GARBACLASSMODAL = require('../models/garbaclassmodal');
const EVENTMODAL = require('../models/eventmodal');
const BRANCHMODAL = require('../models/branchmodal');
const PASSMODAL = require('../models/passmodal');
const GROUND_STAFF_QR = require('../models/groundstafffqrcode_model');
const ORDERMODAL = require('../models/orderschema');
const PARKINGMODAL = require('../models/parkingmodal');
const TICKETCATEGORYMODAL = require('../models/ticketcategorymodal');
const EVENTCATEGORYMODAL = require('../models/eventcategorymodal');
const ORDEREVENTCATEGORYMODAL = require('../models/ordercategorymodal');
const ORDERPARKINGMODAL = require('../models/orderparkingmodal');
const GALLERYMODAL = require('../models/gallerymodal');
const SUBFOLDERMODAL = require('../models/subfoldermodal');

const PASS_MENTOR = require('../models/passmentormodal');

const PRIVILEGE_ORDER_MODAL = require('../models/privilegeorderticketmodel');
const USERORDERTICKETMODAL = require('../models/userticketmodel');
const USERORDEREVENTCATEGORYMODAL = require('../models/userorderticketcategorymodal');
const USERORDERPARKINGMODAL = require('../models/userorderparkingmodal');

const SPONSORMODAL = require('../models/sponsormodal');
const USERMODAL = require('../models/users.model');
let COUPONCODERECORDMODAL = require('../models/couponcoderecord');
const TAXMODAL = require('../models/taxmodal');
//special access
const ACCESSUSERMODAL = require('../models/accessofusermodal');
let PENDINGNOTIFICATIONMODAL = require('../models/pendingnotification.js');
let TRANSACTIONMODAL = require('../models/transactionmodal');

let VERIFYPASSUSERMODAL = require('../models/verifypassusermodal');
let PARKINGSTORAGEMODAL = require('../models/parkingStorageModal');
let MEDIAPRESSTICKET_MODAL = require('../models/mediapress_modal');
const { logger } = require('../utilis/logger');
const winston = require('winston/lib/winston/config');
let userInGeModal = {
    'ticketcategory': USERORDEREVENTCATEGORYMODAL,
    'parking': USERORDERPARKINGMODAL
}
let orderInGeModal = {
    'ticketcategory': ORDEREVENTCATEGORYMODAL,
    'parking': ORDERPARKINGMODAL
}
let UserOrderFilednameList = {
    'ticketcategory': 'my_tickets',
    'parking': 'my_parkings'
}

console.log(FUNCTIONSLIST.currentDateTime());


const populateOptions = [
    {
        path: 'owener_of_garba_class owener_of_garba_class_branch notifications',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt',
    },
    {
        path: 'sponsore',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt -user_id',
        populate: [
            {
                path: 'parking',
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt -parent',
                populate: [
                    {
                        path: 'gates',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt -parent',
                    }
                ]
            },
            {
                path: 'zone',
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt -parent',
                populate: [
                    {
                        path: 'gates checkpoints',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt -parent',
                    }
                ]
            },
        ],
    },
    {
        path: 'guard',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt',
        populate: [
            {
                path: 'gate parking checkpoint zone',
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt',
            }
        ]

    },
    {
        path: 'media_press',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt',
        populate: [
            {
                path: 'zone',
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt',
                populate: [
                    {
                        path: 'gates checkpoints',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                    }
                ]
            },
            {
                path: 'user',
                match: { _id: { $exists: true } },
                select: 'profile_pic name gender phone_number',
            }
        ]

    },
    {
        path: 'sofa_member',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt -member',
        populate: [
            {
                path: 'seats',
                match: { _id: { $exists: true } },
                select: 'position seat_name main_section seat_id seat_status is_used is_active',
                populate: [
                    {
                        path: 'ticket_user',
                        match: { _id: { $exists: true } },
                        select: 'profile_pic name gender phone_number',
                    },
                    {
                        path: 'sofa_id',
                        match: { _id: { $exists: true } },
                        select: 'sofa_name main_section sofa_status',
                    },
                ]
            },
            {
                path: 'zone',
                match: { _id: { $exists: true } },
                select: 'zone_name color_code is_privilege',
            },
            // {
            //     path: 'event',
            //     match: { _id: { $exists: true } },
            //     select: 'event_time event_location event_name',
            // }
        ],
    },
    {
        path: 'privilege_tickets',
        match: { _id: { $exists: true } },
        select: '-ticket_user -user',
        populate: [
            {
                path: 'seat',
                match: { _id: { $exists: true } },
                select: 'position seat_name main_section seat_id seat_status ticket_random_id',
                populate: [
                    {
                        path: 'zone',
                        match: { _id: { $exists: true } },
                        select: 'zone_name color_code is_privilege ticket_user',
                    },
                    {
                        path: 'ticket_user',
                        match: { _id: { $exists: true } },
                        select: 'profile_pic name gender phone_number',
                    },
                    {
                        path: 'sofa_id',
                        match: { _id: { $exists: true } },
                        select: 'sofa_name main_section sofa_status',
                    },
                ]
            },
            {
                path: "special_accesszones special_accessgates special_accesscheckpoints",
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt',
            },
            {
                path: "access_blockzones access_blockgates access_blockcheckpoints",
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt',
            },
        ]
    },
    {
        path: 'privilege_invitelogs',
        match: { _id: { $exists: true } },
        select: '-user',
        populate: [
            {
                path: 'seat',
                match: { _id: { $exists: true } },
                select: 'position seat_name main_section seat_id seat_status',
                populate: [
                    {
                        path: 'zone',
                        match: { _id: { $exists: true } },
                        select: 'zone_name color_code',
                    },
                    {
                        path: 'sofa_id',
                        match: { _id: { $exists: true } },
                        select: 'sofa_name main_section sofa_status',
                    },
                ]
            },
            // {
            //     path: 'user',
            //     match: { _id: { $exists: true } },
            //     select: 'profile_pic name gender phone_number',
            // },
            // {
            //     path: 'zone',
            //     match: { _id: { $exists: true } },
            //     select: '-createdAt -updatedAt',
            // },
        ]
    },
    {
        path: 'my_parkings',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt -parent -user',
        populate: [
            {
                path: 'event',
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt -parent -ticketcategorys',
                populate: {
                    path: 'taxes',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt',
                }
            },
            {
                path: 'gates',
                match: { _id: { $exists: true } },
                select: '',
            }
        ],
    },
    {
        path: 'garba_classes',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt -parent -user',
        populate: [
            {
                path: 'student_list',
                match: { _id: { $exists: true } },
                select: 'profile_pic name gender phone_number',
                populate: {
                    path: 'pass_list',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt',
                }
            },
        ],
    },
    // {
    //     path: 'owener_of_garba_class',
    //     match: { _id: { $exists: true } },
    //     select: '-createdAt -updatedAt -owner -fcm_token',
    //     populate: [
    //         {
    //             path: 'branch_list',
    //             match: { _id: { $exists: true } },
    //             select: '-createdAt -updatedAt -parent -ticketcategorys',
    //             populate: [
    //                 {
    //                     path: 'student_list approval_request_list',
    //                     match: { _id: { $exists: true } },
    //                     select: 'name gender profile_pic phone_number',
    //                 },
    //             ]
    //         },
    //     ],
    // },
    {
        path: 'pass_list',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt',
        populate: [
            {
                path: 'user',
                match: { _id: { $exists: true } },
                select: 'profile_pic name gender phone_number instagram_id birth_date blood_group roles class_id',
            },
            {
                path: 'garba_class mentor_list',
                match: { _id: { $exists: true } },
                select: '',
            },

            {
                path: 'zone',
                match: { _id: { $exists: true } },
                select: '',
                populate: [{
                    path: 'gates checkpoints',
                    match: { _id: { $exists: true } },
                }]

            },
            {
                path: "special_accesszones special_accessgates special_accesscheckpoints",
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt',
            },
            {
                path: "access_blockzones access_blockgates access_blockcheckpoints",
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt',
            },
            {
                path: 'parking',
                match: { _id: { $exists: true } },
                select: 'vehicle_number parking_name color_code two_wheeler_parking car_parking pass_parking allot_slot allow_change is_used ',
                populate: [{
                    path: 'gates',
                    match: { _id: { $exists: true } },
                }]
            }
        ],
    },
    {
        path: 'my_tickets',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt -parent -user',
        populate: [
            {
                path: 'event',
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt -parent -ticketcategorys',
                populate: {
                    path: 'taxes',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt',
                }
            },
            {
                path: 'ticket_user',
                match: { _id: { $exists: true } },
                select: 'profile_pic name gender',
            },
            {
                path: "zones gates checkpoints special_accesszones special_accessgates special_accesscheckpoints",
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt',
            },
            {
                path: "access_blockzones access_blockgates access_blockcheckpoints",
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt',
            },
        ],
    },
];
const orderPopulateoption = [
    {
        path: 'parkings',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt -parent',
    },
    {
        path: 'event',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt -parent -ticketcategorys',
        populate: {
            path: 'taxes',
            match: { _id: { $exists: true } },
            select: '-createdAt -updatedAt',
        },
    },
    {
        path: 'tickets',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt -parent',
        populate: [
            {
                path: 'zones checkpoints gates',
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt -parent -ticketcategorys',
            },
            {
                path: 'event',
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt -parent -ticketcategorys',
                populate: {
                    path: 'taxes',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt',
                },
            },
        ],

    },
];
let userPopulateDetails = [{
    path: 'orders',
    match: { _id: { $exists: true } },
    select: '-createdAt -updatedAt',
    populate: [
        {
            path: 'tickets',
            match: { _id: { $exists: true } },
            select: '-createdAt -updatedAt',
            populate: [
                {
                    path: 'gates checkpoints zones',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt',
                }
            ]
        }
    ]
}]
let SERVER_STATUS = allconfig.PROD_ENVIRONMENT;
let MSG91ENABLE = allconfig.MSG91ENABLE;
let adminlist = ['superadmin', 'admin', 'sponsor'];
//user ip saving remaining
winlogger.logger.info('SERVER_STATUS : ' + SERVER_STATUS)
winlogger.logger.info('MSG91ENABLE : ' + MSG91ENABLE)
module.exports = {
    // AUTHENTICATION SECTION
    usersignup: async (req, res, next) => {
        try {
            const { roles, phone_number, fcm_token, device_id, app_version, android_device, ios_device, device_modal, qrUpdateMinute, eventShowCount, ...userfileds } = req.body;
            // Check if the user with the given phone_number already exists
            const existUser = await USERMODAL.findOne({ phone_number, is_deleted: false });
            if (existUser) {
                // User already exists, update their information using commonQuery function

                const userData = await commonQuery(USERMODAL, querynames.findOneAndUpdate,
                    { _id: existUser._id, is_deleted: false },
                    {
                        ...userfileds, fcm_token: fcm_token, phone_number, app_version, device_modal, android_device, ios_device,
                        qrUpdateMinute, eventShowCount, device_id: device_id, $push: {
                            login_activity: {
                                android_device, ios_device,
                                device_modal, app_version, device_id, fcm_token, time: FUNCTIONSLIST.currentDateTime()
                            },
                        }
                    });

                sentjwtToken({ user: userData.data, statusCode: OK, message: commonMessages.SIGNUP_SUCCESS(`User`), res, status: 1, req });
            } else {
                // User does not exist, proceed with registration
                await userValidator.userRegister.validateAsync(req.body);

                const file = req.file;
                let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'Users' }) : '';
                imagurlpath = status === 1 ? imagurlpath : '';


                // Create a new user instance and save it to the database

                let userData = {
                    ...userfileds, phone_number, app_version, device_modal, qrUpdateMinute, eventShowCount,
                    profile_pic: imagurlpath, fcm_token: fcm_token, device_id: device_id
                };

                let newUser = new User(userData);
                newUser = await newUser.save();

                if (newUser) {
                    // Registration success
                    sentjwtToken({ user: newUser, statusCode: OK, message: commonMessages.SIGNUP_SUCCESS(`User`), res, status: 1, req });
                } else {
                    // Registration failed, handle the error
                    res.status(BAD_REQUEST).json({ status: 0, message: 'User Not created.' });
                }
            }
        } catch (error) {

            winlogger.logger.error(`Usersignup Error :- ${error}`);

            // Handle any errors that occur during the process
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: error });
        }
    },
    userlogin: async (req, res) => {
        try {
            const { phone_number } = req.body;
            let gtFiledname = { phone_number };
            const existUser = await USERMODAL.findOne({ ...gtFiledname, is_deleted: false })
                .populate([
                    {
                        path: 'my_parkings my_tickets',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                        populate: {
                            path: 'event',
                            match: { _id: { $exists: true } },
                            select: '-createdAt -updatedAt -parent -ticketcategorys',
                        }
                    },
                ])
                .select('-orders -order_parkings -order_tickets');

            if (existUser) {

                sentjwtToken({ user: existUser, statusCode: OK, message: commonMessages.LOGIN_SUCCESS(`User`), res, status: 1, req });

            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: commonMessages.NOT_EXISTS("User") });
            }
        } catch (error) {
            winlogger.logger.error(`userlogin :- ${error}`);

            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    emailPhoneWithotp: async function (req, res, next) {
        try {
            let { phone, otp_sms } = req.body;
            // otp_sms = otp_sms == 'true' ? true : false;
            const queryData = { phone: phone };


            const existOtp = await SAVEOTPS.findOne({ ...queryData });

            const startDate = existOtp ? moment(existOtp.updatedAt) : false;
            const endDate = existOtp ? moment() : false;

            const minutesDiff = existOtp ? endDate.diff(startDate, 'minutes') : 6;
            let new_otp = minutesDiff > 5 ? true : false;

            winlogger.logger.info(`minutesDiff :- ${minutesDiff}`);
            winlogger.logger.info(`new_otp :- ${new_otp}`);
            winlogger.logger.info(`existOtp :- ${existOtp}`);
            winlogger.logger.info(`otp_sms :- ${otp_sms}`);
            // SERVER_STATUS = true;
            let { otp: getOtp, success } = SERVER_STATUS ? await sendotpfn.sendWithPhone({
                phone, otp_sms, generatenewotp: new_otp,
                ...(existOtp && { otp_val: existOtp.phone_otp })
            }) : { otp: 123456, success: true };

            winlogger.logger.info(`queryData :- ${queryData}`);
            winlogger.logger.info(`success :- ${success}`);
            winlogger.logger.info(`getOtp :- ${getOtp}`);
            if (success) {

                const updateFields = { phone_otp: getOtp };
                if (existOtp) {
                    if (new_otp) {
                        await commonQuery(SAVEOTPS, querynames.findOneAndUpdate, { ...queryData }, { ...updateFields });
                    }
                } else {
                    await commonQuery(SAVEOTPS, querynames.create, { ...queryData, ...updateFields });
                }
                const msgData = 'OTP sent to your phone number successfully';
                res.status(OK).json({ status: 1, message: msgData });
            } else {
                res.status(BAD_REQUEST).json({ status: 1, message: "Something is wrong! Check Your Phone Number!!" });
            }

        } catch (error) {

            winlogger.logger.error(`emailPhoneWithotp Error :- ${error}`);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: error });
        }
    },
    otpverify: async function (req, res, next) {
        try {
            let { receivedotp, phone, fcm_token, ios_device, app_version, device_modal, android_device, eventShowCount, qrUpdateMinute, device_id } = req.body;

            winlogger.logger.info(`otpverify :- ${JSON.stringify(req.body)}`);

            const existOtp = await SAVEOTPS.findOne({ phone: phone });
            // let dd = await SAVEOTPS.findOne({
            //     $or: [{ email: email }, { phone_number: phone_number }]
            // })

            winlogger.logger.info(`existOtp :- ${existOtp}`);
            winlogger.logger.info(`fcm_token :- ${fcm_token}`);


            if (existOtp) {

                let userOtp = existOtp.phone_otp;
                let verifyOtp = userOtp == receivedotp;

                if (verifyOtp) {

                    var gtFiledname = { phone_number: phone };
                    // const existUser = await commonQuery(User, querynames.findOne, { ...gtFiledname });
                    let existUser = await USERMODAL.findOne({ ...gtFiledname, is_deleted: false })

                    if (existUser) {
                        let existuserId = existUser._id;

                        await commonQuery(USERMODAL, querynames.findOneAndUpdate, { _id: existuserId }, {
                            eventShowCount,
                            $push: {
                                login_activity: {
                                    android_device, ios_device,
                                    device_modal, app_version, device_id, fcm_token, time: FUNCTIONSLIST.currentDateTime()
                                },
                            },
                            fcm_token, ios_device, android_device, device_id, app_version, device_modal, qrUpdateMinute
                        });


                        let findPendingNotification = await PENDINGNOTIFICATIONMODAL.find({ user: existuserId })
                        if (findPendingNotification && findPendingNotification.length > 0) {
                            // for (let notification of findPendingNotification) {
                            //     if (notification && !notification.is_read) {
                            //         sendNotification({
                            //             fcmtoken: fcm_token,
                            //             title: notification.title, body: notification.body,
                            //             userid: existuserId
                            //         })
                            //     }
                            // }
                        }
                        sentjwtToken({ user: existUser, statusCode: OK, message: 'OTP Verified Successfully', res, status: 1, req });
                        await commonQuery(SAVEOTPS, querynames.findOneAndDelete, { _id: existOtp._id });
                    } else {
                        res.status(OK).json({ status: 1, message: 'OTP Verified Successfully', data: null });
                    }
                    // await commonQuery(SAVEOTPS, querynames.findOneAndDelete, { _id: existOtp._id });
                } else {
                    res.status(BAD_REQUEST).json({ status: 0, message: 'Sorry, the OTP entered is incorrect. Please retry.' });
                }
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: commonMessages.NOT_FOUND("Email Or Phone Number") });
            }
        } catch (err) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: err });
        }
    },
    logout: async function (req, res, next) {
        try {
            let { userid } = req.params;
            let findUser = await commonQuery(USERMODAL, querynames.findOne, { _id: userid, is_deleted: false });
            if (findUser.status == 1) {
                res.clearCookie('token');
                let updatedata = await commonQuery(USERMODAL, querynames.findOneAndUpdate, { _id: userid }, { token: '', fcm_token: '' });
                winlogger.logger.info(`logout :- ${updatedata?.data}`);
                res.status(200).json({
                    status: 10, message: 'User logged out.', userid, token: '', fcm_token: ''
                });
            } else {
                res.status(200).json({ status: 10, user: findUser.data, message: commonMessages.NOT_FOUND("User") });
            }


        } catch {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: err });
        }

    },
    requestForApproval: async function (req, res, next) {
        try {
            let { phone_number, class_id, gender, branch_id, new_request = false,
                to_date, season_name, from_date, season_time,
                ...otherfileds } = req.body;

            winlogger.logger.info(`requestForApproval :- ${req.body}`);
            let { _id, roles } = req.user;
            let user_id = _id;
            if (user_id) {
                winlogger.logger.info(`requestForApproval user_id :- ${user_id}`);
                let findalreadyData = await BRANCHMODAL.findOne({
                    $or: [
                        { student_list: { $in: [user_id] } },
                        { approval_request_list: { $in: [user_id] } }
                    ]
                })
                    .select('branch_name branch_area branch_address')
                    .exec();

                if (findalreadyData) {
                    let findBanchData = await BRANCHMODAL.findOne({
                        $or: [
                            { student_list: { $in: [user_id] } },
                            { approval_request_list: { $in: [user_id] } }
                        ]
                    })
                    if (new_request) {
                        if (findBanchData.student_list.includes(user_id)) {
                            findBanchData.student_list.pull(user_id);
                        } else if (findBanchData.approval_request_list.includes(user_id)) {
                            findBanchData.approval_request_list.pull(user_id);
                        }

                        await findBanchData.save();
                    } else {
                        res.status(200).send({
                            status: 0,
                            requested: true,
                            message: 'You have already requested or are a Garba Player at this branch',
                            data: findalreadyData
                        });
                        return;
                    }
                }


                const findUser = await commonQuery(USERMODAL, querynames.findOne, { _id: user_id, is_deleted: false });
                const findBranch = await commonQuery(BRANCHMODAL, querynames.findOne, { _id: branch_id });
                const findBranchData = await BRANCHMODAL.findOne({ _id: branch_id }).populate('owner zone');

                winlogger.logger.info(`rfindBranch.status :- ${findBranch?.status}`);
                winlogger.logger.info(`findUser.status :- ${findUser?.status}`);

                if (findBranch.status == 1 && findUser.status == 1) {
                    let findBranchId = findBranch.data._id;
                    let findUserId = findUser.data._id;
                    const file = req.file;
                    let zonePrice = findBranchData?.zone?.price;
                    let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'Users' }) : '';
                    imagurlpath = status === 1 ? imagurlpath : '';

                    let createNewPass = await commonQuery(PASSMODAL, querynames.create, {
                        user: user_id, pass_price: zonePrice,
                        season_name: season_name ? season_name : allconfig.SEASSON_NAME,
                        from_date: from_date ? from_date : allconfig.FROM_DATE,
                        garba_class: branch_id, season_time: season_time ? season_time : allconfig.SEASSON_TIME,
                        to_date: to_date ? to_date : allconfig.TO_DATE
                    })

                    await commonQuery(USERMODAL, querynames.findOneAndUpdate, { _id: user_id, is_deleted: false },
                        {
                            pass_list: createNewPass?.data?._id, pending_approval: findBranchId, gender: gender
                            , ...otherfileds, ...(imagurlpath && { profile_pic: imagurlpath }), class_id,
                            my_parkings: [],
                            my_tickets: []
                        })
                    let ownerFcmToken = findBranchData.owner.fcm_token ?? '';

                    winlogger.logger.info(`ownerFcmToken :- ${ownerFcmToken}`);
                    if (ownerFcmToken) {
                        // await USERMODAL.findOneAndUpdate({ _id: findBranchData.owner._id }, { $addToSet: { notifications: notification_id } });
                        sendNotification({
                            fcmtoken: ownerFcmToken, title: allconfig.GARBACLASS_OWNRER_MSG_TITLE,
                            body: `You've got a new request from ${findUser?.data?.name} for your Garba class. Time to spread the Garba joy! 📬`,
                            userid: findBranchData?.owner?._id
                        })
                    }
                    await commonQuery(BRANCHMODAL, querynames.findOneAndUpdate, { _id: branch_id }, { $addToSet: { approval_request_list: findUserId } })

                    res.status(OK).json({ status: 1, requested: true, message: commonMessages.SEND_SUCCESS("Approval request") });
                } else {
                    res.status(BAD_REQUEST).json({ status: 0, message: commonMessages.NOT_FOUND("User Or Garba Class") });
                }
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: commonMessages.NOT_FOUND("User Or Garba Class") });
            }

        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },

    approveRequest: async function (req, res, next) {
        try {
            let { userid, branchid, action } = req.body;
            const findUser = await commonQuery(USERMODAL, querynames.findOne, { _id: userid, is_deleted: false });
            const findBranch = await commonQuery(BRANCHMODAL, querynames.findOne, { _id: branchid });

            if (findBranch.status == 1 && findUser.status == 1) {
                let findUserId = findUser?.data?._id;
                let findBranchId = findBranch?.data?._id;
                let passDataId = findUser?.data?.pass_list
                let zoneDataId = findBranch?.data?.zone;
                let branchName = findBranch?.data?.branch_name;

                winlogger.logger.info(`passDataId:- ${passDataId}`);
                if (action) {
                    //add into student_list
                    await commonQuery(BRANCHMODAL, querynames.findOneAndUpdate, { _id: branchid }, { $addToSet: { student_list: findUserId } })
                    await commonQuery(USERMODAL, querynames.findOneAndUpdate,
                        { _id: userid, is_deleted: false }, { $addToSet: { garba_classes: findBranchId }, roles: 'p-user' });

                    await PASSMODAL.findOneAndUpdate({
                        _id: passDataId
                    }, {
                        pass_status: 'Approved', zone: zoneDataId
                    }, { new: true }
                    )
                    // await commonQuery(PASSMODAL, querynames.findOneAndUpdate, { _id: passDataId },
                    //     { pass_status: 'Approved', zone: zoneDataId })
                    let userFcmToken = findUser?.data?.fcm_token;
                    if (userFcmToken) {
                        sendNotification({
                            fcmtoken: userFcmToken, title: 'Your Player Request Approved!',
                            body: `Great news! The class owner of ${branchName} has approved your request. 🎉 Get ready for an amazing Garba experience!`, userid: findUserId
                        })
                    }
                    await sendotpfn.sendApprovalRequest({
                        phone: findUser.data?.phone_number, statusval: 'Approved',
                        username: findUser.data?.name,
                    });

                    res.status(OK).json({ status: 1, message: "Request Approved!" });
                } else {
                    await commonQuery(PASSMODAL, querynames.findOneAndDelete, { _id: passDataId })
                    await sendotpfn.sendApprovalRequest({
                        phone: findUser.data?.phone_number, statusval: 'Rejected',
                        username: findUser.data?.name,
                    });
                    let findOwner = await USERMODAL.findOne({ _id: findBranch?.data?.owner, is_deleted: false })
                    if (userFcmToken) {
                        sendNotification({
                            fcmtoken: userFcmToken, title: 'Request Rejected',
                            body: `We're sorry to inform you that your request from the ${findOwner?.name} has been rejected.`, userid: findUserId
                        })
                    }
                    res.status(OK).json({ status: 1, message: "Approval request Declined!" });
                }
                // remove from approval_request_list
                await commonQuery(BRANCHMODAL, querynames.findOneAndUpdate, { _id: branchid }, { $pull: { approval_request_list: findUserId } })
                await commonQuery(USERMODAL, querynames.findOneAndUpdate, { _id: userid, is_deleted: false }, { $unset: { pending_approval: 1 } })

            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: commonMessages.NOT_FOUND("User Or Garba Class") });
            }

        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    getUserInfo: async function (req, res, next) {
        try {
            // const { user_id } = req.params;
            winlogger.logger.info(`---- getUserInfo ----`);
            if (req.user) {
                let { _id } = req.user;
                let user_id = _id;
                let existUser = await getuserInfo({ searhfield: { _id: user_id } })
                // const existUser = await USERMODAL.findOne({ _id: user_id }).populate([...populateOptions])
                //     .select('-orders -order_parkings -order_tickets -pending_approval');
                existUser = existUser.toObject();
                existUser.qr_code_show = Boolean(allconfig.QR_CODE);
                existUser.IV_key = allconfig.QR_IV_KEY;
                existUser.Secrate_key = allconfig.QR_SECRECT_KEY;



                winlogger.logger.info(`existUser :- ${JSON.stringify(existUser)}`);
                if (existUser) {
                    res.status(StatusCodes.OK).json({ status: 1, message: commonMessages.GET_DATA_SUCCESS(`User`), data: existUser });
                } else {
                    res.status(StatusCodes.OK).json({ status: 0, message: commonMessages.NOT_FOUND(`User`), data: null });
                }
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: commonMessages.NOT_FOUND(`User`), data: null });
            }
            winlogger.logger.info(`---- getUserInfo  ending----`);

        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while fetching User', error: JSON.stringify(error) });
        }

    },

    getClassStudent: async function (req, res, next) {
        try {
            const { user_id } = req.params;

            let findUser = await USERMODAL.findOne({ _id: user_id, is_deleted: false });

            const garbaClass = findUser.roles == 'garbaclassowner' ? await GARBACLASSMODAL.findOne({ owner: user_id }).populate({
                path: 'branch_list',
                populate: {
                    path: 'student_list',
                    model: 'users'
                }
            }) : await BRANCHMODAL.findOne({ owner: user_id }).populate('student_list');

            if (garbaClass) {
                res.status(StatusCodes.OK).json({ status: 1, message: commonMessages.GET_DATA_SUCCESS(`User`), data: garbaClass });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: commonMessages.NOT_FOUND(`User`), data: null });
            }

        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    activeNow: async function (req, res, next) {
        //user already exits then??
        try {
            const { name, phone_number, gender, ticket_id, parking_id, vehicle_number } = req.body;
            console.log({ bd: req.body })

            console.log({ requser: req.user })
            let { _id: user_id, pass_list, garba_classes, roles, phone_number: actualphone_number } = req.user;

            let ispassuser = roles == 'p-user';
            let pass_id = parking_id ? '' : ispassuser ? pass_list : '';
            console.log({ user: req.user })
            if (user_id) {
                console.log({ garba_classes })
                let findGarbaClass = await BRANCHMODAL.findOne({ _id: garba_classes });
                console.log({ findGarbaClass })
                let zone_id = findGarbaClass ? findGarbaClass?.zone : '';
                const modelsMap = {
                    ticket_id: USERORDEREVENTCATEGORYMODAL,
                    pass_id: PASSMODAL,
                    parking_id: USERORDERPARKINGMODAL
                };

                const orderObject = {
                    ticket_id: 'my_tickets',
                    pass_id: 'pass_list',
                    parking_id: 'my_parkings'
                };

                let assignTicketType = {
                    'parking_id': 'Parking',
                    'ticket_id': 'Garba',
                }

                const selectIdname = pass_id ? 'pass_id' : parking_id ? 'parking_id' : ticket_id ? 'ticket_id' : '';
                const selectId = pass_id || parking_id || ticket_id;

                console.log({ selectId, selectIdname })
                if (!selectId) {
                    return res.status(StatusCodes.BAD_REQUEST).json({ status: 0, message: 'No valid ID provided in the request.' });
                }
                const actualUser = await USERMODAL.findOne({ _id: user_id, is_deleted: false });
                const findData = await commonQuery(modelsMap[selectIdname], querynames.findOne, { _id: selectId });
                console.log({ findData })
                var cresteUserId = '';
                var is_dropped = false;
                const selectedModel = modelsMap[selectIdname];
                if (actualUser && findData.status === 1) {
                    let updateField = pass_id ?
                        { pass_status: 'Active', ...(zone_id && { zone: zone_id }) } :
                        { is_active: true, ...(vehicle_number && { vehicle_number: vehicle_number }) };
                    if (!pass_id && phone_number) {
                        let finduser = phone_number ? await USERMODAL.findOne({ phone_number: phone_number, is_deleted: false }) : 1;
                        const file = req.file;
                        let decidekeyname = orderObject[selectIdname];

                        let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'Users' }) : '';
                        imagurlpath = status === 1 ? imagurlpath : '';

                        let findEvent = await selectedModel.findOne({ _id: selectId }).populate('event');
                        console.log({ findEvent })
                        if (!finduser) {

                            //dropped user notification remaining
                            console.log({ ss: { [decidekeyname]: selectId } })
                            const newUser = await commonQuery(USERMODAL, create, {
                                name, phone_number,
                                gender, profile_pic: imagurlpath, is_completed: false,
                            });
                            console.log({ newUser })

                            cresteUserId = newUser.data._id;

                            await commonQuery(USERMODAL, querynames.findOneAndUpdate, { _id: cresteUserId, is_deleted: false }, {
                                $addToSet: {
                                    [decidekeyname]: selectId,
                                },
                            });

                            if (MSG91ENABLE) {
                                await sendotpfn.deroppedMessage({
                                    toNumber: phone_number, toname: name,
                                    provideby: actualUser?.name, topicname: findEvent?.event?.event_name
                                })
                            }
                            // updateField = { ...updateField, ticket_user: cresteUserId, is_dropped: true }
                            updateField = { ...updateField, assigned_user: cresteUserId, is_dropped: true }
                            await commonQuery(selectedModel, querynames.findOneAndUpdate, { _id: selectId }, { $set: { ...updateField } });
                            let userFcmToken = finduser?.fcm_token;
                            if (finduser && userFcmToken) {
                                sendNotification({
                                    fcmtoken: userFcmToken, title: `${name} Dropped a Ticket for You`,
                                    body: `You've just received a ${assignTicketType[selectIdname]} ticket. Get ready for an exhilarating experience! 🎟️`,
                                    userid: user_id
                                })
                            }
                            is_dropped = true
                        }
                        console.log({ kk: finduser && finduser?._id != user_id })

                        // if (finduser && finduser?._id != user_id) {
                        if (finduser && phone_number != actualphone_number) {
                            updateField = { ...updateField, assigned_user: finduser._id, is_dropped: true }
                            await commonQuery(selectedModel, querynames.findOneAndUpdate, { _id: selectId }, { $set: { ...updateField } });
                            await commonQuery(USERMODAL, querynames.findOneAndUpdate, { _id: finduser._id, is_deleted: false }, {
                                $addToSet: {
                                    [decidekeyname]: selectId,
                                },
                            });
                            is_dropped = true;
                            console.log({ findEvent, actualUser })
                            if (MSG91ENABLE) {
                                await sendotpfn.deroppedMessage({
                                    toNumber: phone_number, toname: name,
                                    provideby: actualUser?.name, topicname: findEvent?.event?.event_name
                                })
                            }
                        }
                        // usertickets
                        let ticketuser = await commonQuery(USERORDERTICKETMODAL, create, {
                            name, phone_number, ticket: ticket_id,
                            gender: gender, profile_pic: imagurlpath
                        });
                        /// user notification pending
                        let userFcmToken = finduser?.fcm_token ?? null;
                        if (userFcmToken) {
                            // await USERMODAL.findOneAndUpdate({ _id: findBranchData.owner._id }, { $addToSet: { notifications: notification_id } });
                            sendNotification({
                                fcmtoken: userFcmToken,
                                title: 'Ticket Activated',
                                body: `You've successfully activated your ${assignTicketType[selectIdname]} ticket. Get ready to enjoy the experience! ✅`,
                                userid: finduser?._id
                            })
                        }
                        console.log({ ticketuser })
                        updateField = { ...updateField, ticket_user: ticketuser.data._id };
                    }
                    console.log({ updateField })


                    if (selectedModel) {
                        await commonQuery(selectedModel, querynames.findOneAndUpdate, { _id: selectId }, { $set: { ...updateField } });
                        res.status(StatusCodes.OK).json({ status: 1, message: 'Active successfully.' });
                    } else {
                        res.status(StatusCodes.OK).json({ status: 1, message: 'Something is wrong. Please check ID!' });
                    }
                } else {

                    res.status(StatusCodes.OK).json({ status: 0, message: commonMessages.NOT_FOUND(`User or Ticket or Pass`), data: null });
                }

            } else {

                res.status(StatusCodes.OK).json({ status: 1, message: 'User Not Found!' });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    orderCreate: async function (req, res, next) {
        try {
            let { event_id, ticketcategorys, parkings, total, sub_total, total_tax, payment_status, payment_response, discount_price, ...otherfields } = req.body;

            logger.info(`-------------------------------------------------`);
            logger.info(`orderCreate req.body:- ${JSON.stringify(req.body)}`);
            let { _id, roles, pass_list, name, phone_number, gender } = req.user;
            let user_id = _id;
            let discountedTotal = 0;
            if (user_id) {
                let pass_id = pass_list?._id;
                let pass_user = roles == 'p-user' ? pass_id : '';
                let findEvent = await commonQuery(EVENTMODAL, querynames.findOne, { _id: event_id });
                let validate = pass_user ? pass_user : findEvent.status == 1;
                let userpassData = roles == 'p-user' ? await PASSMODAL.findOne({ _id: pass_id, is_deleted: false, is_expire: false }) : false;
                let is_csv = userpassData ? userpassData.is_csv : false;

                logger.info(`-------------------------------------------------`);
                logger.info(`pass_user :- ${pass_user}`);
                if (validate) {
                    const processArray = async (array, modal, submodal, modalName) => {
                        const dataList = [];
                        for (const item of array) {
                            const exist = await modal.findOne({ _id: item._id }).select('-createdAt -updatedAt');
                            if (exist) {
                                const { _id: tktid, ...exitotherFields } = exist.toObject();
                                let totalprice = item.price * item.qty;
                                console.log({ pareticat: exitotherFields })

                                const ticketCategory = {
                                    parent: tktid, ...exitotherFields,
                                    ...(roles == 'p-user' && { is_passuser: true }),
                                    price: Number(totalprice), qty: item.qty > 0 ? item.qty : 1
                                };
                                logger.info(`-------------------------------------------------`);
                                logger.info(`orderCreate ticketCategory:- ${JSON.stringify(ticketCategory)}`);

                                let createOrderEventCategoey = await commonQuery(submodal, querynames.create,
                                    { ...ticketCategory, user: user_id, event: event_id });
                                let createdOrderId = createOrderEventCategoey.data._id;
                                // if (modalName == 'parking' && pass_user) {
                                //     await commonQuery(USERORDERPARKINGMODAL, querynames.create,
                                //         { ...ticketCategory, parent: createdOrderId, user: user_id, event: event_id });
                                // }
                                dataList.push(createdOrderId);
                            } else {
                                console.log("Item does not exist:", item._id);
                            }
                        }
                        return dataList;
                    };
                    console.log({ ticketcategorys })


                    const ticketcategoryslist = !pass_user && ticketcategorys && ticketcategorys.length > 0 ?
                        await processArray(ticketcategorys, EVENTCATEGORYMODAL, ORDEREVENTCATEGORYMODAL, 'ticketcategory') : [];

                    const parkinglist = parkings && parkings.length > 0 ? await processArray(parkings, PARKINGMODAL, ORDERPARKINGMODAL, 'parking') : [];

                    const orderCreate = await commonQuery(ORDERMODAL, querynames.create, {
                        ...otherfields,
                        user: user_id, sub_total,
                        tickets: ticketcategoryslist,
                        parkings: parkinglist,
                        event: event_id, total, discount_price: discount_price,
                        total_tax, is_csv,
                    });

                    logger.info(`-------------------------------------------------`);
                    logger.info(`orderCreate :- ${JSON.stringify(orderCreate)}`);
                    res.status(200).json({
                        status: 1, message: 'Billdesk page Loadding...',
                        payment_url: `${allconfig.BILLDESK_PAYMENT_URL}/billdesk/checkout?id=${encodeURIComponent(orderCreate.data._id)}&sr_status=${encodeURIComponent(allconfig.BILLDESK_STATUS)}`
                    });
                } else {
                    res.status(200).json({ status: 0, message: 'Event Not found.' });
                }
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: commonMessages.NOT_FOUND(`User`), data: null });
            }


        } catch (error) {
            logger.error(`while orderCreate error :- ${error}`);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    orderUpdate: async function (req, res) {
        try {
            logger.info('----- orderUpdate ----')
            let { order_id, transaction_Id, payment_status, billdesk_order_id, payment_method, payment_response, order_status, txn_process_type } = req.body;

            order_status = order_status ? order_status : false;

            logger.info(`-------------------------------------------------`);
            logger.info(`orderUpdate req.body ${JSON.stringify(req.body)}`)
            if (order_id) {
                await commonQuery(ORDERMODAL, querynames.findOneAndUpdate, { _id: order_id }, {
                    transaction_Id, payment_status, billdesk_order_id,
                    ...(txn_process_type && { txn_process_type: txn_process_type }),
                    ...(payment_method && { payment_method: payment_method }),
                    ...(payment_response && { payment_response: payment_response }),
                })

                let addPopulate = [

                    {
                        path: 'event',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt -parent -ticketcategorys',
                        populate: {
                            path: 'taxes',
                            match: { _id: { $exists: true } },
                            select: '-createdAt -updatedAt',
                        },
                    },
                    {
                        path: 'user',
                        match: { _id: { $exists: true } },
                        select: 'name phone_number gender roles pass_list',
                        populate: [{
                            path: 'pass_list',
                            match: { _id: { $exists: true } },
                            select: '-createdAt -updatedAt',
                        }]
                    },
                ];
                let findOrderData = await ORDERMODAL.findOne({ _id: order_id })
                    .populate([...orderPopulateoption, ...addPopulate]);

                // res.status(200).json({ status: 1, message: 'order details', data: findOrderData });
                logger.info(`-------------------------------------------------`);
                logger.info(`orderUpdate findOrderData :- ${JSON.stringify(findOrderData)}`)
                let user_id = findOrderData?.user;

                let findUserData = await USERMODAL.findOne({ _id: user_id, is_deleted: false })
                logger.info(`-------------------------------------------------`);
                logger.info(`orderUpdate findUserData:- ${JSON.stringify(findUserData)}`);
                let eventData = findOrderData?.event;
                let isPassUser = findUserData?.roles == 'p-user';
                let pass_id = isPassUser ? findUserData.pass_list : '';
                let taxlist = eventData?.taxes;
                let is_csv = findUserData?.is_csv;
                logger.info(`-------------------------------------------------`);
                logger.info(`orderUpdate event_id string:- ${eventData}`);

                if (findOrderData.tickets && findOrderData.tickets.length > 0 && order_status) {
                    await FUNCTIONSLIST.assignedOrderTouser({
                        array: findOrderData.tickets, event_id: eventData?._id, payment_status: payment_status,
                        modalname: 'ticketcategory', user_id: user_id, is_passuser: isPassUser,
                    })
                }
                if (findOrderData.parkings && findOrderData.parkings.length > 0 && order_status) {
                    await FUNCTIONSLIST.assignedOrderTouser({
                        array: findOrderData.parkings, event_id: eventData._id, payment_status: payment_status,
                        modalname: 'parking', user_id: user_id, is_passuser: isPassUser,
                    })
                }

                if (pass_id && order_status) {
                    let parking_id = findOrderData.parkings[0];
                    // let findPassUserOrderParking = await USERORDERPARKINGMODAL.findOne({ parent: parking_id })
                    let is_parking = findOrderData.parkings && findOrderData.parkings.length > 0 ? true : false;
                    await commonQuery(PASSMODAL, querynames.findOneAndUpdate, { _id: pass_id },
                        { $set: { pass_status: 'Active', is_parking, payment_status: payment_status } });
                }


                let findPass = isPassUser ? await PASSMODAL.findOne({ _id: pass_id }) : '';

                await commonQuery(USERMODAL, querynames.findOneAndUpdate, { _id: user_id, is_deleted: false }, {
                    $addToSet: {
                        orders: findOrderData._id,
                    },
                });
                let eventname = eventData?.event_name;
                let eventday = eventData?.event_day;
                let userName = findUserData?.name ?? null;
                let userPhone = findUserData?.phone_number ?? null;
                let tickets = findOrderData ? findOrderData?.tickets : [];
                let parkings = findOrderData ? findOrderData?.parkings : [];
                let ordertotal = findOrderData?.total;
                let gstin = findOrderData?.gst_in;
                let base_price = findOrderData?.base_price;
                let discount_price = findOrderData?.discount_price;
                let business_name = findOrderData?.business_name;
                let total_tax = findOrderData?.total_tax;
                let twoWheelers = parkings.filter(twoWheeler => twoWheeler.two_wheeler_parking === true);
                let fourWheelers = parkings.filter(twoWheeler => twoWheeler.car_parking === true);
                let createdAt = moment().format("DD/MM/YYYY");

                let eventaxval = taxlist && taxlist.length > 0 ? taxlist.reduce((acc, val) => acc + +val.tax_rate, 0) : 0;
                // userPhone = 9687058787;

                // userPhone = 9998413323;
                tickets = findPass && isPassUser ? [
                    {
                        ticket_name: `${findPass?.pass_name}`,
                        qty: findPass?.pass_qty,
                        price: findPass?.pass_price
                    }
                ] : tickets;
                logger.info(`-------------------------------------------------`);
                logger.info(`orderUpdate tickets:- ${tickets}`);

                if (MSG91ENABLE && order_status) {
                    await sendotpfn.sendPdf({
                        discount_price,
                        transaction_Id, billdesk_order_id, twoWheelers, fourWheelers, eventaxval: eventaxval > 0 ? eventaxval : 0,
                        receiverNumber: userPhone, receiverName: userName, createdAt, total_tax, order_id,
                        amount: ordertotal, tickets, parkings, gstin, base_price, business_name, eventname, eventday
                    })
                }
                let userFcmToken = findUserData?.fcm_token;
                if (userFcmToken) {
                    if (order_status) {
                        if (isPassUser) {
                            sendNotification({
                                fcmtoken: userFcmToken, title: 'You Successfully Made a Payment',
                                body: `Congratulations! You've successfully made the payment for your Garba pass. 🎉 Get ready to enjoy the Garba experience to the fullest! 🕺💃`,
                                userid: findUserData?._id
                            })
                        } else {
                            sendNotification({
                                fcmtoken: userFcmToken, title: 'Payment Successful!',
                                body: `Woohoo! Your payment was successful. Get ready for something exciting coming your way.🎊`,
                                userid: findUserData?._id
                            })

                        }
                    } else {
                        sendNotification({
                            fcmtoken: userFcmToken, title: 'Payment Unsuccessful',
                            body: `Oops! It seems your payment didn't go through. Don't worry, you can try again.😔`,
                            userid: findUserData?._id
                        })
                    }
                    // await USERMODAL.findOneAndUpdate({ _id: findBranchData.owner._id }, { $addToSet: { notifications: notification_id } });

                }

                res.status(200).json({ status: 1, message: 'order details', data: findOrderData });

            } else {
                res.status(OK).json({ status: 0, message: 'order not found', data: null });
            }

        } catch (error) {
            logger.error(`while orderUpdate error :- ${error}`);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
        }
    },
    addGallary: async function (req, res, next) {
        try {
            const { files: filelist, body: { foldername, subfolder } } = req;
            let imageFileList = [];
            let folderpath = subfolder ? `${foldername}/${subfolder}` : foldername;

            // Find or create the parent folder if it's a subfolder
            let parentFolder = null;
            if (subfolder) {
                const parentFolderResult = await commonQuery(GALLERYMODAL, querynames.findOne, { foldername });
                if (parentFolderResult.status == 1) {
                    parentFolder = parentFolderResult.data;
                } else {
                    const createParentFolderResult = await commonQuery(GALLERYMODAL, querynames.create, { foldername });
                    if (createParentFolderResult.status == 1) {
                        parentFolder = createParentFolderResult.data;
                    } else {
                        throw new Error('Failed to create parent folder.');
                    }
                }
            }

            for (let file of filelist) {
                const { url: imagurlpath } = await ocenfileupload.imageuploads({ file, foldername: folderpath });
                imageFileList.push(imagurlpath);
            }

            let galleryData = null;
            if (subfolder) {
                const existSubFolderResult = await commonQuery(SUBFOLDERMODAL, querynames.findwithorcondition, [{ foldername: subfolder, parent: parentFolder._id }]);

                if (existSubFolderResult.status == 1) {
                    const existingImages = existSubFolderResult.data.images.flat();
                    const updatedImages = existingImages.concat(imageFileList);
                    galleryData = await commonQuery(SUBFOLDERMODAL, querynames.findOneAndUpdate,
                        { _id: existSubFolderResult.data._id }, { $set: { images: updatedImages } });
                } else {
                    const createResult = await commonQuery(SUBFOLDERMODAL, querynames.create, {
                        foldername: subfolder,
                        images: imageFileList,
                        parent: parentFolder._id,
                    });
                    if (createResult.status == 1) {
                        await commonQuery(GALLERYMODAL, querynames.findOneAndUpdate,
                            { _id: parentFolder._id }, { $addToSet: { subfolder: createResult.data._id } });
                        galleryData = createResult;
                    } else {
                        throw new Error('Failed to create subfolder.');
                    }
                }
            } else {
                const existFolderResult = await commonQuery(GALLERYMODAL, querynames.findOne, { foldername });
                if (existFolderResult.status == 1) {
                    const existingImages = existFolderResult.data.images.flat();
                    const updatedImages = existingImages.concat(imageFileList);
                    galleryData = await commonQuery(GALLERYMODAL, querynames.findOneAndUpdate,
                        { _id: existFolderResult.data._id }, { $set: { images: updatedImages } });
                } else {
                    galleryData = await commonQuery(GALLERYMODAL, querynames.create, { foldername, images: imageFileList });
                }
            }

            res.status(200).json({ status: 1, message: 'Image Upload successfully', data: galleryData?.data ? galleryData.data : null });
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    getgallery: async (req, res, next) => {
        try {
            const gallaerydata = await GALLERYMODAL.find({})
                .populate([{
                    path: 'subfolder',
                    match: { _id: { $exists: true } },
                    select: '-parent -createdAt -updatedAt'
                }])
                .lean(); // Use the lean method to get plain JavaScript objects

            if (gallaerydata.length > 0) {
                res.status(200).json({ status: 1, message: 'Image Fetch successfully', data: gallaerydata.length > 0 ? gallaerydata : null });
            } else {
                res.status(200).json({ status: 0, message: 'No image data found', data: null });
            }
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, error: JSON.stringify(error), message: 'Error while fetching images', });
        }
    },
    transactionHistory: async function (req, res, next) {
        try {

            if (req.user) {
                let { _id } = req.user;
                let user_id = _id;
                let findOrderData = await ORDERMODAL.findOne({ _id: '64ca53079e2d195280b65dd6' })

                let existUser = await USERMODAL.findOne({ _id: user_id, is_deleted: false })
                    .select('orders')
                    .populate([
                        {
                            path: 'orders',
                            match: { _id: { $exists: true } },
                            select: '-createdAt -updatedAt -parent',
                            populate: [
                                {
                                    path: 'event',
                                    match: { _id: { $exists: true } },
                                    select: '-createdAt -updatedAt -parent -ticketcategorys',
                                    populate: {
                                        path: 'taxes',
                                        match: { _id: { $exists: true } },
                                        select: '-createdAt -updatedAt',
                                    },
                                },
                                {
                                    path: 'parkings',
                                    match: { _id: { $exists: true } },
                                    select: '-createdAt -updatedAt -parent',
                                },
                                {
                                    path: 'tickets',
                                    match: { _id: { $exists: true } },
                                    select: '-createdAt -updatedAt -parent',
                                    populate: [
                                        {
                                            path: 'zones checkpoints gates',
                                            match: { _id: { $exists: true } },
                                            select: '-createdAt -updatedAt -parent -ticketcategorys',
                                        },
                                        {
                                            path: 'event',
                                            match: { _id: { $exists: true } },
                                            select: '-createdAt -updatedAt -parent -ticketcategorys',
                                            populate: {
                                                path: 'taxes',
                                                match: { _id: { $exists: true } },
                                                select: '-createdAt -updatedAt',
                                            },
                                        },
                                    ],
                                },
                            ]

                        },

                    ]);
                if (existUser) {
                    res.status(StatusCodes.OK).json({ status: 0, message: commonMessages.FOUND_SUCCESS(`User`), data: existUser });

                } else {
                    res.status(StatusCodes.OK).json({ status: 0, message: commonMessages.NOT_FOUND(`User`), data: null });
                }
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: commonMessages.NOT_FOUND(`User`), data: null });
            }
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    useExist: async function (req, res, next) {
        try {
            const { phone_number } = req.body;
            let gtFiledname = { phone_number };

            const existUser = await USERMODAL.findOne({ ...gtFiledname, is_deleted: false })
                .populate([
                    ...userPopulateDetails
                ])
                .select('roles name phone_number gender profile_pic orders');

            if (existUser) {

                res.status(OK).json({ status: 1, message: commonMessages.EXISTS("User"), data: existUser });

            } else {
                res.status(OK).json({ status: 0, message: commonMessages.NOT_EXISTS("User"), data: null });
            }

        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    callbildesk: async function (req, res, next) {
        try {

            BillDeskFn.billdesk({ res });
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    userupdate: async function (req, res) {
        try {
            let { name, birth_date, instagram_id, blood_group } = req.body;
            let { _id: user_id } = req.user;
            const existUser = await USERMODAL.findOne({ _id: user_id, is_deleted: false });
            if (existUser) {
                const file = req.file;
                let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'Users' }) : '';
                imagurlpath = status === 1 ? imagurlpath : '';
                await commonQuery(USERMODAL, querynames.findOneAndUpdate, { _id: existUser._id, is_deleted: false }, { name, gender, birth_date, instagram_id, blood_group, profile_pic: imagurlpath });
                const getUserData = await USERMODAL.findOne({ _id: user_id, is_deleted: false }).populate([...populateOptions])
                    .select('-orders -order_parkings -order_tickets -pending_approval');
                res.status(BAD_REQUEST).json({ status: 1, message: 'User Update Succesfully.', data: getUserData });
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
        }
    },
    orderDetails: async function (req, res, next) {
        try {
            let { order_id } = req.body;
            let neworderPopulateoption = [...orderPopulateoption,
            {
                path: 'event',
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt -event_description -event_photo',
            },
            {
                path: 'user',
                match: { _id: { $exists: true } },
                select: 'name phone_number gender roles pass_list',
                populate: [{
                    path: 'pass_list',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt',
                }]
            },
            ]
            let findOrderData = await ORDERMODAL.findOne({ _id: order_id }).populate([...neworderPopulateoption]);
            res.status(200).json({ status: 1, data: findOrderData })
        } catch (error) {
            console.error(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    createComplimantoryCode: async function (req, res, next) {
        try {
            let { event_id, phone_number, ticketcategorys, parkings, total, remark, revesed_parking, resassigned, ...otherfields } = req.body;
            console.log({ promcobody: req.body })
            console.log({ user: req.user, event_id })

            let { roles, _id: provider_id, sponsore } = req.user;
            let superadmin = roles == 'superadmin';
            let admin = roles == 'admin';
            let sponsoer = roles == 'sponsor';
            revesed_parking = revesed_parking ? revesed_parking : false
            resassigned = resassigned ? resassigned : false
            let findevent = await EVENTMODAL.findOne({ _id: event_id, is_deleted: false });
            let findUser = await USERMODAL.findOne({ phone_number: phone_number, is_deleted: false });
            console.log({ findUser })
            if (sponsoer) {
                let findSponsor = await SPONSORMODAL.findOne({ _id: sponsore });
                let balance = findSponsor.balance_alloted;
                let totalPrice = calculateTotal({ array: ticketcategorys }) + calculateTotal({ array: parkings })
                if (balance > totalPrice) {
                    console.log({ 'sponsor balace ': balance, 'provide': totalPrice })
                    let updateBalance = balance - totalPrice;
                    updateBalance = updateBalance > 0 ? updateBalance : 0;
                    console.log('sponsor balace', { updateBalance });
                } else {
                    return res.status(200).json({ status: 0, message: 'InSufficiat Balance.', data: null });
                }
            }

            if (findUser && adminlist.includes(findUser?.complimantorycode_provided_by) && !resassigned) {
                res.status(200).json({ status: 0, message: 'Already Assigned Complimantory Code!', data: null });
                return;
            }
            console.log({ findUser })
            if (findevent && findUser && ['n-user'].includes(findUser?.roles)) {
                let user_id = findUser._id;
                let complimantorycode = RANDOMID.generate(10);

                let ticketObj = {
                    array: ticketcategorys, modal: EVENTCATEGORYMODAL, modalname: 'ticketcategory', payment_status: 'complimantory',
                    submodal: ORDEREVENTCATEGORYMODAL, event_id: event_id, provided_by: roles, provided_id: provider_id
                }
                const ticketcategoryslist = ticketcategorys && ticketcategorys.length > 0 ? await FUNCTIONSLIST.processArray(ticketObj) : [];

                let parkingObj = {
                    array: parkings, modal: PARKINGMODAL, modalname: 'parking', is_reserved: revesed_parking, payment_status: 'complimantory',
                    submodal: ORDERPARKINGMODAL, event_id: event_id, provided_by: roles, provided_id: provider_id
                }
                const parkinglist = parkings && parkings.length > 0 ? await FUNCTIONSLIST.processArray(parkingObj) : [];

                const orderCreate = await commonQuery(ORDERMODAL, querynames.create, {
                    ...otherfields,
                    tickets: ticketcategoryslist, user: user_id, payment_method: 'complimantory',
                    parkings: parkinglist, complimantory_code: complimantorycode, is_cc_created_sponsor: sponsoer,
                    event: event_id, total, is_cc_created_superadmin: superadmin, payment_status: 'complimantory',
                    is_cc_created_admin: admin, provided_by: roles,
                    provided_id: provider_id,
                });
                //provide upatee..
                let updateProvider = await USERMODAL.findOneAndUpdate({ _id: provider_id, is_deleted: false },
                    {
                        $addToSet: {
                            orders: orderCreate?.data?._id,
                        },
                    }, { new: true });

                let createCouponRecord = await commonQuery(COUPONCODERECORDMODAL, querynames.create, {
                    phone_number: phone_number, coupon_code: complimantorycode, event: event_id,
                    order: orderCreate.data._id, remark, provided_id: provider_id,
                    event_date: findevent?.event_date,
                    event_day: findevent?.event_day,
                    provided_by: roles, coupon_code_type: 'complimantory', total: total,
                })

                if (sponsoer) {
                    let findSponsor = await SPONSORMODAL.findOne({ _id: sponsore });
                    let balance = findSponsor.balance_alloted;
                    let totalPrice = calculateTotal({ array: ticketcategorys }) + calculateTotal({ array: parkings })
                    if (balance > totalPrice) {
                        console.log({ 'sponsor balace ': balance, 'provide': totalPrice })
                        let updateBalance = balance - totalPrice;
                        updateBalance = updateBalance > 0 ? updateBalance : 0;

                        await TRANSACTIONMODAL.create({
                            description: `generate Complimantory code`,
                            debit: totalPrice, complimantory: true, provided_by: roles,
                            user: findSponsor?.user_id,
                            sponsor: findSponsor?._id,
                            amount: updateBalance, coupon: createCouponRecord?.data?._id
                        })


                        await SPONSORMODAL.findOneAndUpdate({ _id: sponsore }, { balance_alloted: updateBalance });
                    }
                } else {
                    await TRANSACTIONMODAL.create({
                        description: `generate Complimantory code by ${roles}`,
                        debit: total, complimantory: true, provided_by: roles,
                        user: provider_id, amount: total, coupon: createCouponRecord?.data?._id
                    })
                }



                // let findCCode = await COMPLIMATORYCODEMODAL.findOne({ phone_number: findUser.phone_number });

                // let COMPLIDATAOBJ = {
                //     complimantory_code: complimantorycode, remark, provided_id: provider_id,
                //     coupon_id: createCouponRecord._id, order: orderCreate.data._id, provided_by: roles,
                // }


                // if (findCCode) {
                //     await COMPLIMATORYCODEMODAL.findOneAndUpdate(
                //         { phone_number: findUser.phone_number },
                //         {
                //             ...COMPLIDATAOBJ
                //         }
                //     )
                // } else {
                //     await commonQuery(COMPLIMATORYCODEMODAL, querynames.create, {
                //         phone_number: findUser.phone_number, ...COMPLIDATAOBJ
                //     });

                // }

                //user upatee...
                await USERMODAL.findOneAndUpdate({ _id: user_id, is_deleted: false },
                    {
                        complimantorycode_provided_by: roles, is_complimantorycode: true,
                    }, { new: true });

                console.log({ updateProvider })
                // PROMOCODE SMS
                if (MSG91ENABLE) {
                    await sendotpfn.sendComplimantoryCode({
                        name: findUser?.name,
                        phone: findUser?.phone_number, nametype: findevent?.event_name,
                        complimantorycode: complimantorycode,

                    });
                }

                res.status(200).json({ status: 1, message: 'You get Complimanatory code!', data: complimantorycode });
            } else {
                res.status(200).json({ status: 0, message: 'Event Or User Not Found! Or User not valid Role.', data: null });
            }

        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },

    bookMyshowSalesTeam: async function (req, res, next) {
        try {
            let { event_id, phone_number, ticketcategorys, total, by_cash, remark, revesed_parking, resassigned, ...otherfields } = req.body;
            let parkings = [];
            console.log('---------------- bookMyshowSalesTeam ----------------');
            console.log({ bookMyshowSalesTeam: req.body })
            console.log({ user: req.user, event_id })
            let bookmyshow = by_cash ? 'cash' : 'bookmyshow';

            let { roles, _id: provider_id } = req.user;
            let salesteam = roles == 'salesteam';
            // let superadmin = roles == 'superadmin';
            // let admin = roles == 'admin';
            // let sponsoer = roles == 'sponsor';
            revesed_parking = revesed_parking ? revesed_parking : false
            resassigned = resassigned ? resassigned : false
            let findevent = await EVENTMODAL.findOne({ _id: event_id, is_deleted: false, is_expire: false });
            if (!findevent) {
                return res.status(200).json({ status: 0, message: 'Event Not Found', data: null });
            }
            let findUser = await USERMODAL.findOne({ phone_number: phone_number, is_deleted: false });
            console.log({ findUser })
            // if (!findUser) {
            //     findUser = await USERMODAL.create({
            //         phone_number: phone_number, is_completed: false, roles: 'n-user'
            //     })
            // }

            console.log({ findUser })
            if (findUser && ['n-user'].includes(findUser?.roles)) {
                let user_id = findUser._id;

                let ticketObj = {
                    by_cash, remark, is_salesteam: true,
                    array: ticketcategorys, modal: EVENTCATEGORYMODAL, modalname: 'ticketcategory', payment_status: bookmyshow,
                    submodal: ORDEREVENTCATEGORYMODAL, event_id: event_id, provided_by: roles, provided_id: provider_id
                }
                const ticketcategoryslist = ticketcategorys && ticketcategorys.length > 0 ? await FUNCTIONSLIST.processArray(ticketObj) : [];

                let parkingObj = {
                    by_cash, remark, is_salesteam: true,
                    array: parkings, modal: PARKINGMODAL, modalname: 'parking', is_reserved: revesed_parking, payment_status: bookmyshow,
                    submodal: ORDERPARKINGMODAL, event_id: event_id, provided_by: roles, provided_id: provider_id
                }
                const parkinglist = parkings && parkings.length > 0 ? await FUNCTIONSLIST.processArray(parkingObj) : [];

                const orderCreate = await commonQuery(ORDERMODAL, querynames.create, {
                    ...otherfields,
                    tickets: ticketcategoryslist, user: user_id, payment_status: bookmyshow,
                    parkings: parkinglist,
                    event: event_id, total, by_cash, remark,
                    is_created_salesteam: true, provided_by: roles,
                    provided_id: provider_id,

                });
                if (orderCreate?.data?.tickets && orderCreate?.data?.tickets.length > 0) {
                    console.log({ t: orderCreate.data.tickets })
                    await FUNCTIONSLIST.assignedOrderTouser({
                        array: orderCreate?.data?.tickets, event_id: orderCreate?.data?.event,
                        is_salesteam: true, is_salesticket: true,
                        modalname: 'ticketcategory', user_id: user_id,
                    })
                }
                //provide upatee..
                let updateProvider = await USERMODAL.findOneAndUpdate({ _id: provider_id, is_deleted: false },
                    {
                        $addToSet: {
                            orders: orderCreate?.data?._id,
                        },
                    }, { new: true });

                //user upatee...
                await USERMODAL.findOneAndUpdate({ _id: user_id, is_deleted: false },
                    {
                        salesteam_provided_by: roles, is_salesteam: true,
                    }, { new: true });

                console.log({ updateProvider })
                // PROMOCODE SMS
                // if (MSG91ENABLE) {
                //     await sendotpfn.sendComplimantoryCode({
                //         phone: findUser?.phone_number, nametype: findevent?.event_name,
                //         complimantorycode: complimantorycode,

                //     });
                // }

                res.status(200).json({ status: 1, message: 'You get Ticket!', data: orderCreate });
            } else {
                res.status(200).json({ status: 0, message: 'User Not Found! Or User not valid Role.', data: null });
            }

        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    viewcomplimantorycode: async function (req, res) {
        const { phone_number, complimantory_code } = req.body;
        let findcomplimantoryCode = await COUPONCODERECORDMODAL.findOne({
            coupon_code: complimantory_code, phone_number: phone_number
        });

        if (findcomplimantoryCode) {
            if (!findcomplimantoryCode.is_used) {
                let isCodeVerify = findcomplimantoryCode.coupon_code == complimantory_code;
                if (isCodeVerify) {
                    let addPopulate = [
                        {
                            path: 'event',
                            match: { _id: { $exists: true } },
                            select: '-createdAt -updatedAt -parent -ticketcategorys',
                            populate: {
                                path: 'taxes',
                                match: { _id: { $exists: true } },
                                select: '-createdAt -updatedAt',
                            }
                        },
                    ];
                    let findOrderData = await ORDERMODAL.findOne({ _id: findcomplimantoryCode.order }).populate([...orderPopulateoption, ...addPopulate]);
                    // await COUPONCODERECORDMODAL.findOneAndUpdate({ _id: findcomplimantoryCode.coupon_id }, { is_used: true });
                    res.status(OK).json({ status: 1, message: 'Your Complimanatory code details', data: findOrderData });
                } else {
                    res.status(OK).json({ status: 1, message: 'Your Complimanatory code is ussed!', data: null });
                }

            } else {
                res.status(OK).json({ status: 0, message: commonMessages.OTP_NOT_VALID("Complimanatory Code") });
            }
        } else {
            res.status(202).json({ status: 0, message: 'Complimanatory code not Found' });
        }
    },
    redeemcomplimantorycode: async function (req, res) {
        try {
            const { phone_number, complimantory_code } = req.body;
            console.log({ bd: req.body })
            let findcomplimantoryCode = await COUPONCODERECORDMODAL.findOne({
                coupon_code: complimantory_code, phone_number: phone_number, is_used: false
            });

            let findUser = await USERMODAL.findOne({ phone_number, is_deleted: false });

            console.log({ findcomplimantoryCode, findUser })
            if (findcomplimantoryCode && findUser) {
                if (!findcomplimantoryCode.is_used) {
                    let verifyOtp = findcomplimantoryCode.coupon_code == complimantory_code;
                    console.log({ verifyOtp })

                    if (verifyOtp) {
                        let findOrderData = await ORDERMODAL.findOne({ _id: findcomplimantoryCode.order })
                        console.log({ findOrderData })


                        if (findOrderData) {
                            if (findOrderData.tickets && findOrderData.tickets.length > 0) {
                                console.log({ t: findOrderData.tickets })
                                await FUNCTIONSLIST.assignedOrderTouser({
                                    array: findOrderData.tickets, event_id: findOrderData.event,

                                    modalname: 'ticketcategory', user_id: findUser._id, complimanotry: true
                                })
                            }
                            if (findOrderData.parkings && findOrderData.parkings.length > 0) {
                                await FUNCTIONSLIST.assignedOrderTouser({
                                    array: findOrderData.parkings, event_id: findOrderData.event,
                                    modalname: 'parking', user_id: findUser._id, complimanotry: true
                                })
                            }
                        }
                        let isProvideBySponsore = findOrderData?.is_cc_created_sponsor;
                        let sponsore = isProvideBySponsore ? findOrderData?.provider_id : false;
                        let findSponsor = sponsore ? await SPONSORMODAL.findOne({ _id: sponsore }) : '';
                        if (isProvideBySponsore && findSponsor) {
                            let balance = findSponsor?.balance_alloted;
                            let totalPrice = calculateTotal({ array: findOrderData.tickets }) + calculateTotal({ array: findOrderData.parkings })
                            if (balance > totalPrice) {
                                console.log({ 'sponsor balace ': balance, 'provide': totalPrice })
                                let updateBalance = balance - totalPrice;
                                console.log({ 'sponsore balance ': updateBalance });
                                // await SPONSORMODAL.findOneAndUpdate({ _id: sponsore }, { balance_alloted: updateBalance });

                                // await TRANSACTIONMODAL.create({
                                //     description: `Ticket Reedem by ${findUser?.name} ${findUser?.phone_number}`,
                                //     debit: totalPrice,
                                //     user: sponsore, amount: updateBalance
                                // })
                            }
                        }


                        // await commonQuery(COMPLIMATORYCODEMODAL, querynames.findOneAndDelete, { _id: findcomplimantoryCode._id });
                        await commonQuery(COUPONCODERECORDMODAL, querynames.findOneAndUpdate,
                            { coupon_code: complimantory_code },
                            { is_used: true },
                            { new: true }
                        );
                        let findAllcomplimantoryCode = await COUPONCODERECORDMODAL.find({
                            phone_number: phone_number, is_used: false, is_deleted: false
                        });
                        console.log({ findAllcomplimantoryCode })


                        await commonQuery(USERMODAL, querynames.findOneAndUpdate, { _id: findUser?._id, is_deleted: false },
                            { is_complimantorycode: findAllcomplimantoryCode && findAllcomplimantoryCode.length > 0 ? true : false },
                            { new: true });

                        // await ORDERMODAL.findOneAndUpdate({ _id: findcomplimantoryCode.order },{payment_method})
                        res.status(OK).json({ status: 1, message: 'Your Complimanatory code is valid! Please Check Your Tickets.' });
                    } else {
                        res.status(OK).json({ status: 0, message: commonMessages.OTP_NOT_VALID("Complimanatory Code") });
                    }
                } else {
                    res.status(202).json({ status: 0, message: 'Complimanatory is used!' });
                }
            } else {
                let msgAlert = findUser ? findcomplimantoryCode ? '' : 'Complimanatory code is used or Not Found' : 'User Not Found.';
                res.status(202).json({ status: 0, message: msgAlert });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    clearDb: async function (req, res, next) {
        try {
            async function truncateCollections() {
                try {
                    // Get the list of all collections in the database
                    const collections = mongoose.connection.collections;
                    let excludename = ['zones', 'parkings', 'gates', 'checkpoints', 'ticketcategorys'];

                    // Loop through each collection and truncate (remove all documents)
                    for (const collectionName in collections) {
                        if (!excludename.includes(collectionName)) {
                            await collections[collectionName].deleteMany({});
                            console.log(`Collection '${collectionName}' truncated.`);
                        }
                    }
                } catch (error) {
                    console.error('Error truncating collections:', error);
                } finally {
                    // Close the Mongoose connection
                    mongoose.connection.close();
                }
            }
            truncateCollections();
            res.status(200).json({ status: 1, message: 'Db clear successfully' });
            res.end();

        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    allComplimantoryCode: async function (req, res, next) {
        try {
            let { roles, _id: user_id } = req.user;
            console.log({ user_id })
            let findCoupndata = await COUPONCODERECORDMODAL.find({ coupon_code_type: "complimantory", provided_id: user_id, is_deleted: false })
                .populate([
                    {
                        path: 'order',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt -parent -ticketcategorys',
                        populate: [
                            {
                                path: 'event',
                                match: { _id: { $exists: true } },
                                select: '-createdAt -updatedAt -parent -ticketcategorys',
                                populate: {
                                    path: 'taxes',
                                    match: { _id: { $exists: true } },
                                    select: '-createdAt -updatedAt',
                                },
                            },
                            {
                                path: 'tickets',
                                match: { _id: { $exists: true } },
                                select: '-createdAt -updatedAt',
                                populate: [
                                    {
                                        path: 'gates checkpoints zones',
                                        match: { _id: { $exists: true } },
                                        select: '-createdAt -updatedAt',
                                    }
                                ]
                            },
                            {
                                path: 'parkings',
                                match: { _id: { $exists: true } },
                                select: '-createdAt -updatedAt',
                            }
                        ]
                    },
                    {
                        path: 'provided_id',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt -orders -token -fcm_token',
                    }
                ])
                .select('coupon_code coupon_code_type phone_number is_used order');
            res.status(200).json({ status: 1, data: findCoupndata, message: 'Get Your Code!' });
        } catch (error) {

            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    readNotification: async function (req, res, next) {
        try {
            let { notification_id } = req.body;
            let { _id: user_id } = req.user;
            let findNotification = await PENDINGNOTIFICATIONMODAL.findOneAndDelete({ _id: notification_id });
            if (findNotification) {
                await USERMODAL.findOneAndUpdate({ _id: user_id, is_deleted: false }, { $pull: { notifications: notification_id } });
                res.status(OK).json({ status: 1, message: 'Notification read Succesfully.' });

            } else {
                res.status(OK).json({ status: 0, message: 'Notificatio not found' });
            }
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    allTaxes: async function (req, res, next) {
        try {
            // TAXMODAL
            let alltaxesData = await TAXMODAL.find({})
            res.status(OK).json({ status: 0, message: 'All Taxes List.', data: alltaxesData });
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    //User Order Update
    updateUserOrder: async function (req, res, next) {
        try {
            let { parking_id, vehicle_number, orderticket_id = '' } = req.body;
            let findParking = await USERORDERPARKINGMODAL.findOne({ _id: parking_id })
            console.log({ findParking })
            if (findParking && vehicle_number && !findParking.is_used) {
                if (findParking.allow_change) {
                    await USERORDERPARKINGMODAL.findOneAndUpdate({ _id: parking_id }, { vehicle_number });
                    let messg = parking_id ? 'User Order parking Update.' : orderticket_id ? 'User have all access' : 'Please Valid Selection';
                    res.status(StatusCodes.OK).json({ status: 1, message: `${messg}` });
                } else {
                    res.status(StatusCodes.OK).json({ status: 1, message: `Your not allow to change..` });
                }
            } else {
                res.status(OK).json({ status: 0, message: 'Ticket not found Or Already Used', data: null });
            }
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    updateUserTicketOrder: async function (req, res, next) {
        try {
            let { orderticket_id } = req.body;
            let findOrder = await USERORDEREVENTCATEGORYMODAL.findOne({ _id: orderticket_id })
            console.log({ findOrder })
            if (findOrder && !findOrder.is_used) {
                if (findOrder.allow_change) {
                    const file = req.file;
                    let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'Users' }) : '';
                    imagurlpath = status === 1 ? imagurlpath : '';
                    await USERORDERTICKETMODAL.findOneAndUpdate({ _id: findOrder.ticket_user }, { profile_pic: imagurlpath });

                    let messg = 'User Profile Updated successfully';
                    res.status(StatusCodes.OK).json({ status: 1, message: `${messg}` });
                } else {
                    res.status(StatusCodes.OK).json({ status: 1, message: `Your not allow to change..` });
                }
            } else {
                res.status(OK).json({ status: 0, message: 'Ticket not found Or Already Used', data: null });
            }
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    deleteUser: async function (req, res, next) {
        try {
            // const { user_id } = req.body;
            let { _id: user_id } = req.user;
            const existUser = await commonQuery(USERMODAL, querynames.findOne, { _id: user_id, is_deleted: false });
            if (existUser.status == 1) {
                await commonQuery(USERMODAL, querynames.findOneAndDelete, { phone_number: existUser.phone_number + '23', _id: existUser.data._id, is_deleted: true }, { new: true });
                // await commonQuery(USERMODAL, querynames.findOneAndDelete, { _id: existUser.data._id });
                res.status(StatusCodes.OK).json({ status: 1, message: commonMessages.DELETED_SUCCESS("User") });
            } else {

                res.status(StatusCodes.OK).json({ status: 0, message: commonMessages.NOT_EXISTS("User") });
            }
        } catch (err) {
            console.error({ err: err });
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting User', error: err });
        }
    },
    //----------------- Admin ----------------
    //user 
    getUserDetails: async function (req, res, next) {
        try {
            const { phone_number } = req.body;
            if (phone_number) {

                const existUser = await getuserInfo({ searhfield: { phone_number: phone_number } })
                console.log(existUser)
                // const existUserData = await USERMODAL.findOne({ phone_number: phone_number })
                //     .populate([
                //         ...userPopulateDetails
                //     ])
                //     .select('roles name phone_number gender profile_pic orders');
                // let datata = { ...existUserData };
                // console.log(datata)
                if (existUser) {
                    res.status(StatusCodes.OK).json({ status: 1, message: commonMessages.GET_DATA_SUCCESS(`User`), data: existUser });
                } else {
                    res.status(StatusCodes.OK).json({ status: 0, message: commonMessages.NOT_FOUND(`User`), data: null });
                }
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: commonMessages.NOT_FOUND(`User`), data: null });
            }


        } catch (error) {
            console.log({ error: error })
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while Admin fetching User', error: JSON.stringify(error) });
        }
    },
    userBlockAccess: async function (req, res, next) {
        try {
            let { userids, is_blocked = false, all_access = false } = req.body;
            for (let userid of userids) {
                let findUser = await USERMODAL.findOne({ _id: userid, is_deleted: false });
                if (findUser) {
                    await USERMODAL.findOneAndUpdate({ _id: userid, is_deleted: false }, { is_blocked: !all_access, all_access: !is_blocked });
                    let messg = is_blocked ? 'User is blocked' : all_access ? 'User have all access' : 'Please Valid Selection';
                    res.status(StatusCodes.OK).json({ status: 1, message: `${messg}` });
                } else {
                    res.status(OK).json({ status: 0, message: 'User not found', data: null });
                }
            }
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    allPrivilege: async function (req, res, next) {
        try {
            let existUsers = await USERMODAL.find({ is_deleted: false, is_privilegeuser: true })
                .populate([
                    {
                        path: 'privilege_tickets',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                        populate: [
                            {
                                path: 'seat',
                                match: { _id: { $exists: true } },
                                select: 'position seat_name main_section seat_id seat_status',
                                populate: [
                                    {
                                        path: 'zone',
                                        match: { _id: { $exists: true } },
                                        select: 'zone_name color_code',
                                    },
                                    {
                                        path: 'sofa_id',
                                        match: { _id: { $exists: true } },
                                        select: 'sofa_name main_section sofa_status',
                                    },
                                ]
                            },
                            {
                                path: "zone",
                                match: { _id: { $exists: true } },
                                select: '-createdAt -updatedAt',
                            },
                            {
                                path: "special_accesszones special_accessgates special_accesscheckpoints",
                                match: { _id: { $exists: true } },
                                select: '-createdAt -updatedAt',
                            },
                            {
                                path: "access_blockzones access_blockgates access_blockcheckpoints",
                                match: { _id: { $exists: true } },
                                select: '-createdAt -updatedAt',
                            },
                        ]
                    }
                ])
                .select('-orders -order_parkings -order_tickets -pending_approval -my_parkings -my_tickets -notifications -login_activity');
            res.status(OK).json({ status: 0, message: 'All Privilege List.', data: existUsers });
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    allUsersList: async function (req, res, next) {
        try {
            let existUsers = await USERMODAL.find({ is_deleted: false }).populate([...populateOptions])
                .select('-orders -order_parkings -order_tickets -pending_approval');
            res.status(OK).json({ status: 0, message: 'All Users List.', data: existUsers });
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    orderList: async function (req, res, next) {
        try {
            let { failed = false } = req.body;
            let findCase = failed ? 'failed' : 'success';
            // payment_status: findCase
            let userDetails = [
                {
                    path: 'user',
                    match: { _id: { $exists: true } },
                    select: 'profile_pic name gender phone_number instagram_id birth_date blood_group roles class_id',
                }
            ]
            let findOrderData = await ORDERMODAL.find({}).populate([...orderPopulateoption, ...userDetails]);

            res.status(OK).json({ status: 0, message: 'All Order List.', data: findOrderData });

        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    //Admin
    complimentroypass: async function (req, res) {
        try {
            let { user_id, parking_id, revesed_parking } = req.body;
            console.log({ complimentroybody: req.body })
            console.log({ g: req.user })
            let { _id: provider_id, roles } = req.user;
            let findUser = await USERMODAL.findOne({ _id: user_id, is_deleted: false });
            let passuser = 'p-user' == findUser?.roles;
            if (findUser && passuser) {
                let pass_id = findUser.pass_list;


                let findparking = parking_id ? await PARKINGMODAL.findOne({ _id: parking_id }) : '';
                console.log({ findparking })
                if (findparking) {
                    let parkingObj = {
                        array: [{
                            _id: findparking._id, qty: 1, price: Number(findparking.price)
                        }], modal: PARKINGMODAL, modalname: 'parking', is_reserved: revesed_parking,
                        submodal: ORDERPARKINGMODAL, provided_by: roles, provided_id: provider_id
                    }
                    console.log({ p: JSON.stringify(parkingObj) })
                    const parkinglist = parking_id ? await FUNCTIONSLIST.processArray(parkingObj) : [];
                    console.log({ p1: JSON.stringify(parkinglist) })
                    await FUNCTIONSLIST.assignedOrderTouser({
                        array: parkinglist, is_passuser: true,
                        modalname: 'parking', user_id: user_id, complimanotry: true
                    })
                    let userFcmToken = findUser?.fcm_token;
                    if (findUser && userFcmToken) {
                        sendNotification({
                            fcmtoken: userFcmToken, title: 'Your Player Request Approved!',
                            body: `Congratulations! Your request has been approved by our management. 
                            When Payment is Successful. 🎊`,
                            userid: user_id
                        })
                    }
                    await PASSMODAL.findOneAndUpdate({ _id: pass_id }, { pass_status: 'Active', complimanotry: true, parking: parkinglist[0] });
                } else {
                    await PASSMODAL.findOneAndUpdate({ _id: pass_id }, { pass_status: 'Active', complimanotry: true });
                }

                return res.status(OK).json({ status: 1, message: 'Pass Active successfully.' });
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User have not pass!' });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    increDescSponsorBalance: async function (req, res, next) {
        try {
            let { sponsor_id, balance_amount } = req.body;
            let { _id: provided_id, roles, name } = req.user;
            let findData = await SPONSORMODAL.findOne({ _id: sponsor_id });
            if (findData) {
                let sponsoBalnce = findData.balance_alloted;
                let addAllow = sponsoBalnce == 0 ? sponsoBalnce == 0 && balance_amount > 0 : true;

                if (addAllow) {
                    let updateData = await SPONSORMODAL.findOneAndUpdate({ _id: sponsor_id }, { $inc: { balance_alloted: balance_amount } }, { new: true })

                    await TRANSACTIONMODAL.create({
                        provided_id: provided_id,
                        provided_by: roles,
                        description: `Provided by ${name}`,
                        ...(balance_amount < 0 && { debit: balance_amount.replace('-', '') }),
                        ...(balance_amount > 0 && { credit: balance_amount }),
                        user: findData?.user_id,
                        sponsor: sponsor_id,
                        amount: updateData?.balance_alloted
                    })


                    res.status(OK).json({ status: 1, message: 'Sponsor Update Succfully.', data: updateData });
                } else {
                    let msgInfo = sponsoBalnce <= 0 ? 'Sponsor Balance is zero.' : 'Sponsor Not Found.';
                    res.status(BAD_REQUEST).json({ status: 0, message: msgInfo });
                }
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'Sponsor Not Found.' });
            }

        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    creditDebitHistory: async function (req, res, next) {
        try {
            let { _id: user_id } = req.user;
            let findUser = await USERMODAL.findOne({ _id: user_id, is_deleted: false });
            console.log({ findUser })
            if (findUser) {
                let findSponsore = await SPONSORMODAL.findOne({ _id: findUser.sponsore });
                console.log({ findSponsore })
                if (findSponsore) {
                    let transactionData = await TRANSACTIONMODAL.find({ sponsor: findSponsore?._id }).populate([
                        {
                            path: 'user provided_id coupon sponsor',
                            match: { _id: { $exists: true } },
                            select: '-createdAt -updatedAt',
                        }
                    ]);
                    console.log({ transactionData })
                    res.status(200).json({ status: 1, message: 'Sponsore Credit Debit', data: transactionData });
                } else {
                    res.status(200).json({ status: 0, message: 'Sponsor not Found!' });
                }
            } else {
                res.status(200).json({ status: 0, message: 'User not Found!' });
            }
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    // grantAcces
    // {
    // "gates": [
    //     {
    //         "mg_id": "64d761d397366abccdba54db",
    //         "block": false
    //     },
    //     {
    //         "mg_id": "64d7622197366abccdba54e1",
    //         "access": false 
    //     }
    // ],
    // ],
    // "phone_number": "4444444441",
    // "add": true
    // "remove": true
    // "update": true
    // }

    accessProvideToUser: async function (req, res, next) {
        try {
            const { phone_number, add, remove, update, gates, checkpoints, zones, parkings } = req.body;
            const { _id: provider_id, roles } = req.user;
            const findUser = await USERMODAL.findOne({ phone_number: phone_number, is_deleted: false });

            if (!findUser) {
                return res.status(404).json({ status: 0, message: 'User not found.' });
            }
            const findAccessUser = await ACCESSUSERMODAL.findOne({ _id: findUser.access });

            if (add && !findAccessUser) {
                let createAccess = await ACCESSUSERMODAL.create({
                    ...(gates && gates.length && { gates: gates }),
                    ...(zones && zones.length && { zones: zones }),
                    ...(parkings && parkings.length && { parkings: parkings }),
                    ...(checkpoints && checkpoints.length && { checkpoints: checkpoints }),
                    user_id: findUser?._id,
                    provider_id,
                    provided_by: roles
                });
                if (findUser._id) {
                    await USERMODAL.findOneAndUpdate({ _id: findUser._id, is_deleted: false }, { access: createAccess._id }, { new: true });
                }
            }

            if (remove || update) {

                if (findAccessUser) {
                    let updateZones = handleOperations({ arr: findAccessUser.zones, items: zones, remove, update });
                    let updateCheckpoints = handleOperations({ arr: findAccessUser.checkpoints, items: checkpoints, remove, update });
                    let updateGates = handleOperations({ arr: findAccessUser.gates, items: gates, remove, update });
                    let updateParkings = handleOperations({ arr: findAccessUser.parkings, items: parkings, remove, update });
                    await ACCESSUSERMODAL.findOneAndUpdate({ _id: findAccessUser._id },
                        { zones: updateZones, gates: updateGates, parkings: updateParkings, checkpoints: updateCheckpoints },
                        { new: true });
                } else {
                    return res.status(404).json({ status: 0, message: 'Access User data not found.' });
                }
                console.log({ findAccessUser })
            }

            let mesgAlert = add && !findAccessUser ? 'User access Added!' : remove || update ? 'User Acces updated successfully.' : 'User have already access';
            res.status(200).json({ status: 1, message: mesgAlert });
        } catch (error) {
            console.error(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    //speacialAccesIn Ticket
    speacialAccessInUserTicket: async function (req, res) {
        try {
            let { ticketids, gateids, zoneids, checkpointids, add, remove, type } = req.body;
            type = type ? type : 'ticket';
            let orderInGeModal = {
                'privilege': PRIVILEGE_ORDER_MODAL,
                'pass': PASSMODAL,
                'ticket': USERORDEREVENTCATEGORYMODAL,
                'press': MEDIAPRESSTICKET_MODAL,
            }

            let findTicket = await orderInGeModal[type].find({ _id: { $in: ticketids } });
            console.log({ findTicket, zoneids, k: zoneids && zoneids.length > 0 })
            if (ticketids.length > 0 && findTicket.length === ticketids.length) {
                let updateResult = null;
                if (add) {
                    updateResult = await orderInGeModal[type].updateMany(
                        { _id: { $in: ticketids } },
                        {
                            special_access: true,
                            // $set: {
                            special_accessids: [...checkpointids, ...zoneids, ...gateids],
                            special_accesszones: zoneids,
                            special_accessgates: gateids,
                            special_accesscheckpoints: checkpointids
                            // }
                            // $set: {
                            //     special_accessids: { $each: [...checkpointids, ...zoneids, ...gateids] },
                            //     ...(zoneids && zoneids.length && { special_accesszones: { $each: zoneids } }),
                            //     ...(gateids && gateids.length && { special_accessgates: { $each: gateids } }),
                            //     ...(checkpointids && checkpointids.length && { special_accesscheckpoints: { $each: checkpointids } })
                            // }
                        }
                    );
                }
                if (remove) {
                    updateResult = await orderInGeModal[type].updateMany(
                        { _id: { $in: ticketids } },
                        {
                            $pull: {
                                special_accessids: { $in: [...checkpointids, ...zoneids, ...gateids] },
                                ...(zoneids && zoneids.length && { special_accesszones: { $in: zoneids } }),
                                ...(gateids && gateids.length && { special_accessgates: { $in: gateids } }),
                                ...(checkpointids && checkpointids.length && { special_accesscheckpoints: { $in: checkpointids } })
                            },
                            // special_access: {
                            //     $cond: {
                            //         if: { $and: [{ $exists: '$special_accessids' }, { $not: { $size: '$special_accessids' } }] },
                            //         then: true,
                            //         else: false
                            //     }
                            // }


                        }
                    );

                }
                for (ticket of ticketids) {
                    let findTicket = await orderInGeModal[type].findOne({ _id: ticket });
                    if (findTicket) {
                        let special_accessids = findTicket?.special_accessids
                        await orderInGeModal[type].findOneAndUpdate({ _id: ticket },
                            { special_access: special_accessids && special_accessids.length > 0 ? true : false }, { new: true });

                    }
                }
                console.log(updateResult)

                let msgAlret = add ? 'Access Added successfully' : 'Access removed successfully';
                res.status(200).json({ status: 1, message: msgAlret, });

            } else {
                res.status(200).json({ status: 0, message: "Not all documents found with the specified _id values." });
            }

        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    blockInUserTicket: async function (req, res) {
        try {
            let { ticketids, gateids, zoneids, checkpointids, add, remove, type } = req.body;
            type = type ? type : 'ticket';
            let orderInGeModal = {
                'privilege': PRIVILEGE_ORDER_MODAL,
                'pass': PASSMODAL,
                'ticket': USERORDEREVENTCATEGORYMODAL,
                'press': MEDIAPRESSTICKET_MODAL,
            }

            let findTicket = await orderInGeModal[type].find({ _id: { $in: ticketids } });
            console.log({ checkpointids, zoneids, gateids })
            if (ticketids.length > 0 && findTicket.length === ticketids.length) {
                let updateResult = null;
                if (add) {
                    updateResult = await orderInGeModal[type].updateMany(
                        { _id: { $in: ticketids } },
                        {
                            access_block: true,
                            // $addToSet: {
                            //     access_blockids: { $each: [...checkpointids, ...zoneids, ...gateids] },
                            //     ...(zoneids && zoneids.length && { access_blockzones: { $each: zoneids } }),
                            //     ...(gateids && gateids.length && { access_blockgates: { $each: gateids } }),
                            //     ...(checkpointids && checkpointids.length && { access_blockcheckpoints: { $each: checkpointids } })
                            // }
                            access_blockids: [...checkpointids, ...zoneids, ...gateids],
                            access_blockzones: zoneids,
                            access_blockgates: gateids,
                            access_blockcheckpoints: checkpointids
                        }
                    );
                }
                if (remove) {
                    updateResult = await orderInGeModal[type].updateMany(
                        { _id: { $in: ticketids } },
                        {
                            $pull: {
                                access_blockids: { $in: [...checkpointids, ...zoneids, ...gateids] },
                                ...(zoneids && zoneids.length && { access_blockzones: { $in: zoneids } }),
                                ...(gateids && gateids.length && { access_blockgates: { $in: gateids } }),
                                ...(checkpointids && checkpointids.length && { access_blockcheckpoints: { $in: checkpointids } })
                            },

                            // special_access: {
                            //     $cond: {
                            //         if: { $and: [{ $exists: '$special_accessids' }, { $not: { $size: '$special_accessids' } }] },
                            //         then: true,
                            //         else: false
                            //     }
                            // }


                        }
                    );

                }
                for (ticket of ticketids) {
                    let findTicket = await orderInGeModal[type].findOne({ _id: ticket });
                    if (findTicket) {
                        let access_blockids = findTicket?.access_blockids
                        await orderInGeModal[type].findOneAndUpdate({ _id: ticket },
                            { access_block: access_blockids && access_blockids.length > 0 ? true : false }, { new: true });

                    }
                }
                console.log(updateResult)

                let msgAlret = add ? 'Access Block Added successfully' : 'Access Block Removed successfully';
                res.status(200).json({ status: 1, message: msgAlret, });

            } else {
                res.status(200).json({ status: 0, message: "Not all documents found with the specified _id values." });
            }

        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    pendingPaymentForPassPlayer: async function (req, res, next) {
        try {
            let { userids } = req.body;
            for (let userid of userids) {
                console.log({ userid })
                let findUser = await USERMODAL.findOne({ _id: userid, is_deleted: false });
                if (findUser) {
                    sendNotification({
                        fcmtoken: findUser.fcm_token, userid: userid,
                        title: allconfig.PASSUSER_PENDINGPAYMENT_MSG_TITLE,
                        body: allconfig.PASSUSER_PENDINGPAYMENT_MSG_BODY
                    })
                    res.status(StatusCodes.OK).json({ status: 1, message: "Notification Sent Succefully" });
                } else {
                    console.log('user not found', userid)
                }
            }

        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    tapTosendpendingPaymentForPassPlayer: async function (req, res, next) {
        try {

            let findUser = await USERMODAL.find({ roles: 'p-user', is_deleted: false });
            for (let userdata of findUser) {
                let userid = userdata._id
                let findPassData = await PASSMODAL.findOne({ _id: userdata?.pass_list, pass_status: 'Approved' })

                let getUser = findPassData?.user;
                let findUserData = await USERMODAL.findOne({ _id: getUser, is_deleted: false });
                if (findUserData && getUser) {
                    sendNotification({
                        fcmtoken: userdata.fcm_token, userid: userid,
                        title: allconfig.PASSUSER_PENDINGPAYMENT_MSG_TITLE,
                        body: allconfig.PASSUSER_PENDINGPAYMENT_MSG_BODY
                    })
                } else {
                    console.log('user not found', userid)
                }
            }
            res.status(StatusCodes.OK).json({ status: 1, message: "Notification Sent Succefully" });

        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    uploadcoforpassuser: async function (req, res, next) {
        try {
            let { branch_id, user_id } = req.body;
            const filelist = req.files || [];

            const uploads = ocenfileupload.multipleimageUpload({ filelist: filelist, foldername: 'passuserdocument' })

            const [doc_back, doc_front] = await uploads;

            await VERIFYPASSUSERMODAL.create({
                doc_back, doc_front, branch_id, user_id
            });
            res.status(OK).json({ status: 1, message: 'Document Uploads' });
            res.end();
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    importCsvForPassuser: async function (req, res, next) {
        try {
            let { branch_id, to_date, season_name, from_date, season_time } = req.body;

            const findBranchData = await BRANCHMODAL.findOne({ _id: branch_id }).populate('owner zone');
            if (findBranchData) {
                let fileData = req.file;
                const csvfilepath = path.join(__dirname, '..', fileData.path);
                const workbook = XLSX.readFile(csvfilepath, {
                    type: 'file',
                    raw: true, dateNF: 'YYYY-MM-DD', cellDates: true,
                });
                const sheetName = workbook.SheetNames[0];
                const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                // console.log({ sheetData })
                let zonePrice = findBranchData?.zone?.price;
                let zoneid = findBranchData?.zone;
                fs.unlinkSync(csvfilepath)
                let collectPhoneNumber = [];
                let studentCsvlist = [];
                let alreadyExistsData = [];
                let mobileNumberNotFoundData = [];
                let importData = [];
                let changeNToPuserData = [];
                let missingBirthDate = [];
                let sendingSmsPhoneNumber = [];

                // //working
                for (let userdata of sheetData) {
                    const capitalized = capitalizeWords(userdata?.name);
                    let useObjectData = {
                        name: capitalized,
                        // birth_date: moment(userdata.data_of_birth).add(1, 'days').format("YYYY-MM-DD"),
                        birth_date: moment(userdata?.data_of_birth).format("YYYY-MM-DD"),
                        // birth_date: userdata.data_of_birth,
                        blood_group: userdata?.blood_group,
                        instagram_Id: userdata?.instagram_Id,
                        gender: userdata?.gender?.toLowerCase(),
                    }
                    if (userdata.phone_number) {
                        collectPhoneNumber.push(userdata?.phone_number);

                        let findExistData = await USERMODAL.findOne({ phone_number: userdata.phone_number, is_deleted: false })

                        // console.log({ findExistData })
                        if (findExistData) {
                            alreadyExistsData.push({
                                ...useObjectData, phone_number: userdata.phone_number
                            })
                        } else {
                            importData.push({
                                ...useObjectData, phone_number: userdata.phone_number
                            })
                        }

                        if (findExistData && findExistData.roles == 'n-user') {
                            console.log({ mesg: 'user Already found', findExistData })
                            findExistData = await USERMODAL.findOneAndUpdate({ phone_number: userdata.phone_number, is_deleted: false }
                                , {
                                    ...useObjectData
                                }, { new: true })


                            changeNToPuserData.push({
                                ...useObjectData, phone_number: userdata.phone_number
                            })
                            if (alreadyExistsData && alreadyExistsData.length > 0) {
                                alreadyExistsData = alreadyExistsData.filter((existingData) => {
                                    const phoneNumber = existingData.phone_number;
                                    const existsInHangeNToPuserData = changeNToPuserData.some(
                                        (userData) => userData.phone_number === phoneNumber
                                    );
                                    return !existsInHangeNToPuserData;
                                });
                            }

                            await BRANCHMODAL.findOneAndUpdate(
                                { _id: branch_id },
                                {
                                    $pull: { approval_request_list: { $in: findExistData._id } }
                                },
                                { new: true }
                            );

                        } else {
                            // console.log('laaaa heree')
                            if (userdata.phone_number) {
                                if (!findExistData) {
                                    findExistData = await USERMODAL.create(
                                        {
                                            ...useObjectData,
                                            phone_number: String(userdata.phone_number),
                                            is_completed: false,
                                        })
                                }

                            }
                        }

                        if (findExistData && findExistData.roles == 'n-user') {

                            studentCsvlist.push(findExistData?._id)
                            let createNewPass = await PASSMODAL.create({
                                user: findExistData._id, pass_price: zonePrice, is_csv: true,
                                season_name: season_name ? season_name : allconfig.SEASSON_NAME,
                                zone: zoneid, payment_status: 'csv',
                                from_date: from_date ? from_date : allconfig.FROM_DATE, pass_status: 'Active',
                                garba_class: branch_id, season_time: season_time ? season_time : allconfig.SEASSON_TIME,
                                to_date: to_date ? to_date : allconfig.TO_DATE, is_completed: false,
                            })
                            await USERMODAL.findOneAndUpdate({ _id: findExistData._id, is_deleted: false },
                                {
                                    pass_list: createNewPass?._id, roles: 'p-user', is_completed: false, my_parkings: [],
                                    my_tickets: []
                                },
                                { new: true }
                            )

                            if (allconfig.PROD_ENVIRONMENT) {

                                sendingSmsPhoneNumber.push({
                                    phone: findExistData?.phone_number,
                                    username: capitalizeWords(findExistData?.name),
                                    eventname: season_name ? season_name : allconfig.SEASSON_NAME,
                                });
                            }
                        }

                    } else {
                        mobileNumberNotFoundData.push({
                            ...useObjectData
                        })
                    }
                }

                // let ownerFcmToken = findBranchData.owner.fcm_token ?? '';
                // if (ownerFcmToken) {
                //     // await USERMODAL.findOneAndUpdate({ _id: findBranchData.owner._id }, { $addToSet: { notifications: notification_id } });
                //     sendNotification({
                //         fcmtoken: ownerFcmToken, title: allconfig.GARBACLASS_OWNRER_MSG_TITLE,
                //         body: `You've got a new request from ${findUser?.data?.name} for your Garba class. Time to spread the Garba joy! 📬`,
                //         userid: findBranchData?.owner?._id
                //     })
                // }
                if (studentCsvlist && studentCsvlist.length > 0) {

                    await BRANCHMODAL.findOneAndUpdate(
                        { _id: branch_id },
                        {
                            $addToSet: { student_list: { $each: studentCsvlist } },
                            $pull: { approval_request_list: { $in: studentCsvlist } }
                        },
                        { new: true }
                    );

                    // await BRANCHMODAL.findOneAndUpdate({ _id: branch_id },
                    //     { $addToSet: { student_list: { $each: studentCsvlist } } }, { new: true }
                    // )
                }
                if (allconfig.PROD_ENVIRONMENT) {
                    winston.logger.info(`sendingSmsPhoneNumber :- ${JSON.stringify(sendingSmsPhoneNumber)}`);
                    const promises = sendingSmsPhoneNumber.map(async (playerData) => {
                        await sendotpfn.sendCsvPassUser({
                            phone: playerData?.phone,
                            username: playerData?.username,
                            eventname: playerData.eventname,
                        });
                    });

                    try {
                        await Promise.all(promises);
                        console.log("All sendCsvPassUser calls have completed successfully.");
                    } catch (error) {
                        console.error("An error occurred:", error);
                    }
                }


                res.status(200).json({
                    status: 1, message: 'CSV Import Succesfully',
                    exists_data: alreadyExistsData, changeNToPuserData,
                    imported_data: importData, mobileNumberNotFoundData
                })



            } else {
                res.status(404).json({ status: 0, message: 'Branch Not Found', })
            }


        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    importMediaPress: async function (req, res, next) {
        try {
            let { to_date } = req.body;

            let fileData = req.file;
            const csvfilepath = path.join(__dirname, '..', fileData.path);
            const workbook = XLSX.readFile(csvfilepath, {
                type: 'file',
                raw: true, dateNF: 'YYYY-MM-DD', cellDates: true,
            });
            const sheetName = workbook.SheetNames[0];
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            // console.log({ sheetData })

            let alreadyExistsData = [];
            let mobileNumberNotFoundData = [];
            let importData = [];
            let changeNToMediapressData = [];

            let findZone = await ZONE_MODAL.findOne({ is_deleted: false, press_zone: true });
            let zoneid = findZone?._id;
            fs.unlinkSync(csvfilepath)

            for (let userdata of sheetData) {
                const capitalized = capitalizeWords(userdata?.name);
                let useObjectData = {
                    name: capitalized,
                    birth_date: moment(userdata?.date_of_birth).format("YYYY-MM-DD"),
                    // birth_date: userdata.data_of_birth,
                    blood_group: userdata?.blood_group,
                    house_name: userdata?.house_name,
                    position: userdata?.position,
                    gender: userdata?.gender?.toLowerCase(),
                }
                if (userdata.phone_number) {
                    let findExistData = await USERMODAL.findOne({ phone_number: userdata.phone_number, is_deleted: false })

                    // console.log({ findExistData })
                    if (findExistData) {

                        if (findExistData && findExistData.roles == 'n-user') {

                            changeNToMediapressData.push({
                                ...useObjectData, phone_number: userdata.phone_number
                            })
                        } else {
                            alreadyExistsData.push({
                                ...useObjectData, phone_number: userdata.phone_number
                            })
                        }
                    } else {

                        findExistData = await USERMODAL.create(
                            {
                                ...useObjectData,
                                phone_number: String(userdata.phone_number),
                                is_completed: false,
                            })

                        importData.push({
                            ...useObjectData, phone_number: userdata.phone_number
                        })
                    }

                    if (findExistData && findExistData.roles == 'n-user') {
                        let createData = await MEDIAPRESSTICKET_MODAL.create({
                            user: findExistData._id, is_csv: true,
                            zone: zoneid, ...useObjectData, phone_number: userdata.phone_number,
                            is_completed: false,
                        })
                        findExistData = await USERMODAL.findOneAndUpdate({ phone_number: userdata.phone_number, is_deleted: false }
                            , {
                                media_press: createData?._id, roles: 'mediapress',
                                media_house: {
                                    house_name: userdata?.house_name,
                                    position: userdata?.position,
                                    ...useObjectData
                                }
                            }, { new: true })
                    }

                } else {
                    mobileNumberNotFoundData.push({
                        ...useObjectData
                    })
                }
                res.status(200).json({
                    status: 1, message: 'CSV Import Succesfully',
                    exists_data: alreadyExistsData, changeNToMediapressData,
                    imported_data: importData, mobileNumberNotFoundData
                })
            }

        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    addParkingPassUser: async function (req, res, next) {
        try {
            let { parking_id } = req.body;
            let { _id: user_id, roles, pass_list } = req.user;
            //parking is_privilegeuser:true parking 
            let findparking = parking_id ? await PARKINGMODAL.findOne({ _id: parking_id }) : '';
            if (findparking) {
                let parkingObj = {
                    array: [{
                        _id: findparking._id, qty: 1, price: Number(findparking.price)
                    }], modal: PARKINGMODAL, modalname: 'parking',
                    submodal: ORDERPARKINGMODAL,
                }

                const parkinglist = parking_id ? await FUNCTIONSLIST.processArray(parkingObj) : [];

                await FUNCTIONSLIST.assignedOrderTouser({
                    array: parkinglist, is_passuser: true,
                    modalname: 'parking', user_id: user_id,
                })
            }

            res.status(200).json({ status: 1, message: 'Parking Added' });

        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    addParkingActivePassUserbyAdmin: async function (req, res, next) {
        try {
            let { parking_id, revesed_parking, user_id } = req.body;
            console.log({ addParkingActivePassUserbyAdmin: req.body })
            //parking is_privilegeuser:true parking 
            let findparking = parking_id ? await PARKINGMODAL.findOne({ _id: parking_id, is_deleted: false }) : null;
            if (findparking) {
                let findUserData = user_id ? await USERMODAL.findOne({ _id: user_id, is_deleted: false }) : null;
                // console.log({ findparking })
                let findPass = findUserData ? await PASSMODAL.findOne({ _id: findUserData.pass_list, is_deleted: false }) : '';
                if (findUserData && findPass && findUserData.roles == 'p-user') {
                    console.log(findUserData);
                    console.log('found user')
                    let parkingObj = {
                        array: [{
                            _id: findparking._id, qty: 1, price: Number(findparking.price)
                        }], modal: PARKINGMODAL, modalname: 'parking', is_passuser: true,
                        submodal: ORDERPARKINGMODAL, is_reserved: revesed_parking,
                    }
                    console.log({ parkingObj });
                    const parkinglist = parking_id ? await FUNCTIONSLIST.processArray(parkingObj) : [];

                    await FUNCTIONSLIST.assignedOrderTouser({
                        array: parkinglist, is_passuser: true,
                        modalname: 'parking', user_id: user_id,
                    })
                    res.status(200).json({ status: 1, message: 'Parking Added' });
                } else {

                    res.status(200).json({ status: 0, message: 'User Not Found OR Pass is not Active.' });
                }

            } else {
                res.status(202).json({ status: 0, message: 'Parking Not Found' });
            }
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    addAdminAccessIds: async function (req, res, next) {
        try {
            let { ids, phone_number } = req.body;
            // access_ids
            let findData = await USERMODAL.findOne({ phone_number, is_deleted: false });
            if (findData && ids && ids.length > 0) {

                await USERMODAL.findOneAndUpdate({ phone_number, is_deleted: false }, { $addToSet: { access_ids: { $each: ids } }, roles: 'admin' }, { new: true });
                res.status(200).json({ status: 1, message: 'Access Added' });
            } else {
                res.status(200).json({ status: 0, message: 'user Not Fund..' });
            }


        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    addSalesTeam: async function (req, res, next) {
        try {
            let { phone_number, roles, ...formfileds } = req.body;
            // access_ids
            let findData = await USERMODAL.findOne({ phone_number, is_deleted: false });
            if (!findData && phone_number) {

                const file = req.file;
                let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'SalesTeam' }) : '';
                imagurlpath = status === 1 ? imagurlpath : '';

                let createData = await USERMODAL.create({
                    ...formfileds,
                    phone_number, profile_pic: imagurlpath,
                    roles: 'salesteam'
                });


                res.status(200).json({ status: 1, message: 'Sales Team Added', data: createData });
            } else {
                res.status(200).json({ status: 0, message: 'User Already Added OR Phone Number Not Valid' });
            }


        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    updateGroundStaff: async function (req, res, next) {
        try {
            let { qr_id, phone_number, remark, name, gender, blood_group } = req.body;
            logger.info(`--- Updating ground staff  ----`)
            logger.info(`Req.body :- ${JSON.stringify(req.body)}`);
            // access_ids
            let finduser = await USERMODAL.findOne({ phone_number: phone_number, is_deleted: false });
            let findData = await GROUND_STAFF_QR.findOne({ _id: qr_id, is_deleted: false });
            if (!finduser && findData) {

                // let createData = await USERMODAL.create({
                //     ...formfileds, remark,
                //     phone_number,
                //     ...(imagurlpath && { profile_pic: imagurlpath }),
                //     roles: 'groundstaff'
                // });

                // let ticketQr = await GROUND_STAFF_QR.create({
                //     user: createData?._id,
                //     provided_id,
                // })

                // let gsqrcode = FUNCTIONSLIST.encryptData({
                //     data: JSON.stringify({
                //         id: ticketQr?._id,
                //         type: 'staff'
                //     })
                // });

                // await GROUND_STAFF_QR.findOneAndUpdate({
                //     _id: ticketQr?._id,
                // }, { qr_code: gsqrcode }, { new: true })

                let updatedData = await USERMODAL.findOneAndUpdate({
                    _id: findData.user,
                }, { phone_number, remark, name, gender, blood_group }, { new: true });

                res.status(200).json({ status: 1, message: 'Ground staff Member Added', data: updatedData });
            } else {
                res.status(200).json({ status: 0, message: 'User Already Added OR Phone Number Not Valid' });
            }


        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    activeGroundStaffQrcode: async function (req, res, next) {
        try {
            let { gsqrcode } = req.user;
            let findData = await GROUND_STAFF_QR.findOne({ qr_code: gsqrcode, is_deleted: false });
            if (findData) {
                const file = req.file;
                let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'GroundStaff' }) : '';
                imagurlpath = status === 1 ? imagurlpath : '';
                await GROUND_STAFF_QR.findOneAndUpdate({ _id: findData._id, is_deleted: false, profile_pic: imagurlpath }, { is_active: true }, { new: true });
                let updatedData = await USERMODAL.findOneAndUpdate({
                    _id: findData.user,
                }, { profile_pic: imagurlpath }, { new: true });

                res.status(200).json({ status: 1, message: 'Ground staff Activeted', data: updatedData });
            } else {
                res.status(200).json({ status: 0, message: 'Ground staff Member Not Found.' });
            }
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    activeMediaPress: async function (req, res, next) {
        try {
            let { media_press } = req.user;
            let findData = await MEDIAPRESSTICKET_MODAL.findOne({ _id: media_press, is_deleted: false });
            if (findData) {
                const file = req.file;
                let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'MediaPress' }) : '';
                imagurlpath = status === 1 ? imagurlpath : '';
                await MEDIAPRESSTICKET_MODAL.findOneAndUpdate({ _id: findData._id, is_deleted: false, profile_pic: imagurlpath }, { is_active: true }, { new: true });

                res.status(200).json({ status: 1, message: 'Media Press Activeted', data: updatedData });
            } else {
                res.status(200).json({ status: 0, message: 'Media Press Not Found.' });
            }
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    groundStaffQrcode: async function (req, res, next) {
        try {
            let findData = await USERMODAL.find({ is_deleted: false, roles: 'groundstaff' }).select('gsqrcode');
            res.status(200).json({ status: 1, message: 'Ground staff Qr', data: findData });
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    allGroundStaff: async function (req, res, next) {
        try {
            let findData = await USERMODAL.find({ roles: 'groundstaff', is_deleted: false });
            if (findData) {
                res.status(200).json({ status: 1, message: 'All Ground Staff', data: findData });
            } else {
                res.status(200).json({ status: 0, message: 'All Ground Staff Not Found..' });
            }
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    allMediaPress: async function (req, res, next) {
        try {
            let findData = await USERMODAL.find({ roles: 'mediapress', is_deleted: false })
                .populate([
                    {
                        path: 'media_press',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                        populate: [
                            {
                                path: 'zone',
                                match: { _id: { $exists: true } },
                                select: '-createdAt -updatedAt',
                                populate: [
                                    {
                                        path: 'gates checkpoints',
                                        match: { _id: { $exists: true } },
                                        select: '-createdAt -updatedAt',
                                    }
                                ]
                            }
                        ]

                    },
                ]);
            if (findData) {
                res.status(200).json({ status: 1, message: 'All Media Press Team', data: findData });
            } else {
                res.status(200).json({ status: 0, message: 'All Media Press Not Found..' });
            }
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    allSalesTeam: async function (req, res, next) {
        try {
            let findData = await USERMODAL.find({ roles: 'salesteam', is_deleted: false });
            if (findData) {
                res.status(200).json({ status: 1, message: 'All Sales Team', data: findData });
            } else {
                res.status(200).json({ status: 0, message: 'Sales Team Not Found..' });
            }
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    updateAdminAccessIds: async function (req, res, next) {
        try {
            let { ids, phone_number } = req.body;
            // access_ids
            let findData = await USERMODAL.findOne({ phone_number, is_deleted: false });
            if (findData && ids && ids.length > 0) {

                await USERMODAL.findOneAndUpdate({ phone_number, is_deleted: false }, { access_ids: [...new Set(ids)] }, { new: true });
                res.status(200).json({ status: 1, message: 'Access Added' });
            } else {
                res.status(200).json({ status: 0, message: 'user Not Fund..' });
            }


        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    showQrCode: async function (req, res, next) {
        try {

            res.status(200).json({ show: allconfig.QR_CODE, status: 1 });

        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    allPasses: async function (req, res, next) {
        try {
            let getALLdata = await PASSMODAL.find({})
                .populate([
                    {
                        path: 'user assigned_user garba_class zone parking childrens_list',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                    }
                ])
            res.status(200).json({ status: 1, message: 'Pass Details', data: getALLdata })
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    addmentorInPass: async function (req, res, next) {
        try {
            let { pass_id, phone_number, name, ...formfiled } = req.body;
            console.log(req.body)
            let findData = await PASSMODAL.findOne({ _id: pass_id, is_deleted: false, is_expire: false });
            let findMentor = await PASS_MENTOR.findOne({ phone_number, is_deleted: false, is_expire: false });
            if (findMentor) {
                return res.status(200).json({ status: 0, message: 'Already Mentor Added...' });
            }
            if (findData) {

                const file = req.file;
                let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'Users' }) : '';
                imagurlpath = status === 1 ? imagurlpath : '';

                if (phone_number) {
                    let creadtedData = await PASS_MENTOR.create({
                        ...formfiled,
                        phone_number, name,
                        profile_pic: imagurlpath
                    })
                    await PASSMODAL.findOneAndUpdate({ _id: findData._id }, { $addToSet: { mentor_list: creadtedData._id } }, { new: true });
                    let findParent = await USERMODAL.findOne({ _id: findData.user, is_deleted: false });
                    if (MSG91ENABLE) {
                        let sendingData = {
                            parentname: findParent?.name,
                            personname: name, eventname: allconfig?.SEASSON_NAME,
                            phone: findParent?.phone_number,
                        }
                        await sendotpfn.sendMentorShip({
                            ...sendingData
                        });
                        await sendotpfn.mentorInvitationWp({
                            ...sendingData
                        });
                    }

                    res.status(200).json({ status: 0, message: 'mentor Added...' });
                } else {
                    res.status(200).json({ status: 0, message: 'Phone Number Not Found..' });
                }

            } else {
                res.status(200).json({ status: 0, message: 'Pass Not Found..' });
            }
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: error });
        }
    },
    removedMentorInPass: async function (req, res, next) {
        try {
            let { pass_id, mentor_id } = req.body;
            let findData = await PASSMODAL.findOne({ _id: pass_id, is_deleted: false, is_expire: false });
            if (findData) {
                await PASSMODAL.findOneAndUpdate({ _id: findData._id }, { $pull: { mentor_list: mentor_id } }, { new: true });
                res.status(200).json({ status: 0, message: 'Mentor Removed...' });
            } else {
                res.status(200).json({ status: 0, message: 'Pass Not Found..' });
            }
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: error });
        }
    },

    updatePassUserData: async function (req, res, next) {
        try {
            let { instagram_id, blood_group } = req.body;
            let { _id: user_id, pass_list } = req.user;
            const file = req.file;
            let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'Users' }) : '';
            imagurlpath = status === 1 ? imagurlpath : '';
            let findUser = await USERMODAL.findOneAndUpdate({ _id: user_id, is_deleted: false }, { profile_pic: imagurlpath, is_completed: true, instagram_id, blood_group }, { new: true });
            await PASSMODAL.findOneAndUpdate({ _id: pass_list }, { is_completed: true }, { new: true });
            res.status(200).json({ status: 1, message: 'User Update Succesfully.' });
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    allAdmin: async function (req, res, next) {
        try {
            let allData = await USERMODAL.find({ roles: 'admin', is_deleted: false });
            res.status(200).json({ status: 1, message: 'Admin Data.', data: allData });
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    allUsers: async function (req, res, next) {
        try {
            let allData = await USERMODAL.find({ is_deleted: false });
            res.status(200).json({ status: 1, message: 'Users Data.', data: allData });
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    errorServerLogs: async function (req, res, next) {
        try {
            const filePath = path.join(__dirname, '../logsErrors.log');
            // const filePath = 'logsDebugs.log';
            console.log(filePath)
            // Use the fs.readFile() function to read the file asynchronously
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading the file: ${err}`);
                    res.status(200).json({ status: 0, data: err });
                    return;
                }

                // The file contents are available in the 'data' variable
                res.status(200).json({ status: 0, data: data });

            });

        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    infoServerLogs: async function (req, res, next) {
        try {
            const filePath = path.join(__dirname, '../logsInfos.log');
            // const filePath = 'logsDebugs.log';
            console.log(filePath)
            // Use the fs.readFile() function to read the file asynchronously
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading the file: ${err}`);
                    res.status(200).json({ status: 0, data: err });
                    return;
                }

                // The file contents are available in the 'data' variable
                res.status(200).json({ status: 0, data: data });

            });

        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    debugServerLogs: async function (req, res, next) {
        try {
            const filePath = path.join(__dirname, '../logsDebugs.log');
            // const filePath = 'logsDebugs.log';
            console.log(filePath)
            // Use the fs.readFile() function to read the file asynchronously
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading the file: ${err}`);
                    res.status(200).json({ status: 0, data: err });
                    return;
                }

                // The file contents are available in the 'data' variable
                res.status(200).json({ status: 0, data: data });

            });

        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    serverLogs: async function (req, res, next) {
        try {
            let { page, size } = req.query;
            const pageNum = page ? page : 1;
            const pageSize = size ? size : 20;

            const skip = (pageNum - 1) * pageSize;
            let gettData = await SERVER_LOG_MODAL.find({}).sort({ createdAt: -1 }).skip(skip).limit(pageSize);
            res.status(200).json({ status: 1, message: 'Server logs', data: gettData });

        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    updatePassuser: async function (req, res, next) {
        try {
            let { user_id, phone_number, instagram_id, blood_group, birth_date, name, gender, } = req.body;
            let findData = await USERMODAL.findOne({ _id: user_id, is_deleted: false });
            if (findData) {

                if (findData.roles == 'p-user') {
                    console.log('kkkk')
                    await USERMODAL.findOneAndUpdate({ _id: findData._id, is_deleted: false }, { instagram_id, blood_group, birth_date, name, gender, phone_number }, { new: true });
                }
                if (findData.roles == 'n-user') {
                    //branch ?
                    //roles 

                }
                res.status(200).json({ status: 1, message: 'Pass user Update Succesfully' });
            } else {
                res.status(200).json({ status: 1, message: 'Pass user not Found.' });
            }

        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: error });
        }
    },
    test: async function (req, res, next) {
        try {

        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
};

function handleOperations({ arr, items, remove, update }) {
    if (remove && items && items.length) {
        return arr = arr.filter(itlam => !items.some(item => itlam.mg_id == item.mg_id));
    }

    if (update) {
        for (const { mg_id, block, access } of items) {
            const itemToUpdate = arr.find(item => item.mg_id.toString() === mg_id);
            if (itemToUpdate) {
                if (block !== undefined) {
                    itemToUpdate.block = block;
                    itemToUpdate.access = false;
                }
                if (access !== undefined) {
                    itemToUpdate.access = access;
                    itemToUpdate.block = true;
                }
            } else {
                arr = items;
            }
        }
        return arr;
    }
}

console.log(IP.address())
let sentjwtToken = async ({ user, statusCode, message = 'Something is Wrong!', res, status = 0, req }) => {
    try {
        // console.log({ user })
        let user_ip = req.header('x-forwarded-for');;
        // let user_ip = req.ip;
        // let user_ip = req.connection.remoteAddress;
        const token = getJwtToken({ phone_number: user.phone_number });
        console.log({ token })
        console.log({ user_ip })
        // const token = user.getJwtToken();

        const options = {
            expires: new Date(
                Date.now() + 2500 * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
        };
        if (user) {
            await USERMODAL.findOneAndUpdate({ _id: user._id, is_deleted: false }, { token: token, user_ip }, { new: true })
            user = await USERMODAL.findOne({ _id: user._id }).populate([...populateOptions])
                .select('-orders -order_parkings -order_tickets -pending_approval');
        }
        let userPhonNumber = user.phone_number.trim();
        console.log({ userPhonNumber })
        if (tokensByUserId[userPhonNumber]) {
            tokensByUserId[userPhonNumber].forEach(async oldToken => {
                // Remove or blacklist oldToken
                console.log({ oldToken })
                //device id condition added
                // NOTIFICATION({ fcmToken: user.fcm_token, eventtype: 'logout', userid: user._id });

            });
            tokensByUserId[userPhonNumber] = [];
        }
        // Store the new token
        if (!tokensByUserId[userPhonNumber]) {
            tokensByUserId[userPhonNumber] = [];
        }
        tokensByUserId[userPhonNumber].push(token);

        res.status(statusCode).cookie('token', token, options).json({
            success: true,
            data: user, status,
            token, message
        })
    } catch (err) {
        console.log(err);
    }

}

function capitalizeWords(input) {
    return input?.replace(/\b\w/g, (char) => char?.toUpperCase());
}

let getJwtToken = function ({ phone_number }) {

    return JWT.sign({ phone_number: phone_number }, allconfig.JWT_SECRET, { expiresIn: allconfig.JWT_EXPIRE })
}
function applyDiscount({ originalPrice, discountPercentage }) {
    if (discountPercentage < 0 || discountPercentage > 100) {
        throw new Error('Invalid discount percentage');
    }

    const discountAmount = (originalPrice * discountPercentage) / 100;
    const discountedPrice = originalPrice - discountAmount;

    return discountedPrice;
}
function sendNotification({ fcmtoken = '', title = '', body = '', userid = '' }) {
    if (fcmtoken) {
        NOTIFICATION({ fcmToken: fcmtoken, title, body, userid });
    }
}

async function getuserInfo({ searhfield }) {
    const existUser = await USERMODAL.findOne({ ...searhfield, is_deleted: false }).populate([...populateOptions])
        .select('-orders -order_parkings -order_tickets -pending_approval');
    return existUser;
}

// let phoneNumbers = ['6359262206']

async function send() {
    // await sendotpfn.deroppedMessage({
    //     toNumber: '9723646476', toname: 'Rajni',
    //     provideby: 'Rahil', topicname: 'Event Tickets'
    // })
    // await sendotpfn.sendPdf({
    //     transaction_Id: 'das54a54da654d5a', billdesk_order_id: '45465464645',
    //     receiverNumber: '9998413323', receiverName: 'harsh', createdAt: "Aug 12 2023", total_tax: 1,
    //     discount_price: 15,
    //     amount: '200', tickets: [{
    //         ticket_name: 'vip', qty: 1, price: 200
    //     }], twoWheelers: [{
    //         parking_name: 'TW-01',
    //         qty: 1, price: 100
    //     }], gstin: 'ASDAD4546ASD4654ASD', fourWheelers: [{
    //         parking_name: 'FW-01',
    //         qty: 1, price: 100
    //     }]
    // })
    // await USERORDERPARKINGMODAL.updateMany({ is_used: false, }, { allow_change: true });

    // await sendotpfn.sendComplimantoryCode({
    //     phone: '9687058787', nametype: 'Kesariya',
    //     complimantorycode: 'AX4545DD',

    // });
    // await sendotpfn.sendApprovalRequest({
    //     // phone: '9687058787', statusval: 'Rejected',
    //     phone: '9723646476', statusval: 'Rejected',
    //     username: 'Rahil',
    // });
    // await sendotpfn.deroppedMessage({
    //     toNumber: '9327008457', toname: 'Vishakha',
    //     provideby: 'Rajni', topicname: 'Garba'
    // })
    // await sendotpfn.sendCsvPassUser({
    //     phone: '9723646474',
    //     username: 'Mohan',
    //     eventname: 'KESARIYA NAVRATRI 2023',
    // });
    // await PASSMODAL.updateMany({ pass_status: 'Active' }, { is_active: true })
    // await PASSMODAL.updateMany({}, { pass_time: '07:00 PM', season_time: '07:00 PM', from_date: '2023-10-15', to_date: '2023-10-24' })
    // await PASSMODAL.updateMany({}, { pass_image: 'https://digieventtest.sgp1.cdn.digitaloceanspaces.com/Templete/PassTemplete.jpeg' })

    // await USERMODAL.deleteMany({ roles: { $nin: ["superadmin", "branchowner", "garbaclassowner"] } });
    // var parkings = [
    //     { _id: "6507447c7881aac55145beb1" }
    // ];
    // var event_id = "650729d31fd11ac0b7e1cc65";
    // var user_id = "650744657881aac55145be9b";
    // await FUNCTIONSLIST.assignedOrderTouser({
    //     array: parkings, event_id: event_id,
    //     modalname: 'parking', user_id: user_id,
    // })
    let studentCsvlist = [];
    // for (number of phoneNumbers) {
    //     let findUser = await USERMODAL.findOne({ phone_number: number, is_deleted: false });
    //     console.log({ p: findUser?.phone_number, s: findUser?.roles })
    //     studentCsvlist.push(findUser?._id);

    // }

    // console.log(studentCsvlist);
    // await BRANCHMODAL.findOneAndUpdate(
    //     { _id: '650c4c777266f2a3d9a2a633' },
    //     {
    //         $addToSet: { student_list: { $each: studentCsvlist } },
    //     },
    //     { new: true }
    // );

    // await USERORDERPARKINGMODAL.updateMany({ pass_parking: true }, { is_used: false, allow_change: true });

    // let data = await ORDEREVENTCATEGORYMODAL.aggregate([
    //     {
    //         $group: {
    //             _id: {
    //                 event: '$event',
    //                 parent: '$parent'
    //             },
    //             totalQty: { $sum: '$qty' }
    //         }
    //     }
    // ])
    // console.log(data);

    // let count = await USERORDEREVENTCATEGORYMODAL.find({ parent: '64d77ccfff286f86b132cdb0', event: '650729d31fd11ac0b7e1cc65' }).count();
    // console.log({ count })

    // let staticsData = await ORDEREVENTCATEGORYMODAL.aggregate([
    //     {
    //         $group: {
    //             _id: {
    //                 event: '$event',
    //                 parent: '$parent'
    //             },
    //             totalQty: { $sum: '$qty' }
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: 'events',
    //             localField: '_id.event',
    //             foreignField: '_id',
    //             as: 'eventDetails'
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: 'ticketcategorys',
    //             localField: '_id.parent',
    //             foreignField: '_id',
    //             as: 'ticketDetails'
    //         }
    //     },
    //     {
    //         $unwind: '$eventDetails'
    //     },
    //     {
    //         $unwind: '$ticketDetails'
    //     },
    //     {
    //         $project: {
    //             'ticketDetails.ticket_name': 1, // Include the fields you want from 'ticketDetails'
    //             'ticketDetails.color_code': 1,
    //             // Add more fields as needed
    //             totalQty: 1, // Include the 'totalQty' field from the previous stage
    //             'eventDetails._id': 1,
    //             'eventDetails.event_name': 1, // Include any fields you need from 'eventDetails'
    //             'eventDetails.event_location': 1,
    //             // Add more fields as needed
    //         }
    //     }
    // ]);

    // console.log(staticsData);
    // let findBranchStudent = await BRANCHMODAL.findOne({ _id: '' })
    // for (stundent of findBranchStudent.student_list) {
    //     let findStunde = await USERMODAL.findOne({ _id: stundent });
    //     console.log(findStunde);
    //     await sendotpfn.sendCsvPassUser({
    //         phone: findStunde?.phone_number,
    //         username: findStunde?.name,
    //         eventname: allconfig.SEASSON_NAME,
    //     });

    // }
    // await USERMODAL.deleteMany({ "roles": "groundstaff" })
    // for (let i = 301; i <= 500; i++) {
    //     let createData = await USERMODAL.create({
    //         remark: 'Ground Staff',
    //         phone_number: i,
    //         name: 'Ground Staff',
    //         roles: 'groundstaff'
    //     });

    //     let ticketQr = await GROUND_STAFF_QR.create({
    //         user: createData?._id,
    //         provided_id: '650704e5d875a7b89d203222',
    //     })

    //     let gsqrcode = FUNCTIONSLIST.encryptData({
    //         data: JSON.stringify({
    //             id: ticketQr?._id,
    //             type: 'staff'
    //         })
    //     });
    //     await GROUND_STAFF_QR.findOneAndUpdate({
    //         _id: ticketQr?._id,
    //     }, { qr_code: gsqrcode.encryptedData }, { new: true })

    //     let updatedData = await USERMODAL.findOneAndUpdate({
    //         _id: createData?._id,
    //     }, { gsqrcode: gsqrcode.encryptedData }, { new: true });
    //     console.log(i);
    // }

    // await GROUND_STAFF_QR.updateMany({

    // }, { random_id: RANDOMID.generate() })
}
// send()

function calculateTotal({ array }) {
    if (array && array.length > 0) {
        const totalPrice = array.reduce((total, category) => {
            return total + (parseInt(category.price) * category.qty);
        }, 0);

        return totalPrice;
    } else {
        return 0;

    }
}

const startDate = moment('2023-09-14T08:38:06.802+00:00'); // Replace with your start date
const endDate = moment();   // Replace with your end date

const minutesDiff = endDate.diff(startDate, 'minutes');

console.log(`The difference is ${minutesDiff} minutes.`);

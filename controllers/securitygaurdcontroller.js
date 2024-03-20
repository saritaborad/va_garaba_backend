const { StatusCodes } = require('http-status-codes');
const moment = require('moment');
const crypto = require("crypto");
const winslogger = require('../utilis/logger');
const FUNCTIONSLIST = require('../helper/functions');
const ocenfileupload = require('../utilis/oceanspcecode');
const SECURITYGUARDMODAL = require('../models/securityguardmodal');
const SECURITYSCANNINGMODAL = require('../models/scaninglogsmodel');
const USERMODAL = require('../models/users.model');
const PARKINGMODAL = require('../models/parkingmodal');
const GATE_MODAL = require('../models/gatemodal');
const ZONE_MODAL = require('../models/zonemodal');
const CHECKPOINT_MODAL = require('../models/checkpointmodal');

const SOFASEATMODAL = require('../models/sofaseatmodal');

const USERORDEREVENTCATEGORYMODAL = require('../models/userorderticketcategorymodal');
const USERORDERPARKINGMODAL = require('../models/userorderparkingmodal');
const PASSMODAL = require('../models/passmodal');

const PRIVILEGEUSERORDERMODAL = require('../models/privilegeorderticketmodel');
const allconfig = require('../config/allconfig');

const GROUND_STAFF_QR = require('../models/groundstafffqrcode_model');
let scaningTicketModalType = {
    pass: PASSMODAL,
    ticket: USERORDEREVENTCATEGORYMODAL,
    parking: USERORDERPARKINGMODAL,
    privilege: PRIVILEGEUSERORDERMODAL,
    staff: GROUND_STAFF_QR,
}
let populdateDataObj = [
    {
        path: 'user',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt',
        options: { strictPopulate: false },
        select: 'profile_pic name gender phone_number',
    },
    {
        path: 'ticket_user',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt',
        options: { strictPopulate: false }
    },

    {
        path: 'gates zones parkings checkpoints parking',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt',
        options: { strictPopulate: false }
    },
    {
        path: 'zone',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt',
        populate: [
            {
                path: 'gates checkpoints',
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt',
                options: { strictPopulate: false }
            }
        ],
        options: { strictPopulate: false }
    },
    {
        path: 'event',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt',
        options: { strictPopulate: false },
        select: 'event_name portrait_image event_photo event_location event_band_name event_time event_day event_date',
    },
];
const logger = winslogger.logger;
module.exports = {
    create: async function (req, res, next) {
        try {
            const { guard_name, roles, phone_number, guard_gender, gate, checkpoint, parking, zone, ...gaurdfield } = req.body;
            logger.info(`Gaurd Creating  --- ${JSON.stringify(req.body)}`);

            if (guard_name) {


                const existSecurtiyGuard = await SECURITYGUARDMODAL.findOne({ phone_number: phone_number });
                if (existSecurtiyGuard) {
                    res.status(StatusCodes.OK).json({ status: 0, message: "Security Guard Already Exists" });

                } else {
                    const file = req.file;
                    let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'Securityguard' }) : '';
                    imagurlpath = status === 1 ? imagurlpath : '';

                    const securtiyGuardData = await SECURITYGUARDMODAL.create(
                        {
                            guard_name, ...gaurdfield,
                            ...(gate && { gate: gate }),
                            ...(checkpoint && { checkpoint: checkpoint }),
                            ...(parking && { parking: parking }),
                            ...(zone && { zone: zone }),
                            guard_gender, profile_pic: imagurlpath, phone_number: phone_number
                        }
                    );
                    let guardId = securtiyGuardData?._id;
                    let findUserData = await USERMODAL.findOne({ phone_number: phone_number, is_deleted: false })

                    if (guardId) {

                        if (findUserData) {

                            await SECURITYGUARDMODAL.findOneAndUpdate({ _id: guardId }, { user_id: findUserData?._id }, { new: true });
                            await USERMODAL.findOneAndUpdate({ _id: findUserData?._id, is_deleted: false }, {
                                guard: guardId, is_guard: true, roles: 'securityguard',
                            }, { new: true });
                        } else {
                            let createdUser = await USERMODAL.create({
                                roles: 'securityguard', is_guard: true, name: guard_name, guard: guardId,
                                gender: guard_gender, profile_pic: imagurlpath, phone_number: phone_number
                            })
                            await SECURITYGUARDMODAL.findOneAndUpdate({ _id: guardId }, { user_id: createdUser?._id }, { new: true });
                        }

                    } else {
                        logger.info('guardId not found...')
                    }
                    res.status(StatusCodes.OK).json({ status: 1, message: `Security Guard created`, data: securtiyGuardData });
                }
            } else {
                res.status(200).json({ status: StatusCodes.OK, message: 'Security Guard not found..' });
            }

        } catch (err) {
            logger.error(`Gaurd createing Error --- ${err}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while creating Securityguard', error: JSON.stringify(err) });
        }
    },
    getAll: async function (req, res, next) {
        try {
            let getALLData = await SECURITYGUARDMODAL.find({ is_deleted: false }).populate([{
                path: 'gate checkpoint zone parking',
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt',
            }]);
            res.status(StatusCodes.OK).json({ status: 1, message: `Security Guard list`, data: getALLData });

        } catch (err) {
            logger.error(`Gaurd getAll --- ${err}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while getting Securityguard', error: JSON.stringify(err) });
        }
    },
    getAllGate: async function (req, res, next) {
        try {
            let getALLData = await SECURITYGUARDMODAL.find({ gate: { $exists: true, $ne: null } }).populate('gate');

            res.status(StatusCodes.OK).json({ status: 1, message: `All gate`, data: getALLData });

        } catch (err) {
            logger.error(`Gaurd getAllGate Error--- ${err}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while gate', error: JSON.stringify(err) });
        }
    },
    getAllZone: async function (req, res, next) {
        try {
            let getALLData = await SECURITYGUARDMODAL.find({ zone: { $exists: true, $ne: null } }).populate('zone');

            res.status(StatusCodes.OK).json({ status: 1, message: `All zone`, data: getALLData });

        } catch (err) {
            logger.error(`Gaurd getAllZone Error --- ${err}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while zone', error: JSON.stringify(err) });
        }
    },
    getAllParking: async function (req, res, next) {
        try {
            let getALLData = await SECURITYGUARDMODAL.find({ parking: { $exists: true, $ne: null } }).populate('parking');

            res.status(StatusCodes.OK).json({ status: 1, message: `All parking`, data: getALLData });

        } catch (err) {
            logger.error(`Gaurd getAllParking Error --- ${err}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while parking', error: JSON.stringify(err) });
        }
    },
    getAllCheckpoint: async function (req, res, next) {
        try {
            let getALLData = await SECURITYGUARDMODAL.find({ checkpoint: { $exists: true, $ne: null } }).populate('checkpoint');

            res.status(StatusCodes.OK).json({ status: 1, message: `All checkpoint`, data: getALLData });

        } catch (err) {
            logger.error(`Gaurd getAllCheckpoint Error--- ${err}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while checkpoint', error: JSON.stringify(err) });
        }
    },
    update: async function (req, res, next) {
        try {
            let { guard_name, phone_number, guard_gender, gate, checkpoint, parking, zone, guard_id } = req.body;
            // let { guard } = req.user;
            logger.info(`Gaurd updating  --- ${JSON.stringify(req.body)}`);
            // let guard_id = guard;
            let getData = await SECURITYGUARDMODAL.findOne({ _id: guard_id });
            if (getData) {
                const file = req.file;
                let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'Securityguard' }) : '';
                imagurlpath = status === 1 ? imagurlpath : '';
                logger.info(`imagurlpath :- ${imagurlpath}`);

                await SECURITYGUARDMODAL.findOneAndUpdate({ _id: getData._id }, {
                    ...(gate && { $unset: { checkpoint: 1, parking: 1, zone: 1 }, gate: gate }),
                    ...(checkpoint && { $unset: { gate: 1, parking: 1, zone: 1 }, checkpoint: checkpoint }),
                    ...(zone && { $unset: { gate: 1, parking: 1, checkpoint: 1 }, zone: zone }),
                    ...(parking && { $unset: { gate: 1, zone: 1, checkpoint: 1 }, parking: parking }),
                    ...(imagurlpath && { profile_pic: imagurlpath }),
                    ...(guard_name && { guard_name: guard_name }),
                    ...(phone_number && { phone_number: phone_number }),
                    ...(guard_gender && { guard_gender: guard_gender }),
                }, { new: true, });
                // await USERMODAL.findOneAndUpdate({ guard: getData._id }, { profile_pic: imagurlpath, }, { new: true });
                res.status(StatusCodes.OK).json({ status: 1, message: `Security Guard updated` });
            } else {
                res.status(200).json({ status: StatusCodes.OK, message: 'Security Guard not found..' });
            }

        } catch (err) {

            logger.error(`Gaurd updateding  Error --- ${JSON.stringify(err)}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updatting Securityguard', error: JSON.stringify(err) });
        }
    },
    removedGuard: async function (req, res, next) {
        try {
            let { guard_id } = req.body;
            logger.info(`Gaurd remove   --- ${JSON.stringify(req.body)}`);
            let getData = await SECURITYGUARDMODAL.findOne({ _id: guard_id });
            if (getData) {
                await SECURITYGUARDMODAL.findOneAndUpdate({ _id: guard_id }, { $unset: { parking: 1, gate: 1, zone: 1, checkpoint: 1 } }, { new: true });
                // await USERMODAL.findOneAndUpdate({ guard: guard_id },
                //     { $unset: { guard: 1 }, is_guard: false },
                //     { new: true });
                res.status(200).json({ status: StatusCodes.OK, message: 'Security Guard Removed..', data: getData });
            } else {
                res.status(200).json({ status: StatusCodes.OK, message: 'Security Guard not found..' });
            }
        } catch (err) {
            logger.error(`Gaurd remove Error  --- ${err}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while Deleteing Securityguard', error: JSON.stringify(err) });
        }
    },
    delete: async function (req, res, next) {
        try {
            let { guard_id } = req.body;
            let getData = await SECURITYGUARDMODAL.findOne({ _id: guard_id });
            if (getData) {
                await SECURITYGUARDMODAL.findOneAndUpdate({ _id: guard_id }, {
                    is_deleted: true
                }, { new: true });
                res.status(StatusCodes.OK).json({ status: 1, message: `Security Guard deleted...` });
            } else {
                res.status(200).json({ status: StatusCodes.OK, message: 'Security Guard not found..' });
            }
        } catch (err) {
            logger.error(`Gaurd delete Error  --- ${err}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deletting Securityguard', error: JSON.stringify(err) });
        }
    },
    gaurdUserValided: async function (req, res, next) {
        try {
            // let { is_valid, id, type } = req.body;
            let { encrypted_data, is_valid, is_parking } = req.body;
            let decryptedData = await decryptData({ encryptedData: encrypted_data });
            let { id: ticket_id, type } = JSON.parse(decryptedData);
            let { _id: guard_id, guard } = req.user;
            // let ticket_id = id;
            logger.info(`Gaurd UserValided  --- ${JSON.stringify(req.body)}`);
            if (encrypted_data) {
                let modalData = scaningTicketModalType[type];

                let findTicketData = await modalData.findOne({ _id: ticket_id });

                if (findTicketData) {
                    let createScaning = '';
                    let findUser = ['ticket', 'parking'].includes(type) ? findTicketData?.ticket_user : findTicketData?.user;
                    let updateData = { is_valid: false, is_used: false, allow_change: true };
                    if (is_valid) {
                        if (type == 'pass') {
                            if (is_parking) {
                                await USERORDERPARKINGMODAL.findOneAndUpdate({ user: findTicketData.user, _id: findTicketData.parking, is_deleted: false }, { is_valid: true, is_used: true, allow_change: false }, { new: true });
                            } else {
                                updateData = { is_valid: true, is_used: true, allow_change: false };
                            }
                        } else {
                            updateData = { is_valid: true, is_used: true, allow_change: false };
                        }
                        createScaning = { status: 'Allowed' }
                    } else {
                        createScaning = { status: 'Rejected' }
                    }
                    if (createScaning) {
                        console.log({ findUser })

                        let gaurddata = await SECURITYGUARDMODAL.findOne({ _id: guard, is_deleted: false }).select('-scanningLogs');
                        addScaningLogs({ ...createScaning, type, [type]: ticket_id, guard: guard, gaurddata: gaurddata, user_id: findUser, is_maingate: true });
                        // let logData = await SECURITYSCANNINGMODAL.create({ ...createScaning, type, [type]: ticket_id, guard: guard, user: findUser });
                        // await SECURITYGUARDMODAL.findOneAndUpdate({ _id: guard }, { $addToSet: { scanningLogs: logData?._id } }, { new: true });
                    }

                    let ticketdata = await scaningTicketModalType[type].findOneAndUpdate({ _id: ticket_id },
                        { ...updateData }, { new: true }
                    ).populate([...populdateDataObj]).exec();
                    let findSeat = ticketdata?.seat;
                    logger.info(`Gaurd findSeat  --- ${JSON.stringify(findSeat)}`);
                    if (findSeat) {
                        await SOFASEATMODAL.findOneAndUpdate({ _id: findSeat }, { is_used: true, allow_change: false }, { new: true });
                    }

                    res.status(StatusCodes.OK).json({ status: 1, message: 'user is valided..', data: ticketdata });

                } else {
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Ticekt Not Found', });
                }
            } else {
                res.status(202).json({ status: 0, message: 'Encrypted data not found', });
            }


        } catch (error) {
            logger.error(`Gaurd UserValided error  --- ${error}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },

    scaning: async function (req, res, next) {
        try {
            let { id: ticket_id, type, encrypted_data } = req.body;

            logger.info('------------ Scan API Called ------------------------------');
            //  ****** testing *****
            // console.log({ encrypted_data });
            // let reqBodyData = { id: ticket_id, type };

            // let { _id: guard_id, guard } = req.user;
            // scaningTickets({ ticket_id, type, guard_id, guard, reqBodyData, res })
            // ****** testing ---


            if (encrypted_data) {
                logger.info("---- encrypted_data get---")
                logger.info(`encrypted_data ${JSON.stringify(encrypted_data)}`)
                let decryptedData = await decryptData({ encryptedData: encrypted_data });
                logger.info(`decryptedData ${JSON.stringify(decryptedData)}`)
                let { id: ticket_id, type } = JSON.parse(decryptedData);
                let reqBodyData = { id: ticket_id, type };
                logger.info(`reqBodyData ${JSON.stringify(reqBodyData)}`);
                if (ticket_id && type) {
                    let { _id: guard_id, guard } = req.user;

                    scaningTickets({ ticket_id, type, guard_id, guard, reqBodyData, res })

                } else {
                    res.status(202).json({ status: 0, id: ticket_id, type, ticket_not_found: true, message: 'Ticket or type data not found', });
                }
            } else {
                res.status(202).json({ status: 0, id: ticket_id, type, ticket_not_found: true, message: 'Encrypted data not found', });
            }
        } catch (err) {
            logger.error(`Gaurd scaning Error --- ${err}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while getting Securityguard', error: err });
        }
    },
    allScanLogs: async function (req, res, next) {
        try {
            let findData = await SECURITYSCANNINGMODAL.find({})
                .sort({ createdAt: -1 })
                .populate([
                    {
                        path: 'guard pass parking ticket privilege',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                    },
                    {
                        path: 'user',
                        match: { _id: { $exists: true } },
                        select: 'name gender profile_pic phone_number',
                    },
                ])
                .select('-location')

            res.status(StatusCodes.OK).json({ status: 1, message: 'All Scan Logs.', data: findData });

        } catch (err) {
            logger.error(`Gaurd allScanLogs Error --- ${err}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while getting Securityguard', error: JSON.stringify(err) });
        }
    },
    scantest: async function (req, res, next) {
        try {

            // let  { id: ticket_id, type };
            let ticket_id = '650b39c3aaaeeaf53fcc45fe';
            let type = 'ticket';
            let guard_id = '650ac52fa637e68967e32ff4';
            let guard = '650ac52fa637e68967e32ff1';
            // let guard_id = '6508395b729deca183910e63';
            // let guard = '6508395b729deca183910e60';
            let reqBodyData = { id: ticket_id, type };

            scaningTickets({ ticket_id, type, guard_id, guard, reqBodyData, res })

        } catch (err) {
            logger.error(`Gaurd scantest Error --- ${err}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while getting Securityguard', error: JSON.stringify(err) });
        }
    },
    test: async function (req, res, next) {
        try {

        } catch (err) {
            logger.error(`Gaurd test Error --- ${err}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while getting Securityguard', error: JSON.stringify(err) });
        }
    },
}

async function decryptData({ encryptedData, secretKey = allconfig.QR_SECRECT_KEY, iv = allconfig.QR_IV_KEY }) {
    try {
        const key = Buffer.from(secretKey, "hex");
        const decipher = crypto.createDecipheriv(
            "aes-128-cbc",
            key,
            Buffer.from(iv, "base64")
        );

        let decryptedData = decipher.update(encryptedData, "base64", "utf8");
        decryptedData += decipher.final("utf8");

        return decryptedData;

    } catch (error) {
        logger.error(`decryptData Error --- ${error}`);
        return error

    }
}
let scaningMessage = {
    'pass': {
        'parking': {
            'valid': 'Pass Parking is Valid.',
            'wrong': 'Your Are at Wrong Parking.',
            'novalid': 'Pass Parking is not Valid.',
            'deactive': 'Activate parking before scanning your Pass QR code.',
            'used': 'This Parking is Already used with this Pass.',
            'not_found': "You Don't Have Parking in Your Pass. Buy Parking to Enter..."
        },
        'gate': {
            'valid': 'Access granted. Enjoy the event.',
            'wrong': 'Please scan your Pass QR code at the your alloted main gate to enter.',
            'novalid': 'Pass is not Valid.',
            'deactive': 'Activate parking before scanning your Pass QR code.',
            'used': 'You have already checked in. No need to scan again.',
            'notused': 'You need to first check in Entry Main Gate.',
            'not_found': "You Don't Have Gate in Your Pass. Buy Pass to Enter..."
        },
        'zone': {
            'valid': 'Access granted. Enjoy the event.',
            'wrong': 'Your Are at Wrong Zone.',
            'novalid': 'Pass is not Valid.',
            'deactive': 'Activate Pass before scanning your Pass QR code.',
            'used': 'This Pass is Already used.',
            'notused': 'you need to check in Entry Gate.',
            'not_found': "You Don't Have Zone in Your Pass. Buy Pass to Enter..."
        },
        'checkpoint': {
            'valid': 'Access granted. Enjoy the event.',
            'wrong': 'Your Are at Wrong checkpoint.',
            'novalid': 'Pass is not Valid.',
            'deactive': 'Activate Pass before scanning your Pass QR code.',
            'used': 'This Pass is Already used.',
            'notused': 'you need to check in Entry Gate.',
            'not_found': "You Don't Have Checkpoint in Your Pass. Buy Pass to Enter..."
        },
    },
    'parking': {
        'parking': {
            'valid': 'You are at valid Parking.',
            'wrong': 'Your Are at Wrong Parking.',
            'novalid': 'Parking is not Valid.',
            'used': 'This Parking is Already used.',
            'deactive': 'Please Active your Parking.',
            'not_found': "You Don't Have Parking in Your Pass. Buy Parking to Enter..."
        }
    },
    'ticket': {
        'gate': {
            'valid': 'Access granted. Enjoy the event.',
            'wrong': 'Please scan your Ticket QR code at the your alloted main gate to enter.',
            'novalid': 'Ticket is not Valid.',
            'deactive': 'Activate parking before scanning your Ticket QR code.',
            'used': 'You have already checked in. No need to scan again.',
            'notused': 'You need to first check in Entry Main Gate.',
            'not_found': "You Don't Have Gate in Your Ticket. Buy Ticket to Enter..."
        },
        'zone': {
            'valid': 'Access granted. Enjoy the event.',
            'wrong': 'Your Are at Wrong Zone.',
            'novalid': 'Ticket is not Valid.',
            'deactive': 'Activate Ticket before scanning your Ticket QR code.',
            'used': 'This Ticket is Already used.',
            'notused': 'You need to first check in Entry Gate.',
            'not_found': "You Don't Have Zone in Your Ticket. Buy Ticket to Enter..."
        },
        'checkpoint': {
            'valid': 'Access granted. Enjoy the event.',
            'wrong': 'Your Are at Wrong checkpoint.',
            'novalid': 'Ticket is not Valid.',
            'deactive': 'Activate Ticket before scanning your Ticket QR code.',
            'used': 'This Ticket is Already used.',
            'notused': 'you need to check in Entry Gate.',
            'not_found': "You Don't Have Checkpoint in Your Ticket. Buy Ticket to Enter..."
        },
    },
    "privilege": {
        'gate': {
            'valid': 'Access granted. Enjoy the event.',
            'wrong': 'Please scan your Ticket QR code at the your alloted main gate to enter.',
            'novalid': 'Ticket is not Valid.',
            'deactive': 'Activate parking before scanning your Ticket QR code.',
            'used': 'You have already checked in. No need to scan again.',
            'notused': 'You need to first check in Entry Main Gate.',
            'not_found': "You Don't Have Gate in Your Ticket. Buy Ticket to Enter..."
        },
        'zone': {
            'valid': 'Access granted. Enjoy the event.',
            'wrong': 'Your Are at Wrong Zone.',
            'novalid': 'Ticket is not Valid.',
            'deactive': 'Activate Ticket before scanning your Ticket QR code.',
            'used': 'This Ticket is Already used.',
            'notused': 'You need to first check in Entry Gate.',
            'not_found': "You Don't Have Zone in Your Ticket. Buy Ticket to Enter..."
        },
        'checkpoint': {
            'valid': 'Access granted. Enjoy the event.',
            'wrong': 'Your Are at Wrong checkpoint.',
            'novalid': 'Ticket is not Valid.',
            'deactive': 'Activate Ticket before scanning your Ticket QR code.',
            'used': 'This Ticket is Already used.',
            'notused': 'you need to check in Entry Gate.',
            'not_found': "You Don't Have Checkpoint in Your Ticket. Buy Ticket to Enter..."
        },
        'ticket': {
            'valid': 'Access granted. Enjoy the event.',
            'wrong': 'Your Are at Wrong checkpoint.',
            'novalid': 'Ticket is not Valid.',
            'deactive': 'Activate Ticket before scanning your Ticket QR code.',
            'used': 'Access granted. Enjoy the event.',
            'notused': 'you need to check in Entry Gate.',
            'not_found': "You Don't Have Checkpoint in Your Ticket. Buy Ticket to Enter..."
        },
        'parking': {
            'valid': 'Access granted. Enjoy the event.',
            'wrong': 'Your Are at Wrong Parking.',
            'novalid': 'Parking is not Valid.',
            'deactive': 'Activate Parking before scanning your Ticket QR code.',
            'used': 'Access granted. Enjoy the event.',
            'notused': 'you need to check in Entry Gate.',
            'not_found': "You Don't Have Parking in Your Ticket. Buy Ticket to Enter..."
        },
    }

}

async function validTicketScanold(scaningData) {
    let { valided, ticketValid, tickertIsused, findTicketData, parkingdata = null, is_confirmation = false, not_found = false,
        createScaning, is_maingate = false, special_access = false,
        reqBodyData, parking_not_found = false, type, is_parking, ticket_type, access = true, message = null, res
    } = scaningData;
    console.log('scaningData :', {
        valided, ticketValid, tickertIsused, parkingdata,
        is_confirmation, not_found, createScaning, is_maingate,
        reqBodyData, parking_not_found, type, is_parking, ticket_type, access, message
    }
    )
    try {
        console.log({ valided })
        // console.log({ findTicketData })
        if (not_found) {
            return res.status(200).json({
                status: 1, ...reqBodyData, warning: true, message: scaningMessage[ticket_type][type]['not_found'], data: findTicketData,
            })
        }
        if (!access) {
            console.log({ valided: 'Access false ' })
            let msgStr = `Security Alert: Unauthorized access attempt detected at ${type}. Please investigate.`;
            let createScaningData = { ...createScaning, status: msgStr }

            addScaningLogs({ ...createScaning, ...createScaningData, is_maingate });
            return res.status(200).json({
                status: 1, ...reqBodyData, access: false, message: msgStr, data: findTicketData,
            })
        }
        if (parking_not_found && ticket_type == 'pass') {
            console.log({ valided: 'Parking Not Purchased ' })
            // status: 1, ...reqBodyData, message: `Parking Not Purchased.`, data: findTicketData,
            let msgStr = scaningMessage[ticket_type][type]['not_found'];
            let createScaningData = { ...createScaning, status: msgStr }
            addScaningLogs({ ...createScaning, ...createScaningData, is_maingate });
            return res.status(200).json({
                status: 1, ...reqBodyData, warning: true, message: msgStr, data: findTicketData,
            })
        }

        if (valided) {

            if (['checkpoint', 'zone'].includes(type) && !tickertIsused || ['gate'].includes(type) && !is_maingate && !tickertIsused) {
                console.log('type : ', ['gate'].includes(type), is_maingate, tickertIsused)
                let msgStr = scaningMessage[ticket_type][type]['notused'];
                let createScaningData = { ...createScaning, status: msgStr }
                addScaningLogs({ ...createScaning, ...createScaningData, is_maingate });
                return res.status(200).json({
                    status: 1, ...reqBodyData, warning: true, message: msgStr, data: findTicketData,
                })
            }

            if (tickertIsused) {
                if (['checkpoint', 'zone', 'gate'].includes(type) && tickertIsused) {
                    let msgStr = scaningMessage[ticket_type][type]['valid'];
                    let createScaningData = { ...createScaning, status: msgStr }
                    addScaningLogs({ ...createScaning, ...createScaningData, is_maingate });
                    return res.status(200).json({
                        status: 1, ...reqBodyData, access: true,
                        message: msgStr, data: findTicketData,
                    })
                } else {
                    let msgStr = scaningMessage[ticket_type][type]['used'];
                    let createScaningData = { ...createScaning, status: msgStr }
                    addScaningLogs({
                        ...createScaning, ...createScaningData,
                        is_maingate
                    });
                    return res.status(200).json({
                        status: 1, ...reqBodyData,
                        ...(special_access && { access: true }),
                        message: msgStr, data: findTicketData,
                    })
                }
            } else {
                let ticketisActive = is_parking && ticket_type == 'pass' ? parkingdata?.is_active : findTicketData?.is_active;
                console.log({ ticketisActive, ticketValid })
                if (ticketisActive) {
                    if (ticketValid) {
                        let msgStr = scaningMessage[ticket_type][type]['valid'];
                        let createScaningData = { ...createScaning, status: msgStr }
                        addScaningLogs({ ...createScaning, ...createScaningData, is_maingate });
                        return res.status(200).json({
                            status: 1, ...reqBodyData,
                            ...(is_parking && { is_parking: is_parking }),
                            is_confirmation: is_confirmation, access: true,
                            message: msgStr, data: findTicketData,
                        })
                    } else {
                        let msgStr = scaningMessage[ticket_type][type]['novalid'];
                        let createScaningData = { ...createScaning, status: msgStr }
                        addScaningLogs({
                            ...createScaning, ...createScaningData,
                            is_maingate
                        });
                        return res.status(200).json({
                            status: 1, ...reqBodyData, access: false,
                            message: msgStr, data: findTicketData,
                        })
                    }
                } else {
                    let msgStr = scaningMessage[ticket_type][type]['deactive'];
                    let createScaningData = { ...createScaning, status: msgStr }
                    addScaningLogs({ ...createScaning, ...createScaningData, is_maingate });
                    return res.status(200).json({
                        status: 1, ...reqBodyData,
                        ...(is_parking && { is_parking: is_parking }),
                        warning: true,
                        is_confirmation: false, message: msgStr, data: findTicketData,
                    })
                }

            }
        } else {
            let msgStr = scaningMessage[ticket_type][type]['wrong'];
            let createScaningData = { ...createScaning, status: msgStr }
            addScaningLogs({ ...createScaning, ...createScaningData, is_maingate });
            return res.status(200).json({
                status: 1, ...reqBodyData, message: msgStr, data: findTicketData,
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            status: 1, ...reqBodyData, message: "Something wrong", error
        })
    }
}


async function scaningTickets(scanigTicketsData) {
    let { ticket_id, type, guard_id, guard, reqBodyData, res } = scanigTicketsData;
    try {
        logger.info(`scanigTicketsData  body data --- ${JSON.stringify({ ticket_id, type, guard_id, guard, reqBodyData })}`);
        if (ticket_id && type) {

            let validTcketType = ['parking', 'pass', 'privilege', 'ticket', 'staff'].includes(type);
            let findData = await scaningTicketModalType[type].findOne({ _id: ticket_id });
            let findGuard = await SECURITYGUARDMODAL.findOne({ is_deleted: false, user_id: guard_id }).select('-scanningLogs');

            if (!findGuard) {
                res.status(StatusCodes.OK).json({ status: 1, ...reqBodyData, is_valid: false, message: 'Guard Not Found', data: null });
            }

            logger.info(`findGuard --- ${findGuard?._id, findGuard?.phone_number}`);

            let createScaning = { guard: guard, type, [type]: ticket_id, gaurddata: findGuard, guard_id };
            let getALLData = await SECURITYGUARDMODAL.findOne({ is_deleted: false, user_id: guard_id }).populate([{
                path: 'gate checkpoint zone parking',
                match: { _id: { $exists: true } },
                select: '-createdAt -updatedAt',
            }]).select('-scanningLogs');


            if (!findData) {
                addScaningLogs({ ...createScaning, status: 'Ticekt Not Found' });
                res.status(StatusCodes.OK).json({ status: 1, ...reqBodyData, is_valid: false, message: 'Ticekt Not Found', data: null });
            } else {

                logger.info(`validTcketType  --- ${validTcketType}`);
                if (!validTcketType) {
                    addScaningLogs({ ...createScaning, status: 'Ticket Type is not valid' });
                    return res.status(202).json({
                        status: 0, ...reqBodyData, message: 'Ticket Type is not valid', data: null,
                    })
                } else {
                    let findTicketData = await scaningTicketModalType[type].findOne({ _id: ticket_id, is_deleted: false }).populate([...populdateDataObj]).exec();

                    if (findTicketData) {
                        findTicketData = findTicketData.toObject();

                        // ground staff reamaining
                        if (type == 'press') {

                        }
                        if (type == 'staff') {

                        }

                        let findUser = ['ticket', 'parking'].includes(type) ? findTicketData?.ticket_user : findTicketData?.user;
                        logger.info(`findUser :- ${JSON.stringify(findUser)}`)
                        createScaning = { ...createScaning, user_id: findUser };
                        logger.info(`createScaning 111 :- ${JSON.stringify(createScaning)}`)
                        let eventDate = '2023-10-11'//findTicketData?.event?.event_date;
                        const todayDate = moment().startOf('day');
                        // const previousDate = moment().subtract(1, 'days').startOf('day');

                        logger.info(`findTicketData --- ${JSON.stringify(findTicketData)}`);

                        //special access remaining

                        if (['parking', 'ticket'].includes(type)) {
                            // Specific date you want to compare
                            const specificDate = eventDate ? moment(eventDate) : '';

                            // Calculate the difference in days
                            const daysDifference = todayDate.diff(specificDate, 'days');

                            logger.info(`daysDifference :- ${daysDifference}`);

                            // if (daysDifference === 1) {
                            //     return res.status(202).json({
                            //         status: 0, message: "Ticket Has Expired! You're late.", data: null,
                            //     })
                            // } else if (eventDate != todayDate) {
                            //     console.log('validdd eveent date..')
                            //     console.log({ eventDate });
                            //     return res.status(202).json({
                            //         status: 0, message: "Your Ticket Is Not Valid For Today", data: null,
                            //     })
                            // }
                        }
                        const convertToString = (value) => (value != null ? String(value) : null);
                        let gateId = convertToString(findGuard?.gate);
                        let zoneId = convertToString(findGuard?.zone);
                        let checkpointId = convertToString(findGuard?.checkpoint);
                        let parkingId = convertToString(findGuard?.parking);

                        let guardMainGate = getALLData?.gate?.is_main;
                        let ticketExpire = findTicketData?.is_expire ? findTicketData?.is_expire : false;
                        let eventBaseValidation = false;
                        let ticketValid = false;

                        let responseData = {
                            status: 0,
                            ...reqBodyData,
                            message: 'Please Give Valid Type',
                            data: null
                        };
                        logger.info(`gateId :- ${gateId}`)
                        logger.info(`checkpointId :- ${checkpointId}`)
                        logger.info(`zoneId :- ${zoneId}`)
                        logger.info(`parkingId :- ${parkingId}`)
                        let gaurdtype = gateId ? 'gate' : parkingId ? 'parking' : checkpointId ? 'checkpoint' : zoneId ? 'zone' : 'Position';

                        let tickertIsused = findTicketData?.is_used;
                        logger.info(`${JSON.stringify({ parking: type == 'parking', type })}`)
                        if (type == 'parking') {
                            let validParking = String(findTicketData.parent) == parkingId;
                            logger.info('into parking', findTicketData.parent, parkingId);

                            validTicketScan({
                                valided: validParking, is_parking: true, ticket_type: 'parking', is_confirmation: true, createScaning,
                                ticketValid: validParking, tickertIsused, findTicketData, type: 'parking', reqBodyData, res,
                            })
                            return false;
                            delete findTicketData.user;
                        } else {
                            logger.info("Please're sure you're in switch case");
                            if (ticketExpire) {
                                addScaningLogs({ ...createScaning, status: "Ticket Has Expired! You're late.", });
                                return res.status(200).json({
                                    status: 1, ...reqBodyData, message: "Ticket Has Expired! You're late.", data: findTicketData,
                                })
                            } else {

                                logger.info(`guardMainGate ${guardMainGate}`);
                                logger.info(`tickertIsused ${tickertIsused}`);

                                if (guardMainGate && tickertIsused) {

                                    addScaningLogs({ ...createScaning, status: "Already Checked in." });
                                    return res.status(200).json({
                                        status: 1, message: "Already Checked in", ...reqBodyData, access: false, data: findTicketData,
                                    })
                                } else {

                                    // if (tickertIsused) {

                                    let tickettype = type;

                                    let guardZone = getALLData?.zone;
                                    let ticketDataGate = findTicketData?.gate ?? findTicketData?.gates;
                                    let checkpointData = findTicketData?.checkpoint ?? findTicketData?.checkpoints;
                                    let ticketAllGates = ticketDataGate && ticketDataGate.map(gate => String(gate?._id));
                                    let filterMainGates = ticketDataGate && ticketDataGate.filter(gate => gate.is_main == true);
                                    let gateMains = filterMainGates && filterMainGates.map(gate => String(gate?._id));
                                    let ticketDataZone = findTicketData?.zone ?? findTicketData?.zones;
                                    //pass
                                    let ZonesGates = ticketDataZone?.gates || [];
                                    let ZonesCheckpoints = ticketDataZone?.checkpoints || [];
                                    let zoneAllGatesIds = ZonesGates && ZonesGates.map(gate => String(gate?._id));
                                    let filterMainZoneGates = ZonesGates && ZonesGates.filter(gate => gate?.is_main == true);
                                    let zoneMainGatesids = filterMainZoneGates && filterMainZoneGates.map(gate => String(gate?._id));
                                    let ZonesCheckpointsids = ZonesCheckpoints && ZonesCheckpoints.map(checkpoint => String(checkpoint?._id));
                                    let allTicketZoneIds = ticketDataZone && ticketDataZone?.length > 0 ? ticketDataZone.map(zone => String(zone?._id)) : String(ticketDataZone?._id);
                                    let userSpecialAccess = findTicketData && findTicketData?.special_access ? true : false;
                                    let userSpecialAccessblock = findTicketData && findTicketData?.access_block ? true : false;
                                    let userSpecialAccessIds = userSpecialAccess ? findTicketData?.special_accessids?.map(special => String(special)) : [];
                                    let userSpecialAccessBlockIds = userSpecialAccessblock ? findTicketData?.access_blockids?.map(special => String(special)) : [];


                                    logger.info(`filterMainZoneGates :- ${JSON.stringify(filterMainZoneGates)}`)
                                    logger.info(`ticketDataGate :- ${JSON.stringify(ticketDataGate)}`)
                                    logger.info(`allTicketZoneIds :- ${JSON.stringify(allTicketZoneIds)}`)
                                    logger.info(`gateMains :- ${JSON.stringify(gateMains)}`)
                                    logger.info(`guardZone :- ${JSON.stringify(guardZone)}`)
                                    const hasSpecialAccess = [parkingId, zoneId, gateId, checkpointId].some(id => userSpecialAccessIds.includes(id));
                                    const hasSpecialAccessBlock = [parkingId, zoneId, gateId, checkpointId].some(id => userSpecialAccessBlockIds.includes(id));
                                    // if (guardMainGate && !tickertIsused) {
                                    //     return res.status(StatusCodes.OK).json({
                                    //         status: 1, ...reqBodyData, message: scaningMessage[type]['gate']['valid'],
                                    //         is_confirmation: true, data: findTicketData
                                    //     });
                                    // }
                                    if (userSpecialAccess && hasSpecialAccess) {
                                        logger.info('------ use has user Special Access -----')
                                        let specialAccess = {};

                                        logger.info(`userSpecialAccessIds :- ${JSON.stringify(userSpecialAccessIds)}`)

                                        logger.info(`hasSpecialAccess :- ${JSON.stringify(hasSpecialAccess)}`)

                                        if (hasSpecialAccess) {
                                            specialAccess = {
                                                valided: true, ticketValid: true, tickertIsused: tickertIsused,
                                                special_access: true,
                                                ...(guardMainGate && { is_confirmation: true }),
                                            }
                                        } else {
                                            specialAccess = {
                                                valided: false, ticketValid: false, tickertIsused: tickertIsused, access: false,
                                            }
                                        }
                                        logger.info(`specialAccess :- ${JSON.stringify(specialAccess)}`);
                                        validTicketScan({
                                            ...specialAccess,
                                            createScaning, findTicketData, type: gaurdtype,
                                            reqBodyData, res, ticket_type: 'privilege',
                                        })
                                        return false;
                                    }
                                    if (userSpecialAccessblock && hasSpecialAccessBlock) {
                                        logger.info('------ use has user Special Access -----')
                                        let specialAccess = {};

                                        logger.info(`userSpecialAccessBlockIds :- ${JSON.stringify(userSpecialAccessBlockIds)}`)

                                        logger.info(`hasSpecialAccessBlock :- ${JSON.stringify(hasSpecialAccess)}`)


                                        specialAccess = {
                                            valided: false, ticketValid: false, type, tickertIsused: tickertIsused, access: false,
                                        }

                                        logger.info(`specialAccess :- ${JSON.stringify(specialAccess)}`);
                                        validTicketScan({
                                            ...specialAccess,
                                            createScaning, findTicketData, type: gaurdtype,
                                            reqBodyData, res, ticket_type: 'privilege',
                                        })
                                        return false;
                                    }

                                    switch (tickettype) {
                                        case 'privilege':
                                            //pass-zone
                                            let privilegeAssinData = {};
                                            if (parkingId) {
                                                logger.info('checking in privilege Parking')
                                                privilegeAssinData = {

                                                    valided: true, ticketValid: true,
                                                    is_parking: true, type: 'parking',
                                                }
                                            } else if (gateId) {
                                                logger.info('checking in privilege Gate')
                                                privilegeAssinData = {

                                                    valided: true, ticketValid: true,
                                                    type: 'gate',
                                                    ...(guardMainGate && { is_maingate: true }),
                                                    ...(guardMainGate && { is_confirmation: true }),
                                                }
                                            } else if (zoneId) {
                                                logger.info('checking in privilege Zone')
                                                let gaurdPassZone = guardZone?.pass_zone;
                                                let gaurdIsprivilege = guardZone?.is_privilege;
                                                let ticketIsprivilege = ticketDataZone?.is_privilege;
                                                let userTicketPassZone = ticketDataZone?.pass_zone;
                                                let validPassZone = gaurdPassZone == userTicketPassZone && allTicketZoneIds == zoneId;
                                                logger.info(`guardZone :- ${guardZone}`);
                                                logger.info(`ticketDataZone :- ${ticketDataZone}`);
                                                logger.info(`userTicketPassZone :- ${userTicketPassZone}`);

                                                let validPrivilegeGaurdZone = gaurdIsprivilege == ticketIsprivilege;

                                                logger.info(`validPrivilegeGaurdZone :- ${validPrivilegeGaurdZone}`);
                                                logger.info(`gaurdIsprivilege :- ${gaurdIsprivilege}`);
                                                logger.info(`ticketIsprivilege :- ${ticketIsprivilege}`);

                                                if (validPrivilegeGaurdZone) {
                                                    privilegeAssinData = {
                                                        valided: validPrivilegeGaurdZone, type: 'zone', ticketValid: validPrivilegeGaurdZone,
                                                    }
                                                } else if (gaurdPassZone) {
                                                    privilegeAssinData = {
                                                        valided: validPassZone, type: 'zone', ticketValid: validPassZone,
                                                    }
                                                } else {
                                                    privilegeAssinData = {
                                                        valided: true, ticketValid: true, type: 'zone',
                                                    }
                                                }

                                            } else if (checkpointId) {
                                                logger.info('checking in privilege Checkpoint')
                                                privilegeAssinData = {
                                                    valided: true, ticketValid: true,
                                                    is_confirmation: true, type: 'checkpoint',
                                                }
                                            } else {
                                                privilegeAssinData = {
                                                    valided: false, ticketValid: false, access: false,
                                                }
                                            }
                                            logger.info(`privilegeAssinData :- ${JSON.stringify(privilegeAssinData)}`);
                                            validTicketScan({
                                                ...privilegeAssinData, createScaning, findTicketData, reqBodyData, tickertIsused: tickertIsused, res, ticket_type: 'privilege',
                                            })
                                            return false;
                                            break;
                                        case 'pass':
                                            logger.info('checking in Pass Switch')
                                            let finParking = await USERORDERPARKINGMODAL.findOne({ _id: findTicketData?.parking, is_deleted: false });
                                            let finAAParking = await PARKINGMODAL.findOne({ _id: finParking?.parent, is_deleted: false });

                                            logger.info(`parkingId :- ${parkingId}`);
                                            logger.info(`finAAParking?._id :- ${finAAParking?._id}`);
                                            let validPassParking = finAAParking ? String(finAAParking?._id) == parkingId : false;

                                            logger.info(`validPassParking :- ${validPassParking}`);
                                            let parking_not_found = finAAParking ? false : true;

                                            if (parkingId) {
                                                logger.info(`Pass Parking :- ${parkingId}`);
                                                logger.info(`Pass validPassParking :- ${validPassParking}`);
                                                logger.info(`Pass finParking :- ${finParking}`);
                                                logger.info(`Pass finParking :- ${finParking}`);

                                                let assing_PassParking_Data = {
                                                    createScaning,
                                                    valided: validPassParking, ticketValid: validPassParking, tickertIsused: finParking?.is_used, ticket_type: 'pass',
                                                    type: 'parking', is_parking: true, is_confirmation: true,
                                                    parking_not_found: parking_not_found, parkingdata: finParking
                                                }

                                                logger.info(`Pass parking assing_PassParking_Data :- ${JSON.stringify(assing_PassParking_Data)}`);

                                                validTicketScan({
                                                    ...assing_PassParking_Data, findTicketData, reqBodyData, res,
                                                })

                                            } else if (gateId) {
                                                logger.info(`Pass Gate :- ${gateId}`)
                                                logger.info(`Pass zoneMainGatesids :- ${zoneMainGatesids}`)
                                                let isGateInclude = zoneAllGatesIds.includes(gateId);
                                                logger.info(`Pass zoneMainGatesids :- ${zoneMainGatesids}`)
                                                logger.info(`Pass isGateInclude :- ${isGateInclude}`)

                                                if (isGateInclude) {
                                                    let validPassMainGate = zoneMainGatesids && zoneMainGatesids.includes(gateId);
                                                    if (validPassMainGate) {
                                                        assignGateData = {
                                                            valided: validPassMainGate, ticketValid: validPassMainGate,
                                                            ...(validPassMainGate && { is_confirmation: true }), is_maingate: true,
                                                        }
                                                    } else {
                                                        assignGateData = {
                                                            valided: isGateInclude, ticketValid: isGateInclude, is_maingate: false,
                                                        }
                                                    }
                                                }
                                                else {
                                                    assignGateData = {
                                                        valided: false, ticketValid: false, access: false,
                                                    }
                                                }
                                                logger.info(`Pass Gate assignGateData :- ${JSON.stringify(assignGateData)}`);
                                                validTicketScan({
                                                    ...assignGateData, createScaning, tickertIsused: tickertIsused,
                                                    findTicketData, reqBodyData, res, type: 'gate', ticket_type: 'pass',
                                                })
                                            } else if (zoneId) {
                                                logger.info(`Pass Zone :- ${zoneId}`)

                                                let gaurdPassZone = guardZone?.pass_zone;
                                                let userTicketPassZone = ticketDataZone?.pass_zone;
                                                let validPassZone = gaurdPassZone == userTicketPassZone && allTicketZoneIds == zoneId;

                                                logger.info(`Pass guardZone :- ${guardZone}`)
                                                logger.info(`Pass ticketDataZone :- ${ticketDataZone}`)
                                                logger.info(`Pass userTicketPassZone :- ${userTicketPassZone}`)

                                                let assignZoneData = {};

                                                if (gaurdPassZone) {
                                                    assignZoneData = {

                                                        valided: validPassZone, ticketValid: validPassZone, tickertIsused: tickertIsused,
                                                        findTicketData, reqBodyData, type: 'zone', ticket_type: 'pass',
                                                    }
                                                } else {
                                                    assignZoneData = {

                                                        valided: false, ticketValid: false, tickertIsused: tickertIsused, access: false,
                                                        findTicketData, reqBodyData, type: 'zone', ticket_type: 'pass',
                                                    }
                                                }
                                                logger.info(`Pass Zone assignZoneData :- ${JSON.stringify(assignZoneData)}`);
                                                validTicketScan({
                                                    ...assignZoneData, createScaning, res,
                                                })

                                            }
                                            else if (checkpointId) {
                                                console.log({ ZonesCheckpoints })
                                                let getCheckPoint = ZonesCheckpointsids && ZonesCheckpointsids.includes(checkpointId);
                                                let validCheckPoint = getCheckPoint ? true : false;

                                                console.log({ getCheckPoint })
                                                console.log({ validCheckPoint })
                                                let assignCheckpointData = {};
                                                if (validCheckPoint) {
                                                    assignCheckpointData = {
                                                        valided: validCheckPoint, ticketValid: validCheckPoint,
                                                        findTicketData, reqBodyData, type: 'checkpoint', ticket_type: 'pass',
                                                    }
                                                } else {
                                                    assignCheckpointData = {
                                                        valided: false, ticketValid: false, access: false,
                                                        findTicketData, reqBodyData, type: 'checkpoint', ticket_type: 'pass',
                                                    }
                                                }
                                                logger.info(`Pass parking assignCheckpointData :- ${JSON.stringify(assignCheckpointData)}`);
                                                validTicketScan({
                                                    ...assignCheckpointData, tickertIsused: tickertIsused, createScaning, res,
                                                })

                                            }
                                            else {
                                                console.log("User........");
                                                ticketValid = false;
                                            }
                                            return false;
                                            break;
                                        case 'ticket':

                                            delete findTicketData.user;
                                            let assignTicketData = {};
                                            if (zoneId) {
                                                console.log('Ticket Zone', zoneId)
                                                // ticketValid = findTicketData.zones.includes(zoneId);
                                                console.log(ticketDataZone);
                                                let findZone = ticketDataZone && ticketDataZone.find(zone => String(zone?._id) == zoneId);
                                                console.log(getALLData)
                                                console.log({ findZone })
                                                console.log({ guardZone })

                                                let gaurdTicketZone = getALLData?.zone?.ticket_zone;
                                                let userTicketTicketZone = findZone?.ticket_zone;
                                                let validTicketZone = gaurdTicketZone == userTicketTicketZone;

                                                let assignTicketZoneData = {};

                                                if (gaurdTicketZone) {
                                                    assignTicketZoneData = {
                                                        valided: validTicketZone, ticketValid: validTicketZone, tickertIsused: tickertIsused,
                                                    }
                                                } else {
                                                    assignTicketZoneData = {
                                                        valided: false, ticketValid: false, tickertIsused: tickertIsused, access: false,

                                                    }
                                                }
                                                logger.info(`ticket parking assignTicketZoneData :- ${JSON.stringify(assignTicketZoneData)}`);
                                                validTicketScan({
                                                    ...assignTicketZoneData, createScaning, findTicketData, reqBodyData, res, type: 'zone', ticket_type: 'ticket',
                                                })
                                                return;

                                            } else if (gateId) {
                                                console.log('Ticket Gate', gateId)

                                                let isGateInclude = ticketAllGates.includes(gateId);
                                                if (isGateInclude) {
                                                    let validTicketMainGate = gateMains && gateMains.includes(gateId);
                                                    if (validTicketMainGate) {
                                                        assignGateData = {
                                                            valided: validTicketMainGate, ticketValid: validTicketMainGate,
                                                            ...(validTicketMainGate && { is_confirmation: true }), is_maingate: true,
                                                        }
                                                    } else {
                                                        assignGateData = {
                                                            valided: isGateInclude, ticketValid: isGateInclude, is_maingate: false,
                                                        }
                                                    }
                                                } else {
                                                    assignGateData = {
                                                        valided: false, ticketValid: false, access: false,
                                                    }
                                                }
                                                logger.info(`Ticket Gate assignGateData :- ${JSON.stringify(assignGateData)}`);

                                                validTicketScan({
                                                    ...assignGateData, tickertIsused: tickertIsused, createScaning,
                                                    findTicketData, reqBodyData, res, type: 'gate', ticket_type: 'ticket',
                                                })
                                                return;
                                            }
                                            else if (checkpointId) {
                                                console.log('Ticket', checkpointId)
                                                // ticketValid = findTicketData.zones.includes(checkpointId);

                                                let getCheckPoint = checkpointData && checkpointData.find((checkpoint) => String(checkpoint?._id) == checkpointId);
                                                let validCheckPoint = getCheckPoint ? true : false;
                                                console.log({ checkpointId })
                                                console.log({ getCheckPoint })
                                                console.log({ validCheckPoint })
                                                let assignCheckpointData = {};
                                                if (validCheckPoint) {
                                                    assignCheckpointData = {
                                                        valided: validCheckPoint, ticketValid: validCheckPoint, tickertIsused: tickertIsused,
                                                    }
                                                } else {
                                                    assignCheckpointData = {
                                                        valided: false, ticketValid: false, tickertIsused: tickertIsused, access: false,

                                                    }
                                                }
                                                logger.info(`ticket parking assignCheckpointData :- ${JSON.stringify(assignCheckpointData)}`);
                                                validTicketScan({
                                                    ...assignCheckpointData, createScaning, findTicketData, reqBodyData, res, type: 'checkpoint', ticket_type: 'ticket',
                                                })
                                                return;
                                            } else {
                                                console.log('------Ticekt Scaning At wrong Place -----')
                                                assignTicketData = {
                                                    createScaning,
                                                    valided: false, ticketValid: false, tickertIsused: tickertIsused, access: false,
                                                    findTicketData, reqBodyData, res, type: gaurdtype, ticket_type: 'ticket',
                                                }
                                            }

                                            validTicketScan({
                                                ...assignTicketData, createScaning
                                            })

                                            return false;
                                            break;
                                        default:
                                            responseData = { status: 0, message: 'Please Give Valid Type', data: null }
                                    }

                                    //expire current date - event date
                                    createScaning = { ...createScaning, user: findUser };

                                    // } else {
                                    //     return res.status(200).json({
                                    //         status: 1, ...reqBodyData, message: 'Ticket is Used..', data: null,
                                    //     })
                                    // }
                                }
                            }
                        }
                        if (ticketValid) {
                            console.log('ticketValid');
                            responseData = {
                                status: 1, access: false, is_valid: true, ...reqBodyData,
                                id: ticket_id, allow_change: false, message: 'Ticket is Valid', data: findTicketData
                            };
                        } else {
                            console.log('not ticketValid');
                            responseData = {
                                status: 0, access: false, is_valid: false, ...reqBodyData,
                                id: ticket_id, allow_change: false, message: 'Ticket is not Valid', data: findTicketData
                            };
                        }
                        res.status(200).json(responseData)
                    } else {
                        return res.status(202).json({
                            status: 0, ...reqBodyData, message: 'Ticket not Found', data: null,
                        })
                    }
                }
            }
        } else {
            res.status(202).json({ status: 0, id: ticket_id, type, message: 'Ticket or type data not found', });
        }
    } catch (error) {
        console.log(error);
        res.status(202).json({ status: 0, error });
    }
}

async function addScaningLogs(scaningData) {
    let { is_maingate = false, user_id, ...createScaning } = scaningData;

    logger.info(`is_maingate :- ${is_maingate}`);

    logger.info(`scaningData :- ${JSON.stringify(scaningData)}`);
    let gaurddata = createScaning?.gaurddata;
    user_id = user_id ? user_id : createScaning?.user_id;
    let locationId = gaurddata?.gate ?? gaurddata?.checkpoint ?? gaurddata?.zone ?? gaurddata?.parking;
    const modelMap = {
        gate: GATE_MODAL,
        checkpoint: CHECKPOINT_MODAL,
        zone: ZONE_MODAL,
        parking: PARKINGMODAL,
    };


    const propertyToCheck = gaurddata?.gate ? 'gate' : gaurddata?.checkpoint ? 'checkpoint' : gaurddata?.parking ? 'parking' : gaurddata?.zone ? 'zone' : '';

    logger.info(`propertyToCheck :- ${propertyToCheck}`);

    logger.info(`locationId :- ${locationId}`);
    console.log({ locationId })
    let findData = propertyToCheck ? await modelMap[propertyToCheck].findOne({ _id: locationId }) : '';
    console.log({ findData })
    logger.info(`findData :- ${findData}`);

    let findName = findData?.parking_name ?? findData?.gate_name ?? findData?.checkpoint_name ?? findData?.zone_name;
    logger.info(`findName ${findName} `);
    logger.info(`createScaning ${JSON.stringify(createScaning)} `);

    if (user_id) {
        let finduser = await USERMODAL.findOne({ phone_number: user_id?.phone_number, is_deleted: false });
        createScaning = {
            ...createScaning, user_login: {
                android_device: finduser?.android_device,
                ios_device: finduser?.ios_device,
                device_modal: finduser?.device_modal,
                app_version: finduser?.app_version,
                device_id: finduser?.device_id,
                phone_number: user_id?.phone_number,
            },
            user: user_id?._id
        };
    }
    let findgaurd = await await USERMODAL.findOne({ guard: gaurddata?._id, roles: 'securityguard', is_deleted: false });
    let gaurd_login = {
        android_device: findgaurd?.android_device,
        ios_device: findgaurd?.ios_device,
        device_modal: findgaurd?.device_modal,
        app_version: findgaurd?.app_version,
        device_id: findgaurd?.device_id,
        phone_number: findgaurd?.phone_number,
    }

    let logData = await SECURITYSCANNINGMODAL.create({ ...createScaning, location: locationId, location_name: findName, is_maingate, guard: gaurddata?._id, gaurd_login });
    let updatedat = await SECURITYGUARDMODAL.findOneAndUpdate({ _id: gaurddata?._id }, { $addToSet: { scanningLogs: logData?._id, } }, { new: true });

}


async function validTicketScan(scaningData) {
    let { valided, ticketValid, tickertIsused, findTicketData, parkingdata = null, is_confirmation = false, not_found = false,
        createScaning, is_maingate = false, special_access = false,
        reqBodyData, parking_not_found = false, type, is_parking, ticket_type, access = true, message = null, res
    } = scaningData;
    console.log('scaningData :', {
        valided, ticketValid, tickertIsused, parkingdata,
        is_confirmation, not_found, createScaning, is_maingate,
        reqBodyData, parking_not_found, type, is_parking, ticket_type, access, message
    }
    )
    logger.info(`type: - ${type} `)
    logger.info(`ticket_type: - ${ticket_type} `)
    logger.info(`parking_not_found: -  ${parking_not_found} `)
    let commondata = {
        is_maingate,
        res, status: 1, reqBodyData, data: findTicketData, createScaning
    }
    try {
        if (not_found) {
            return sendResponse({ ...commondata, access: true, message: scaningMessage[ticket_type][type]['not_found'] });
        }

        if (!access) {
            const msgStr = `Security Alert: Unauthorized access attempt detected at ${type}. Please investigate.`;
            return sendResponse({ ...commondata, access: false, message: msgStr });
        }

        if (parking_not_found && ticket_type === 'pass') {
            logger.info('Parking Not Purchased');
            const msgStr = scaningMessage[ticket_type][type]['not_found'];
            return sendResponse({ ...commondata, warning: true, message: msgStr, });
        }

        if (valided) {
            if ((['checkpoint', 'zone'].includes(type) && !tickertIsused) || (['gate'].includes(type) && !is_maingate && !tickertIsused)) {
                const msgStr = scaningMessage[ticket_type][type]['notused'];
                return sendResponse({ ...commondata, warning: true, message: msgStr, });
            }

            if (tickertIsused) {
                if (['checkpoint', 'zone', 'gate'].includes(type) && tickertIsused) {
                    return sendResponse({
                        ...commondata, access: true,
                        message: scaningMessage[ticket_type][type]['valid']
                    });
                } else {
                    return sendResponse({
                        ...commondata,
                        ...(special_access && { access: true }),
                        message: scaningMessage[ticket_type][type]['used']
                    });
                }
            } else {
                const ticketisActive = is_parking && ticket_type === 'pass' ? parkingdata?.is_active : findTicketData?.is_active;
                logger.info(`ticketisActive: - ${ticketisActive} `);
                logger.info(`ticketValid: - ${ticketValid} `);
                if (ticketisActive) {
                    if (ticketValid) {
                        const msgStr = scaningMessage[ticket_type][type]['valid'];

                        return sendResponse({
                            ...commondata, access: true,
                            message: msgStr, is_parking, is_confirmation
                        });
                    } else {
                        const msgStr = scaningMessage[ticket_type][type]['novalid'];

                        return sendResponse({
                            ...commondata, access: false,
                            message: msgStr,
                        });
                    }
                } else {
                    const msgStr = scaningMessage[ticket_type][type]['deactive'];

                    return sendResponse({
                        ...commondata, warning: true, message: msgStr,
                        is_parking, is_confirmation: false
                    });
                }
            }
        } else {
            const msgStr = scaningMessage[ticket_type][type]['wrong'];
            return sendResponse({ ...commondata, access: false, message: msgStr });
        }
    } catch (error) {
        logger.error(error);
        return sendResponse({
            ...commondata, access: false,
            message: "Something wrong", data: error,
        });
    }
}

function sendResponse({ res, status, reqBodyData, access, warning, message, data, is_parking = false, is_confirmation = false, is_maingate, createScaning }) {
    const response = {
        status,
        ...reqBodyData,
        ...(access && { access }),
        ...(warning && { warning }),
        ...(is_parking && { is_parking }),
        ...(is_confirmation && { is_confirmation }),
        message,
        data
    };
    logger.info(`sendResponse Scaning Response: ${JSON.stringify(response)} `);
    logger.info(`Scaning createScaning: ${JSON.stringify(createScaning)} `);

    if (createScaning) {
        addScaningLogs({ ...createScaning, is_maingate, status: message });
    }

    return res.status(200).json(response);
}

let data = decryptData({
    encryptedData: "9XCG+RAN3yUQst+bk23u+vDfjV3KJDRaiERMBCQghppdYhpYayTxS5qbVuptd3gamrze0woMSm7Jb+il07cM0A==",
    // encryptedData: "mJxT7a9d3nagFcgdDL835NLnZzNMu4oE1PEtR/ej9HXk2J7+ZUludERHO6xW5J04msWHyta3mQsCHjGAls1EpB++4OVFPaPVe9LVgyxQWn6lyhi2UHe90L6KgKEacaJSQtk21QJ92yY8SgMO1rMdGg==",
})
console.log(data)

// Specific date you want to compare
const specificDate = moment('2023-10-12', 'YYYY-MM-DD').startOf('day');

// Current date
const today = moment().startOf('day');

// Calculate the difference in days
const daysDifference = specificDate.diff(today, 'days');

if (daysDifference === 0) {
    console.log('The specific date is today.');
} else if (daysDifference === 1) {
    console.log('The specific date is tomorrow.');
} else if (daysDifference === -1) {
    console.log('The specific date is yesterday.');
} else {
    console.log('The specific date is neither today, yesterday, nor tomorrow.');
}


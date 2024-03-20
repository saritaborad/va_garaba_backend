const { StatusCodes } = require('http-status-codes');
const moment = require('moment');
const crypto = require("crypto");
const FUNCTIONSLIST = require('../helper/functions');
const ocenfileupload = require('../utilis/oceanspcecode');
const SECURITYGUARDMODAL = require('../models/securityguardmodal');
const SECURITYSCANNINGMODAL = require('../models/scaninglogsmodel');
const USERMODAL = require('../models/users.model');
const PARKINGMODAL = require('../models/parkingmodal');

const SOFASEATMODAL = require('../models/sofaseatmodal');

const USERORDEREVENTCATEGORYMODAL = require('../models/userorderticketcategorymodal');
const USERORDERPARKINGMODAL = require('../models/userorderparkingmodal');
const PASSMODAL = require('../models/passmodal');

const PRIVILEGEUSERORDERMODAL = require('../models/privilegeorderticketmodel');
const allconfig = require('../config/allconfig');
let scaningTicketModalType = {
    pass: PASSMODAL,
    ticket: USERORDEREVENTCATEGORYMODAL,
    parking: USERORDERPARKINGMODAL,
    privilege: PRIVILEGEUSERORDERMODAL,
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
        path: 'gates zones parkings checkpoints zone parking',
        match: { _id: { $exists: true } },
        select: '-createdAt -updatedAt',
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

module.exports = {
    create: async function (req, res, next) {
        try {
            const { guard_name, roles, phone_number, guard_gender, gate, checkpoint, parking, zone, ...gaurdfield } = req.body;

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
                        console.log('guardId not found...')
                    }
                    res.status(StatusCodes.OK).json({ status: 1, message: `Security Guard created`, data: securtiyGuardData });
                }
            } else {
                res.status(200).json({ status: StatusCodes.OK, message: 'Security Guard not found..' });
            }

        } catch (err) {
            console.log(err);
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
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while getting Securityguard', error: JSON.stringify(err) });
        }
    },
    getAllGate: async function (req, res, next) {
        try {
            let getALLData = await SECURITYGUARDMODAL.find({ gate: { $exists: true, $ne: null } }).populate('gate');

            res.status(StatusCodes.OK).json({ status: 1, message: `All gate`, data: getALLData });

        } catch (err) {
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while gate', error: JSON.stringify(err) });
        }
    },
    getAllZone: async function (req, res, next) {
        try {
            let getALLData = await SECURITYGUARDMODAL.find({ zone: { $exists: true, $ne: null } }).populate('zone');

            res.status(StatusCodes.OK).json({ status: 1, message: `All zone`, data: getALLData });

        } catch (err) {
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while zone', error: JSON.stringify(err) });
        }
    },
    getAllParking: async function (req, res, next) {
        try {
            let getALLData = await SECURITYGUARDMODAL.find({ parking: { $exists: true, $ne: null } }).populate('parking');

            res.status(StatusCodes.OK).json({ status: 1, message: `All parking`, data: getALLData });

        } catch (err) {
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while parking', error: JSON.stringify(err) });
        }
    },
    getAllCheckpoint: async function (req, res, next) {
        try {
            let getALLData = await SECURITYGUARDMODAL.find({ checkpoint: { $exists: true, $ne: null } }).populate('checkpoint');

            res.status(StatusCodes.OK).json({ status: 1, message: `All checkpoint`, data: getALLData });

        } catch (err) {
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while checkpoint', error: JSON.stringify(err) });
        }
    },
    update: async function (req, res, next) {
        try {
            let { guard_name, phone_number, guard_gender, gate, checkpoint, parking, zone, guard_id } = req.body;
            // let { guard } = req.user;

            // let guard_id = guard;
            let getData = await SECURITYGUARDMODAL.findOne({ _id: guard_id });
            if (getData) {
                const file = req.file;
                let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'Securityguard' }) : '';
                imagurlpath = status === 1 ? imagurlpath : '';
                console.log({ imagurlpath })

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
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updatting Securityguard', error: JSON.stringify(err) });
        }
    },
    removedGuard: async function (req, res, next) {
        try {
            let { guard_id } = req.body;
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
            console.log(err);
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
            console.log(err);
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
            if (encrypted_data) {
                console.log({ uservalid: req.body });
                let modalData = scaningTicketModalType[type];

                let findTicketData = await modalData.findOne({ _id: ticket_id });

                if (findTicketData) {
                    let createScaning = '';
                    let findUser = ['ticket', 'parking'].includes(type) ? findTicketData.ticket_user : findTicketData.user;
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
                        let logData = await SECURITYSCANNINGMODAL.create({ ...createScaning, type, [type]: ticket_id, guard: guard, user: findUser });
                        await SECURITYGUARDMODAL.findOneAndUpdate({ _id: guard }, { $addToSet: { scanningLogs: logData?._id } }, { new: true });
                    }

                    let ticketdata = await scaningTicketModalType[type].findOneAndUpdate({ _id: ticket_id },
                        { ...updateData }, { new: true }
                    ).populate([...populdateDataObj]).exec();
                    let findSeat = ticketdata?.seat;
                    console.log({ findSeat });
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
            console.log(error)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },

    scaning: async function (req, res, next) {
        try {
            let { id: ticket_id, type } = req.body;
            let { encrypted_data } = req.body;
            console.log('------------ Scan API Called ------------------------------');
            //  ****** testing *****
            // console.log({ encrypted_data });
            // let reqBodyData = { id: ticket_id, type };

            // let { _id: guard_id, guard } = req.user;
            // scaningTickets({ ticket_id, type, guard_id, guard, reqBodyData, res })
            // ****** testing ---


            if (encrypted_data) {

                let decryptedData = await decryptData({ encryptedData: encrypted_data });
                let { id: ticket_id, type } = JSON.parse(decryptedData);
                let reqBodyData = { id: ticket_id, type };
                console.log({ reqBodyData })
                if (ticket_id && type) {
                    let { _id: guard_id, guard } = req.user;

                    scaningTickets({ ticket_id, type, guard_id, guard, reqBodyData, res })

                    // let createScaning = { guard: guard, type, [type]: ticket_id, };
                    // let validTcketType = ['parking', 'pass', 'privilege', 'ticket'].includes(type);
                    // let findData = await scaningTicketModalType[type].findOne({ _id: ticket_id });

                    // if (!findData) {
                    //     createScaning = { ...createScaning, status: 'Ticekt Not Found' };
                    //     res.status(StatusCodes.OK).json({ status: 1, ...reqBodyData, is_valid: false, message: 'Ticekt Not Found', data: null });
                    // } else {
                    //     console.log({ validTcketType })
                    //     if (!validTcketType) {
                    //         createScaning = { ...createScaning, status: 'Ticket Type is not valid' }
                    //         return res.status(202).json({
                    //             status: 0, ...reqBodyData, message: 'Ticket Type is not valid', data: null,
                    //         })
                    //     } else {

                    //         let findTicketData = await scaningTicketModalType[type].findOne({ _id: ticket_id }).populate([...populdateDataObj]).exec();
                    //         if (findTicketData) {
                    //             findTicketData = findTicketData.toObject();

                    //             let findUser = ['ticket', 'parking'].includes(type) ? findTicketData.ticket_user : findTicketData.user;

                    //             let eventDate = '2023-10-11'//findTicketData?.event?.event_date;
                    //             const todayDate = moment().startOf('day');
                    //             // const previousDate = moment().subtract(1, 'days').startOf('day');

                    //             let findGuard = await SECURITYGUARDMODAL.findOne({ is_deleted: false, user_id: guard_id })
                    //             let getALLData = await SECURITYGUARDMODAL.findOne({ is_deleted: false, user_id: guard_id }).populate([{
                    //                 path: 'gate checkpoint zone parking',
                    //                 match: { _id: { $exists: true } },
                    //                 select: '-createdAt -updatedAt',
                    //             }]);

                    //             // console.log({findTicketData})

                    //             //special access remaining

                    //             if (['parking', 'ticket'].includes(type)) {
                    //                 // Specific date you want to compare
                    //                 const specificDate = eventDate ? moment(eventDate) : '';

                    //                 // Calculate the difference in days
                    //                 const daysDifference = todayDate.diff(specificDate, 'days');

                    //                 console.log(daysDifference);

                    //                 // if (daysDifference === 1) {
                    //                 //     return res.status(202).json({
                    //                 //         status: 0, message: "Ticket Has Expired! You're late.", data: null,
                    //                 //     })
                    //                 // } else if (eventDate != todayDate) {
                    //                 //     console.log('validdd eveent date..')
                    //                 //     console.log({ eventDate });
                    //                 //     return res.status(202).json({
                    //                 //         status: 0, message: "Your Ticket Is Not Valid For Today", data: null,
                    //                 //     })
                    //                 // }
                    //             }


                    //             let gateId = String(findGuard?.gate);
                    //             let zoneId = String(findGuard?.zone);
                    //             let checkpointId = String(findGuard?.checkpoint);
                    //             let parkingId = String(findGuard?.parking);
                    //             let guardMainGate = getALLData?.gate?.is_main;
                    //             let ticketExpire = findTicketData.is_expire;
                    //             let eventBaseValidation = false;
                    //             let ticketValid = false;
                    //             let responseData = {
                    //                 status: 0,
                    //                 ...reqBodyData,
                    //                 message: 'Please Give Valid Type',
                    //                 data: null
                    //             };
                    //             console.log({ gateId })
                    //             console.log({ checkpointId })
                    //             console.log({ zoneId })
                    //             console.log({ parkingId })

                    //             let tickertIsused = findTicketData.is_used;
                    //             console.log({ parking: type == 'parking', type })
                    //             if (type == 'parking') {
                    //                 let validParking = String(findTicketData.parent) == parkingId;
                    //                 console.log('parking', findTicketData.parent, parkingId)

                    //                 validTicketScan({
                    //                     valided: validParking, is_parking: true,
                    //                     ticketValid: validParking, tickertIsused, findTicketData, reqBodyData, res, type: 'Parking'
                    //                 })
                    //                 // if (validParking) {
                    //                 //     if (tickertIsused) {
                    //                 //         return res.status(200).json({
                    //                 //             status: 1, ...reqBodyData, message: "Parking Ticket Is Already Used.", data: findTicketData,
                    //                 //         })
                    //                 //     } else {

                    //                 //         ticketValid = String(findTicketData.parent) == String(parkingId);
                    //                 //         if (ticketValid) {

                    //                 //             return res.status(200).json({
                    //                 //                 status: 1, ...reqBodyData, is_parking: true, is_confirmation: true, message: "Ticket Is valid.", data: findTicketData,
                    //                 //             })
                    //                 //         } else {
                    //                 //             return res.status(200).json({
                    //                 //                 status: 1, ...reqBodyData, message: "Ticket Not Valid.", data: findTicketData,
                    //                 //             })
                    //                 //         }
                    //                 //     }
                    //                 // } else {

                    //                 //     return res.status(200).json({
                    //                 //         status: 1, ...reqBodyData, message: "Your Are at Wrong Parking.", data: findTicketData,
                    //                 //     })

                    //                 // }
                    //                 return false;
                    //                 delete findTicketData.user;
                    //             } else {
                    //                 console.log("Please're sure you're in switch case");
                    //                 if (ticketExpire) {
                    //                     return res.status(200).json({
                    //                         status: 1, ...reqBodyData, message: "Ticket Has Expired! You're late.", data: findTicketData,
                    //                     })
                    //                 } else {

                    //                     console.log({ guardMainGate, tickertIsused })
                    //                     if (guardMainGate && tickertIsused) {
                    //                         console.log({ 11: tickertIsused });
                    //                         return res.status(200).json({
                    //                             status: 1, message: "Already Checked in", ...reqBodyData, access: false, data: findTicketData,
                    //                         })
                    //                     } else {
                    //                         if (guardMainGate && !tickertIsused) {
                    //                             return res.status(StatusCodes.OK).json({ status: 1, ...reqBodyData, is_confirmation: true, data: findTicketData });
                    //                         }
                    //                         // if (tickertIsused) {

                    //                         let tickettype = type;

                    //                         let guardZone = getALLData?.zone;
                    //                         let ticketDataGate = findTicketData?.gate ?? findTicketData?.gates;
                    //                         let gateMain = ticketDataGate && ticketDataGate.find(gate => gate.is_main == true);
                    //                         let ticketDataZone = findTicketData?.zone;
                    //                         let twoWheelerParking = false;
                    //                         let fourWheelerParking = false;
                    //                         let passZone = ticketDataZone?.pass_zone;
                    //                         let playZone = ticketDataZone?.play_zone;
                    //                         let ticketZone = ticketDataZone?.ticket_zone;
                    //                         let ZonesGates = ticketDataZone?.gates || [];

                    //                         switch (tickettype) {
                    //                             case 'privilege':
                    //                                 //pass-zone
                    //                                 if (playZone) {
                    //                                     responseData = {
                    //                                         status: 1, ...reqBodyData, access: true, message: 'Ticket is Privilege', is_privilege: true,
                    //                                         is_valid: true, data: findTicketData
                    //                                     };
                    //                                 } else {
                    //                                     responseData = {
                    //                                         status: 1, ...reqBodyData, access: false, message: 'Ticket is Not Valid', is_privilege: true,
                    //                                         is_valid: false, data: findTicketData
                    //                                     };
                    //                                 }

                    //                                 break;
                    //                             case 'pass':

                    //                                 let finParking = await USERORDERPARKINGMODAL.findOne({ _id: findTicketData.parking, is_deleted: false });
                    //                                 let finAAParking = await PARKINGMODAL.findOne({ _id: finParking.parent, is_deleted: false });
                    //                                 // console.log({ finParking })
                    //                                 // console.log({ finAAParking })
                    //                                 console.log({ ff: finAAParking._id })
                    //                                 console.log({ parkingId })
                    //                                 let validPassParking = String(finAAParking._id) == parkingId;
                    //                                 console.log({ validPassParking })
                    //                                 let isParkingScan = parkingId ? true : false;
                    //                                 console.log({ isParkingScan })

                    //                                 //zone parking 
                    //                                 //allow in gate
                    //                                 // if (gateId) {
                    //                                 //     // let findMainGate = ZonesGates && ZonesGates.find(gate => gate.is_main == true);
                    //                                 //     // console.log(findMainGate)
                    //                                 //     // if (findMainGate && findMainGate[0]) {
                    //                                 //     //     console.log('gate', findMainGate, gateId)
                    //                                 //     //     ticketValid = true;
                    //                                 //     // } else {
                    //                                 //     //     ticketValid = ZonesGates.includes(gateId);
                    //                                 //     // }
                    //                                 // }
                    //                                 // else if (zoneId) {
                    //                                 //     // if (passZone) {

                    //                                 //     //     console.log('Zone', zoneId)
                    //                                 //     //     // ticketValid = findTicketData.zone === zoneId;
                    //                                 //     //     ticketValid = passZone;
                    //                                 //     // } else if (playZone) {
                    //                                 //     //     ticketValid = playZone;
                    //                                 //     // }
                    //                                 // }
                    //                                 if (parkingId) {
                    //                                     console.log('Parking', parkingId)
                    //                                     console.log({ nfee: validPassParking })
                    //                                     console.log({ finParking })
                    //                                     console.log({ reqBodyData })
                    //                                     let assingData = {
                    //                                         valided: validPassParking, ticketValid: validPassParking, tickertIsused: finParking.is_used,
                    //                                         findTicketData, reqBodyData, res, type: 'Parking', is_parking: true
                    //                                     }
                    //                                     console.log(assingData)

                    //                                     validTicketScan({
                    //                                         ...assingData
                    //                                     })

                    //                                 } else if (gateId) {
                    //                                     console.log('Gate', { gateId })
                    //                                     let findMainGate = ZonesGates && ZonesGates.find(gate => gate.is_main == true);
                    //                                     console.log(findMainGate)
                    //                                     let validPassGate = findMainGate == gateId;
                    //                                     let assignGateData = {
                    //                                         valided: validPassGate, ticketValid: validPassGate, tickertIsused: false,
                    //                                         findTicketData, reqBodyData, res, type: 'Gate',
                    //                                     }
                    //                                     validTicketScan({
                    //                                         ...assignGateData
                    //                                     })
                    //                                     // if (findMainGate && findMainGate[0]) {
                    //                                     //     console.log('gate', findMainGate, gateId)
                    //                                     //     ticketValid = true;
                    //                                     // } else {
                    //                                     //     ticketValid = ZonesGates.includes(gateId);
                    //                                     // }

                    //                                 } else if (zoneId) {
                    //                                     console.log('Gate', { gateId })

                    //                                 }
                    //                                 else {
                    //                                     console.log("User........");
                    //                                     ticketValid = false;
                    //                                 }
                    //                                 return false;
                    //                                 break;
                    //                             case 'ticket':

                    //                                 delete findTicketData.user;
                    //                                 if (zoneId) {
                    //                                     console.log('Ticket', zoneId)
                    //                                     ticketValid = findTicketData.zones.includes(zoneId);
                    //                                 } else if (gateId) {
                    //                                     console.log('Ticket', gateId)
                    //                                     ticketValid = findTicketData.zones.includes(gateId);
                    //                                 }
                    //                                 else if (checkpointId) {
                    //                                     console.log('Ticket', checkpointId)
                    //                                     ticketValid = findTicketData.zones.includes(checkpointId);
                    //                                 } else {
                    //                                     ticketValid = false;
                    //                                 }


                    //                                 break;
                    //                             default:
                    //                                 responseData = { status: 0, message: 'Please Give Valid Type', data: null }
                    //                         }

                    //                         //expire current date - event date
                    //                         createScaning = { ...createScaning, user: findUser };

                    //                         // } else {
                    //                         //     return res.status(200).json({
                    //                         //         status: 1, ...reqBodyData, message: 'Ticket is Used..', data: null,
                    //                         //     })
                    //                         // }
                    //                     }
                    //                 }
                    //             }
                    //             if (ticketValid) {
                    //                 console.log('ticketValid');
                    //                 responseData = {
                    //                     status: 1, access: false, is_valid: true, ...reqBodyData,
                    //                     id: ticket_id, allow_change: false, message: 'Ticket is Valid', data: findTicketData
                    //                 };
                    //             } else {
                    //                 console.log('not ticketValid');
                    //                 responseData = {
                    //                     status: 0, access: false, is_valid: false, ...reqBodyData,
                    //                     id: ticket_id, allow_change: false, message: 'Ticket is not Valid', data: findTicketData
                    //                 };
                    //             }
                    //             res.status(200).json(responseData)
                    //         } else {
                    //             return res.status(202).json({
                    //                 status: 0, ...reqBodyData, message: 'Ticket not Found', data: null,
                    //             })
                    //         }
                    //     }
                    // }
                    // if (createScaning) {
                    //     let logData = await SECURITYSCANNINGMODAL.create({ ...createScaning });
                    //     await SECURITYGUARDMODAL.findOneAndUpdate({ _id: guard_id }, { $addToSet: { scanningLogs: logData?._id } }, { new: true });
                    // }
                } else {
                    res.status(202).json({ status: 0, id: ticket_id, type, message: 'Ticket or type data not found', });
                }
            } else {
                res.status(202).json({ status: 0, id: ticket_id, type, message: 'Encrypted data not found', });
            }
        } catch (err) {
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while getting Securityguard', error: err });
        }
    },
    allScanLogs: async function (req, res, next) {
        try {
            let findData = await SECURITYSCANNINGMODAL.find({}).populate([
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
                {
                    path: 'location',
                    match: { _id: { $exists: true } },
                    select: '',
                },
            ])

            res.status(StatusCodes.OK).json({ status: 1, message: 'All Scan Logs.', data: findData });

        } catch (err) {
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while getting Securityguard', error: JSON.stringify(err) });
        }
    },
    test: async function (req, res, next) {
        try {

        } catch (err) {
            console.log(err);
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
        console.log(error)
        return error

    }
}

async function validTicketScan({ valided, ticketValid, tickertIsused, findTicketData, reqBodyData, res, type, is_parking }) {
    try {
        console.log({ valided })
        console.log({ findTicketData })
        if (valided) {
            if (tickertIsused) {
                return res.status(200).json({
                    status: 1, ...reqBodyData, message: `${type} Ticket Is Already Used.`, data: findTicketData,
                })
            } else {
                if (ticketValid) {
                    return res.status(200).json({
                        status: 1, ...reqBodyData,
                        ...(is_parking && { is_parking: is_parking }),
                        is_confirmation: true, message: "Ticket Is valid.", data: findTicketData,
                    })
                } else {
                    return res.status(200).json({
                        status: 1, ...reqBodyData, message: "Ticket Not Valid.", data: findTicketData,
                    })
                }
            }
        } else {
            return res.status(200).json({
                status: 1, ...reqBodyData, message: `Your Are at Wrong ${type}.`, data: findTicketData,
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            status: 1, ...reqBodyData, message: "Something wrong", error
        })
    }

}

async function scaningTickets({ ticket_id, type, guard_id, guard, reqBodyData, res }) {
    try {
        if (ticket_id && type) {

            let createScaning = { guard: guard, type, [type]: ticket_id, };
            let validTcketType = ['parking', 'pass', 'privilege', 'ticket'].includes(type);
            let findData = await scaningTicketModalType[type].findOne({ _id: ticket_id });

            if (!findData) {
                createScaning = { ...createScaning, status: 'Ticekt Not Found' };
                res.status(StatusCodes.OK).json({ status: 1, ...reqBodyData, is_valid: false, message: 'Ticekt Not Found', data: null });
            } else {
                console.log({ validTcketType })
                if (!validTcketType) {
                    createScaning = { ...createScaning, status: 'Ticket Type is not valid' }
                    return res.status(202).json({
                        status: 0, ...reqBodyData, message: 'Ticket Type is not valid', data: null,
                    })
                } else {

                    let findTicketData = await scaningTicketModalType[type].findOne({ _id: ticket_id }).populate([...populdateDataObj]).exec();
                    if (findTicketData) {
                        findTicketData = findTicketData.toObject();

                        let findUser = ['ticket', 'parking'].includes(type) ? findTicketData.ticket_user : findTicketData.user;

                        let eventDate = '2023-10-11'//findTicketData?.event?.event_date;
                        const todayDate = moment().startOf('day');
                        // const previousDate = moment().subtract(1, 'days').startOf('day');

                        let findGuard = await SECURITYGUARDMODAL.findOne({ is_deleted: false, user_id: guard_id })
                        let getALLData = await SECURITYGUARDMODAL.findOne({ is_deleted: false, user_id: guard_id }).populate([{
                            path: 'gate checkpoint zone parking',
                            match: { _id: { $exists: true } },
                            select: '-createdAt -updatedAt',
                        }]);

                        // console.log({findTicketData})

                        //special access remaining

                        if (['parking', 'ticket'].includes(type)) {
                            // Specific date you want to compare
                            const specificDate = eventDate ? moment(eventDate) : '';

                            // Calculate the difference in days
                            const daysDifference = todayDate.diff(specificDate, 'days');

                            console.log(daysDifference);

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


                        let gateId = String(findGuard?.gate);
                        let zoneId = String(findGuard?.zone);
                        let checkpointId = String(findGuard?.checkpoint);
                        let parkingId = String(findGuard?.parking);
                        let guardMainGate = getALLData?.gate?.is_main;
                        let ticketExpire = findTicketData.is_expire;
                        let eventBaseValidation = false;
                        let ticketValid = false;
                        let responseData = {
                            status: 0,
                            ...reqBodyData,
                            message: 'Please Give Valid Type',
                            data: null
                        };
                        console.log({ gateId })
                        console.log({ checkpointId })
                        console.log({ zoneId })
                        console.log({ parkingId })

                        let tickertIsused = findTicketData.is_used;
                        console.log({ parking: type == 'parking', type })
                        if (type == 'parking') {
                            let validParking = String(findTicketData.parent) == parkingId;
                            console.log('parking', findTicketData.parent, parkingId)

                            validTicketScan({
                                valided: validParking, is_parking: true,
                                ticketValid: validParking, tickertIsused, findTicketData, reqBodyData, res, type: 'Parking'
                            })
                            // if (validParking) {
                            //     if (tickertIsused) {
                            //         return res.status(200).json({
                            //             status: 1, ...reqBodyData, message: "Parking Ticket Is Already Used.", data: findTicketData,
                            //         })
                            //     } else {

                            //         ticketValid = String(findTicketData.parent) == String(parkingId);
                            //         if (ticketValid) {

                            //             return res.status(200).json({
                            //                 status: 1, ...reqBodyData, is_parking: true, is_confirmation: true, message: "Ticket Is valid.", data: findTicketData,
                            //             })
                            //         } else {
                            //             return res.status(200).json({
                            //                 status: 1, ...reqBodyData, message: "Ticket Not Valid.", data: findTicketData,
                            //             })
                            //         }
                            //     }
                            // } else {

                            //     return res.status(200).json({
                            //         status: 1, ...reqBodyData, message: "Your Are at Wrong Parking.", data: findTicketData,
                            //     })

                            // }
                            return false;
                            delete findTicketData.user;
                        } else {
                            console.log("Please're sure you're in switch case");
                            if (ticketExpire) {
                                return res.status(200).json({
                                    status: 1, ...reqBodyData, message: "Ticket Has Expired! You're late.", data: findTicketData,
                                })
                            } else {

                                console.log({ guardMainGate, tickertIsused })
                                if (guardMainGate && tickertIsused) {
                                    console.log({ 11: tickertIsused });
                                    return res.status(200).json({
                                        status: 1, message: "Already Checked in", ...reqBodyData, access: false, data: findTicketData,
                                    })
                                } else {
                                    if (guardMainGate && !tickertIsused) {
                                        return res.status(StatusCodes.OK).json({ status: 1, ...reqBodyData, is_confirmation: true, data: findTicketData });
                                    }
                                    // if (tickertIsused) {

                                    let tickettype = type;

                                    let guardZone = getALLData?.zone;
                                    let ticketDataGate = findTicketData?.gate ?? findTicketData?.gates;
                                    let gateMain = ticketDataGate && ticketDataGate.find(gate => gate.is_main == true);
                                    let ticketDataZone = findTicketData?.zone;
                                    let twoWheelerParking = false;
                                    let fourWheelerParking = false;
                                    let passZone = ticketDataZone?.pass_zone;
                                    let playZone = ticketDataZone?.play_zone;
                                    let ticketZone = ticketDataZone?.ticket_zone;
                                    let ZonesGates = ticketDataZone?.gates || [];

                                    switch (tickettype) {
                                        case 'privilege':
                                            //pass-zone
                                            if (playZone) {
                                                responseData = {
                                                    status: 1, ...reqBodyData, access: true, message: 'Ticket is Privilege', is_privilege: true,
                                                    is_valid: true, data: findTicketData
                                                };
                                            } else {
                                                responseData = {
                                                    status: 1, ...reqBodyData, access: false, message: 'Ticket is Not Valid', is_privilege: true,
                                                    is_valid: false, data: findTicketData
                                                };
                                            }

                                            break;
                                        case 'pass':

                                            let finParking = await USERORDERPARKINGMODAL.findOne({ _id: findTicketData.parking, is_deleted: false });
                                            let finAAParking = await PARKINGMODAL.findOne({ _id: finParking.parent, is_deleted: false });
                                            // console.log({ finParking })
                                            // console.log({ finAAParking })
                                            console.log({ ff: finAAParking._id })
                                            console.log({ parkingId })
                                            let validPassParking = String(finAAParking._id) == parkingId;
                                            console.log({ validPassParking })
                                            let isParkingScan = parkingId ? true : false;
                                            console.log({ isParkingScan })

                                            //zone parking 
                                            //allow in gate
                                            // if (gateId) {
                                            //     // let findMainGate = ZonesGates && ZonesGates.find(gate => gate.is_main == true);
                                            //     // console.log(findMainGate)
                                            //     // if (findMainGate && findMainGate[0]) {
                                            //     //     console.log('gate', findMainGate, gateId)
                                            //     //     ticketValid = true;
                                            //     // } else {
                                            //     //     ticketValid = ZonesGates.includes(gateId);
                                            //     // }
                                            // }
                                            // else if (zoneId) {
                                            //     // if (passZone) {

                                            //     //     console.log('Zone', zoneId)
                                            //     //     // ticketValid = findTicketData.zone === zoneId;
                                            //     //     ticketValid = passZone;
                                            //     // } else if (playZone) {
                                            //     //     ticketValid = playZone;
                                            //     // }
                                            // }
                                            if (parkingId) {
                                                console.log('Parking', parkingId)
                                                console.log({ nfee: validPassParking })
                                                console.log({ finParking })
                                                console.log({ reqBodyData })
                                                let assingData = {
                                                    valided: validPassParking, ticketValid: validPassParking, tickertIsused: finParking.is_used,
                                                    findTicketData, reqBodyData, res, type: 'Parking', is_parking: true
                                                }
                                                console.log(assingData)

                                                validTicketScan({
                                                    ...assingData
                                                })

                                            } else if (gateId) {
                                                console.log('Gate', { gateId })
                                                let findMainGate = ZonesGates && ZonesGates.find(gate => gate.is_main == true);
                                                console.log(findMainGate)
                                                let validPassGate = findMainGate == gateId;
                                                let assignGateData = {
                                                    valided: validPassGate, ticketValid: validPassGate, tickertIsused: false,
                                                    findTicketData, reqBodyData, res, type: 'Gate',
                                                }
                                                validTicketScan({
                                                    ...assignGateData
                                                })
                                                // if (findMainGate && findMainGate[0]) {
                                                //     console.log('gate', findMainGate, gateId)
                                                //     ticketValid = true;
                                                // } else {
                                                //     ticketValid = ZonesGates.includes(gateId);
                                                // }

                                            } else if (zoneId) {
                                                console.log('Gate', { gateId })

                                            }
                                            else {
                                                console.log("User........");
                                                ticketValid = false;
                                            }
                                            return false;
                                            break;
                                        case 'ticket':

                                            delete findTicketData.user;
                                            if (zoneId) {
                                                console.log('Ticket', zoneId)
                                                ticketValid = findTicketData.zones.includes(zoneId);
                                            } else if (gateId) {
                                                console.log('Ticket', gateId)
                                                ticketValid = findTicketData.zones.includes(gateId);
                                            }
                                            else if (checkpointId) {
                                                console.log('Ticket', checkpointId)
                                                ticketValid = findTicketData.zones.includes(checkpointId);
                                            } else {
                                                ticketValid = false;
                                            }


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
            if (createScaning) {
                let logData = await SECURITYSCANNINGMODAL.create({ ...createScaning });
                await SECURITYGUARDMODAL.findOneAndUpdate({ _id: guard_id }, { $addToSet: { scanningLogs: logData?._id } }, { new: true });
            }
        } else {
            res.status(202).json({ status: 0, id: ticket_id, type, message: 'Ticket or type data not found', });
        }
    } catch (error) {
        console.log(error);
        res.status(202).json({ status: 0, error });
    }
}


let data = decryptData({
    encryptedData: "RoX+T3/MLwGbDN4CsrDvxNyEtjcSAfjZ5tfk7x31i54u8bFfHXOd9dd5n6MySr2Gmy43YFChJ4r0lQ/Bke2SXhVnDXacsLS8GxJADpUo3uMF8WBGYxqLctcHb7evFi92",
})
// console.log(data)

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
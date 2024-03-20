const ORDEREVENTCATEGORYMODAL = require('../models/ordercategorymodal');
const ORDERPARKINGMODAL = require('../models/orderparkingmodal');
const { logger } = require('../utilis/logger');
const crypto = require("crypto");
const { QUERY, commonQuery } = require('../helper/helper');
const allconfig = require('../config/allconfig');
const querynames = QUERY;
const USERMODAL = require('../models/users.model');
const multer = require("multer");
const moment = require('moment');
let PARKINGSTORAGEMODAL = require('../models/parkingStorageModal');
const PARKINGMODAL = require('../models/parkingmodal');
const PASSMODAL = require('../models/passmodal');

const PRIVILEGE_ORDER_MODAL = require('../models/privilegeorderticketmodel');

const USERORDERTICKETMODAL = require('../models/userticketmodel');
const USERORDEREVENTCATEGORYMODAL = require('../models/userorderticketcategorymodal');
const USERORDERPARKINGMODAL = require('../models/userorderparkingmodal');

const SPONSORMODAL = require('../models/sponsormodal');
const COPOUN_CODE_MODAL = require('../models/couponcoderecord');
const TRANSACTIONMODAL = require('../models/transactionmodal');

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
// const cryptoKeyData = new Crypto({
//     key: '5a7088b7ce3f6f97584a3b0092670729be391e01a37c93ec118087566cfa326f',
//     hmacKey: '17263006976ff190ad45033f0510e37a0a400103cae92ff75785ba343da65710'
// });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}.${file.mimetype.split("/")[1]}`);
    },
});

const upload = multer(
    {
        storage,
        limits: {
            fileSize: 50 * 1024 * 1024, // 10MB in bytes
            fieldNameSize: 100, // Maximum field name length (adjust as needed)
            fieldSize: 100 * 1024, // Maximum field size (adjust as needed)
        },
    }
);

module.exports = {
    generateSeating: ({ rows, sofasPerRow, seatsPerSofa }) => {
        var seatingArrangement = [];
        try {
            for (var row = 1; row <= rows; row++) {
                var rowName = String.fromCharCode(64 + row);
                var rowObj = {
                    // sofa_row: 'Row ' + rowName,
                    sofa_row: rowName,
                    sofas: []
                };

                for (var sofa = 1; sofa <= sofasPerRow; sofa++) {
                    var sofaObj = {
                        sofa: rowName + sofa.toString(),
                        seats: []
                    };

                    for (var seat = 1; seat <= seatsPerSofa; seat++) {
                        var position = seat === 1 ? 'left' : seat === seatsPerSofa ? 'right' : 'middle';
                        // console.log({ position, r: seat, seatsPerSofa })
                        var seatIdWithinRow = (sofa - 1) * seatsPerSofa + seat;
                        var seatObj = {
                            seat_name: seatIdWithinRow,
                            position: position
                        };
                        sofaObj.seats.push(seatObj);
                    }

                    rowObj.sofas.push(sofaObj);
                }

                seatingArrangement.push(rowObj);
            }

            return seatingArrangement;
        } catch (error) {
            console.log({ error })
            return seatingArrangement;
        }
    },
    assignedOrderTouser: async (ticketData) => {
        let { array, modalname, user_id, event_id, complimanotry = false, allot_passparking = false, is_privilegeuser = false, payment_status = null,
            is_privilegemember = false, is_passuser = false, is_salesteam = false, is_salesticket = false } = ticketData;
        try {
            let dbmodal = orderInGeModal[modalname];
            let is_parkingmodal = modalname == 'parking';
            logger.info('---- assignedOrderTouser ------')
            logger.info(`arrylength :- ${array?.length} `);
            for (const item of array) {
                let findData = await dbmodal.findOne({ _id: item?._id, is_deleted: false });
                logger.info('---- modalname ------')
                logger.info(`modalname :- ${modalname}`)
                logger.info('---- findData ------')
                logger.info(`findData :- ${JSON.stringify(findData)}`)
                if (findData && findData.qty > 0) {
                    logger.info('---- findData.qty ------')
                    logger.info(`findData.qty :- ${findData?.qty} `);

                    let reserved_parking = is_parkingmodal ? findData?.is_reserved : false;
                    let isparentid = findData?.parent;
                    logger.info('---- is_parkingmodal ------')
                    logger.info(`is_parkingmodal :- ${is_parkingmodal} `);
                    if (is_parkingmodal) {

                        // let purchasedParking = complimanotry ? { purchased_reseved_slot: findData.qty } : { purchased_slot: findData.qty };
                        let purchasedParking = reserved_parking ? { purchased_reseved_slot: 1 } : { purchased_slot: 1 };
                        logger.info(`isparentid :- ${isparentid} `);
                        logger.info(`event_id :- ${event_id} `);
                        logger.info(`purchasedParking :- ${JSON.stringify(purchasedParking)}`)

                        let findParkingStorageData = isparentid ? is_passuser ?
                            await PARKINGSTORAGEMODAL.findOne({ parking: isparentid, pass_parking: true, is_expire: false, is_deleted: false }) :
                            await PARKINGSTORAGEMODAL.findOne({ parking: isparentid, event: event_id, is_expire: false, is_deleted: false }) : '';

                        logger.info(`findParkingStorageData :- ${findParkingStorageData ? JSON.stringify(findParkingStorageData) : findParkingStorageData}`);

                        if (!findParkingStorageData) {
                            let findActualParkingData = await PARKINGMODAL.findOne({ _id: isparentid, is_deleted: false });

                            logger.info(`findActualParkingData :- ${findActualParkingData ? JSON.stringify(findActualParkingData) : findActualParkingData}`);

                            let createdParkingStorage = await PARKINGSTORAGEMODAL.create({
                                parking: isparentid, ...(!is_passuser && { event: event_id }),
                                slot: findActualParkingData?.slot,
                                reserve_slot: findActualParkingData?.reserve_slot,
                                gates: findActualParkingData?.gates,
                                ...(is_passuser && { pass_parking: true }),
                            })
                            if (createdParkingStorage) {
                                await PARKINGSTORAGEMODAL.findOneAndUpdate(
                                    { _id: createdParkingStorage?._id },
                                    { $inc: { ...purchasedParking } },
                                    { new: true }
                                );
                            }
                        } else {

                            if (findParkingStorageData) {
                                await PARKINGSTORAGEMODAL.findOneAndUpdate(
                                    { _id: findParkingStorageData?._id },
                                    { $inc: { ...purchasedParking } },
                                    { new: true }
                                );
                            }
                        }


                        // let updatedDocument = await PARKINGMODAL.findOneAndUpdate(
                        //     { _id: isparentid },
                        //     { $inc: { ...purchasedParking } },
                        //     { new: true }
                        // );

                        // console.log({ updatedDocument })
                    }
                    // let findUpdateParkingData = await PARKINGMODAL.findOne({ _id: findData.parent });
                    let findUpdateParkingData = await PARKINGSTORAGEMODAL.findOne({ parking: isparentid, event: event_id, is_expire: false });
                    const { _id, ...otherFields } = findData.toObject();
                    // console.log({ otherFields })
                    // console.log({ findUpdateParkingData })

                    logger.info(`findUpdateParkingData 181 :- ${findUpdateParkingData ? JSON.stringify(findUpdateParkingData) : findUpdateParkingData}`);

                    let quantity = findData.qty;
                    let AllocatedNum = [];
                    let resevedAllocatedNum = [];

                    logger.info(`reserved_parking 187 :- ${reserved_parking} `);

                    if (findUpdateParkingData && is_parkingmodal) {
                        if (reserved_parking) {
                            resevedAllocatedNum = await findNextAvailableSlot({
                                bookedObj: findUpdateParkingData.bookedParking,
                                totalSlot: findUpdateParkingData.reserve_slot,
                                remainingParking: findUpdateParkingData.remaining_reseved_slot,
                                reservedSeat: 0, quantity: quantity, parentparkingid: findUpdateParkingData._id
                            })
                        } else {
                            AllocatedNum = await findNextAvailableSlot({
                                bookedObj: findUpdateParkingData.bookedParking,
                                totalSlot: findUpdateParkingData.slot,
                                remainingParking: findUpdateParkingData.remaining_slot,
                                reservedSeat: findUpdateParkingData.reserve_slot, quantity: quantity, parentparkingid: findUpdateParkingData._id
                            })
                        }

                        logger.info(`AllocatedNum 206:- ${AllocatedNum} `);
                        logger.info(`resevedAllocatedNum 207 :- ${resevedAllocatedNum} `);
                    }

                    for (let i = 0; i < findData.qty; i += 1) {


                        const subticketCategory = {
                            parent: _id, ...otherFields, is_salesteam: is_salesteam,
                            ...(findUpdateParkingData && { purchased_slot: findUpdateParkingData.purchased_slot }),
                            ...(findUpdateParkingData && { remaining_reseved_slot: findUpdateParkingData.remaining_reseved_slot }),
                            ...(findUpdateParkingData && { purchased_reseved_slot: findUpdateParkingData.purchased_reseved_slot }),
                            ...(findUpdateParkingData && { remaining_slot: findUpdateParkingData.remaining_slot }),
                            price: Number(findData.price), qty: 1, provided_by: findData.roles, provided_id: findData.provided_id,
                            ...(is_parkingmodal && !reserved_parking && { allot_slot: AllocatedNum && AllocatedNum.length > 0 ? AllocatedNum[i] : 0 }),
                            ...(is_parkingmodal && reserved_parking && { allot_slot: resevedAllocatedNum && resevedAllocatedNum.length > 0 ? resevedAllocatedNum[i] : 0 }),
                            user: user_id, event: event_id,
                            ...(complimanotry && { complimanotry: true }),
                            ...(payment_status && { payment_status: payment_status })
                        };

                        // const newUserOrder = new userInGeModal[modalname]({
                        //     ...subticketCategory,
                        // });

                        // let savedUserOrder = await newUserOrder.save();

                        logger.info(`subticketCategory 234 :- ${JSON.stringify(subticketCategory)}`);

                        // let savedUserOrder = await new newUserOrder.save();
                        let createOrderEventSubCategory = await commonQuery(
                            userInGeModal[modalname],
                            querynames.create,
                            {
                                ...subticketCategory,
                            }
                        );
                        let createOrderSubId = createOrderEventSubCategory.data._id;
                        // console.log({ createOrderEventSubCategory })
                        // let createOrderSubId = savedUserOrder._id;
                        let updateduserData = await USERMODAL.findOneAndUpdate({ _id: user_id, is_deleted: false },
                            { $addToSet: { [UserOrderFilednameList[modalname]]: createOrderSubId } },
                            { new: true });

                        let ticketuser = null;
                        if (is_salesticket) {
                            let ticketuser = await USERORDERTICKETMODAL.create({
                                name: updateduserData?.name, phone_number: updateduserData?.phone_number,
                                ticket: createOrderSubId,
                                gender: updateduserData?.gender, profile_pic: updateduserData?.profile_pic
                            });
                            await userInGeModal[modalname].findOneAndUpdate({ _id: createOrderSubId, is_deleted: false },
                                { ticket_user: ticketuser },
                                { new: true });
                        }
                        // console.log({ updateduserData })
                        if (updateduserData && updateduserData.roles == 'p-user') {
                            // console.log({ ll: 'updateduserData upadte for p-user' })
                            // console.log({ createOrderSubId })
                            // console.log({ passid: updateduserData?.pass_list })

                            await PASSMODAL.findOneAndUpdate({ _id: updateduserData?.pass_list },
                                { $set: { parking: createOrderSubId } }, { new: true });
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    },
    processArray: async (proceeyData) => {
        let { array = [], modal = '', submodal = '', user_id = '', event_id = '', modalname = '', provided_by = '', by_cash = null,
            is_salesteam = false, remark = null, payment_status = null,
            provider_id = '', is_reserved = false, is_passuser = false } = proceeyData;
        const dataList = [];
        for (const item of array) {
            const exist = await modal.findOne({ _id: item._id }).select('-createdAt -updatedAt');
            console.log({ exist })
            if (exist) {
                const { _id: tktid, ...otherFields } = exist.toObject(); // Specify the fields you want here
                let totalprice = item.price * item.qty;
                console.log({ otherFields })

                const ticketCategory = { parent: tktid, ...otherFields, price: Number(item.price), qty: item.qty, slot: item.qty };
                let createOrderEventCategoey = await commonQuery(submodal, querynames.create,
                    {
                        ...ticketCategory, ...(user_id && { user: user_id }),
                        ...(provided_by && { provided_by: provided_by }),
                        ...(provider_id && { provider_id: provider_id }),
                        ...(event_id && { event: event_id }),
                        ...(is_salesteam && { is_salesteam: is_salesteam }),
                        ...(by_cash && { by_cash: by_cash }),
                        ...(payment_status && { payment_status: payment_status }),
                        ...(remark && { remark: remark }),
                        ...(is_reserved && { is_reserved: is_reserved }),
                        ...(is_passuser && { is_passuser: is_passuser })
                    });
                let createdOrderId = createOrderEventCategoey.data._id;
                dataList.push(createdOrderId);
            } else {
                console.log("Item does not exist:", item._id);
            }
        }

        return dataList;
    },
    encryptData: function ({ data, secretKey = allconfig.QR_SECRECT_KEY, }) {
        try {

            const key = Buffer.from(secretKey, "hex");
            const iv = Buffer.from(allconfig.QR_IV_KEY, "base64");

            const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);

            let encryptedData = cipher.update(data, "utf8", "base64");
            encryptedData += cipher.final("base64");

            return {
                iv: iv.toString("base64"),
                encryptedData,
            };

        } catch (error) {
            console.log(error)
            return error;
        }
    },
    decryptData: async function ({ encryptedData, secretKey = allconfig.QR_SECRECT_KEY, iv = allconfig.QR_IV_KEY }) {
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
    },

    multerUpload: upload,
    refundToSponsore: async function () {
        let findSponser = await COPOUN_CODE_MODAL.find({ is_used: false, is_deleted: false, provided_by: 'sponsor' });
        console.log(findSponser);
        for (let spn of findSponser) {
            let findSponseor = await SPONSORMODAL.findOne({ user_id: spn.provided_id, is_deleted: false });
            console.log('spn--' + spn);
            if (findSponseor) {
                await SPONSORMODAL.findOneAndUpdate({
                    _id: findSponseor._id,
                }, { $inc: { balance_alloted: +spn.total } }, { new: true });
                await COPOUN_CODE_MODAL.findOneAndUpdate({ _id: spn._id }, { is_deleted: true }, { new: true });

                let findAllcomplimantoryCode = await COPOUN_CODE_MODAL.find({
                    phone_number: spn.phone_number, is_used: false, is_deleted: false
                });

                await USERMODAL.findOneAndUpdate({ phone_number: spn.phone_number, is_deleted: false },
                    { is_complimantorycode: findAllcomplimantoryCode && findAllcomplimantoryCode.length > 0 ? true : false }, { new: true });

                await TRANSACTIONMODAL.create({
                    description: `None used Code by ${spn?.phone_number}`,
                    credit: +spn.total,
                    user: findSponseor.user_id,
                    sponsor: findSponseor._id, amount: findSponseor.balance_alloted + +spn.total
                })
            }
        }
    },
    privilegePassTicektReset: async () => {
        try {

            await PASSMODAL.updateMany({}, { is_used: false, allow_change: true, is_valid: false });
            //parking pass vala nu
            await PRIVILEGE_ORDER_MODAL.updateMany({}, { is_used: false, allow_change: true, is_valid: false });
            logger.info(`Updating while privilegePassTicektReset`);
        } catch (error) {
            console.error(error);
            logger.error(`Error while privilegePassTicektReset :- ${error}`);
        }
    },
    currentDateTime: () => {
        const specificDateTime = moment(new Date(), 'YYYY-MM-DD HH:mm:ss');
        return specificDateTime.format('YYYY-MM-DD hh:mm:ss A');
    },
    currentDate: () => {
        const specificDateTime = moment(new Date(), 'YYYY-MM-DD HH:mm:ss');
        return specificDateTime.format('YYYY-MM-DD');
    },
    currentTime: () => {
        const specificDateTime = moment(new Date(), 'YYYY-MM-DD HH:mm:ss');
        return specificDateTime.format('HH:mm:ss A');
    }
}

async function findNextAvailableSlot({ bookedObj, remainingParking, totalSlot, reservedSeat, quantity, parentparkingid }) {
    let bookedParking = bookedObj || {};
    let totalParking = totalSlot;
    let startParking = reservedSeat > 0 ? reservedSeat + 1 : 1;

    if (quantity <= remainingParking) {
        const allocatedSlots = [];

        for (let i = startParking; i <= totalParking && allocatedSlots.length < quantity; i++) {
            if (!bookedParking[i]) {
                bookedParking[i] = true;
                allocatedSlots.push(i);
                remainingParking--; // Decrement the remaining parking count
            }
        }

        // In this example, I'm using console.log to show the result. You can replace it with your MongoDB update code.
        console.log({ bookedParking, parentparkingid });
        console.log(`Successfully booked ${quantity} slot(s): ${allocatedSlots.join(', ')}. Remaining slots: ${remainingParking}`);
        await PARKINGSTORAGEMODAL.findOneAndUpdate({ _id: parentparkingid }, { bookedParking: bookedParking }, { new: true });
        // await PARKINGMODAL.findOneAndUpdate({ _id: parentparkingid }, { bookedParking: bookedParking }, { new: true });
        return allocatedSlots;
    } else {
        console.log('Insufficient slots available.');
        return null;
    }
}

// Usage example
const originalData = '{"type":"ticket","id":"64ff3f123e46a82bb7e53455"}'; // Replace with the data you want to encrypt
const secretKey = "44ec7f09a40fd80de6509e86c3288af6"; // Replace with the secret key used for encryption

// const encryptedResult = encryptData(originalData, secretKey);
// console.log("Encrypted Data:", encryptedResult.encryptedData);
// console.log("Initialization Vector (IV):", encryptedResult.iv);

const decryptedData = module.exports.decryptData({
    encryptedData: "RoX+T3/MLwGbDN4CsrDvxNyEtjcSAfjZ5tfk7x31i54u8bFfHXOd9dd5n6MySr2Gmy43YFChJ4r0lQ/Bke2SXhVnDXacsLS8GxJADpUo3uMF8WBGYxqLctcHb7evFi92",
})
// console.log("Decrypted Data:", decryptedData);
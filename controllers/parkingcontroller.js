const { StatusCodes } = require('http-status-codes');
const helaperfn = require('../helper/helper');
const PARKINGMODAL = require('../models/parkingmodal');
const parkingvalidator = require('../validator/parkingvalidate');
const ORDERPARKINGMODAL = require('../models/orderparkingmodal');
const USERORDERPARKINGMODAL = require('../models/userorderparkingmodal');
const PARKINGSTORAGEMODAL = require('../models/parkingStorageModal');
const querynames = helaperfn.QUERY;
module.exports = {
    createParking: async function (req, res, next) {
        try {
            const { parking_name, gates, slot, price, reserve_slot } = req.body;
            if (slot < reserve_slot) {
                return res.status(StatusCodes.OK).json({ status: 0, message: 'Reseverd slot value is not valid.' });
            }
            const existParking = await helaperfn.commonQuery(PARKINGMODAL, querynames.findOne, { parking_name });
            if (existParking.status == 1) {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.EXISTS("Parking") });
            } else {
                await parkingvalidator.createparking.validateAsync(req.body);
                const newParking = await helaperfn.commonQuery(PARKINGMODAL, querynames.create, {
                    ...req.body, price: Number(price),
                    gates: [...new Set(gates)]
                });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.CREATED_SUCCESS(`Parking`), data: newParking.data });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while creating Parking', error: err?.details[0]?.message || err });
        }
    },
    updateParking: async function (req, res, next) {
        try {
            const { parking_id, gates, parking_name, color_code, two_wheeler_parking, car_parking, ticket_parking, pass_parking } = req.body;

            const existParking = await helaperfn.commonQuery(PARKINGMODAL, querynames.findOne, { _id: parking_id });
            if (existParking.status == 1) {
                const updateParking = await helaperfn.commonQuery(PARKINGMODAL, querynames.findOneAndUpdate, { _id: existParking.data._id }, { ...req.body });
                let updateData = {
                    ...(gates && { gates: gates }),
                    ...(parking_name && { parking_name: parking_name }),
                    ...(color_code && { color_code: color_code }),
                    ...(car_parking && { car_parking: car_parking }),
                    ...(ticket_parking && { ticket_parking: ticket_parking }),
                    ...(two_wheeler_parking && { two_wheeler_parking: two_wheeler_parking }),
                    ...(pass_parking && { pass_parking: pass_parking }),
                }
                await PARKINGSTORAGEMODAL.updateMany(
                    { parking: existParking.data._id, is_deleted: false }, { ...updateData });
                await ORDERPARKINGMODAL.updateMany(
                    { parent: existParking.data._id, is_deleted: false }, { ...updateData });
                await USERORDERPARKINGMODAL.updateMany(
                    { parent: existParking.data._id, is_deleted: false }, {
                    ...updateData
                });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.UPDATED_SUCCESS("Parking"), data: updateParking.data });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Parking") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updating Parking', error: err });
        }
    },
    deleteParking: async function (req, res, next) {
        try {
            const { parking_id } = req.body;
            const existParking = await helaperfn.commonQuery(PARKINGMODAL, querynames.findOne, { _id: parking_id });
            if (existParking.status == 1) {
                await helaperfn.commonQuery(PARKINGMODAL, querynames.findOneAndUpdate, { _id: existParking.data._id }, { is_deleted: true });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.DELETED_SUCCESS("Parking") });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Parking") });
            }
        } catch (err) {
            console.error(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Parking', error: err });
        }
    },
    getAllParkings: async function (req, res, next) {
        try {
            let { roles } = req.user;
            const existParkings = roles == 'n-user' ? [] : await PARKINGMODAL.find({ is_deleted: false }).select('-bookedParking');
            res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Parkings"), data: existParkings.length > 0 ? existParkings : null });
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while getting Parkings', error: err });
        }
    },
    remainingAllParkings: async function (req, res, next) {
        try {
            let { event_id, is_pass } = req.body;
            let { roles } = req.user;
            const existParkings = await PARKINGMODAL.find({ is_deleted: false }).select('-bookedParking');
            let ispassuser = roles == 'p-user';
            const searchquery = is_pass
                ? { pass_parking: true }
                : { event: event_id };
            const modifiedExistParkings = await Promise.all(existParkings.map(async parking => {
                const ff = await PARKINGSTORAGEMODAL.findOne({ ...searchquery, parking: parking._id });
                parking = parking.toObject();
                return {
                    ...parking,
                    purchased_reseved_slot: ff ? ff.purchased_reseved_slot : parking.purchased_reseved_slot,
                    purchased_slot: ff ? ff.purchased_slot : parking.purchased_slot,
                    remaining_slot: ff ? ff.remaining_slot : parking.remaining_slot,
                    remaining_reseved_slot: ff ? ff.remaining_reseved_slot : parking.remaining_reseved_slot,
                };
            }));

            res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Parkings"), data: modifiedExistParkings.length > 0 ? modifiedExistParkings : null });
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while getting Parkings', error: err });
        }
    },
    getParking: async function (req, res, next) {
        try {
            let { parking_id } = req.params;
            const existParking = await PARKINGMODAL.findOne({ _id: parking_id })
                .populate([{
                    path: 'gates',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt',
                }])
                .select('-bookedParking');
            if (existParking) {
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Parking"), data: existParking ? existParking : null });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Parking") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while getting Parking', error: err });
        }
    },
    //Admin
    parkingInfoAdmin: async function (req, res, next) {
        try {
            const existParkings = await PARKINGMODAL.find({ is_deleted: false })
                .select('parking_name remaining_slot slot  purchased_slot remaining_reseved_slot purchased_reseved_slot');
            res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Parkings"), data: existParkings.length > 0 ? existParkings : null });
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while Admin getting Parkings', error: err });
        }
    },
    parkingRecords: async function (req, res, next) {
        try {
            const existParkings = await PARKINGSTORAGEMODAL.find({})
                .populate([
                    {
                        path: 'parking',
                        match: { _id: { $exists: true } },
                        select: 'parking_name color_code',
                    },
                    {
                        path: 'event',
                        match: { _id: { $exists: true } },
                        select: 'event_name',
                    }
                ])
                .select('-bookedParking');
            res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Parkings"), data: existParkings.length > 0 ? existParkings : null });
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while Admin getting Parkings', error: err });
        }
    },
    reminingParkingSLot: async function (req, res, next) {
        try {
            let remainignData = await PARKINGSTORAGEMODAL.find({})
                // .populate([
                //     {
                //         path: 'parking',
                //         match: { _id: { $exists: true } },
                //         select: '-gates -purchased_reseved_slot -remaining_slot -remaining_reseved_slot',
                //         // populate: [
                //         //     {
                //         //         path: 'gate parking checkpoint zone',
                //         //         match: { _id: { $exists: true } },
                //         //         select: '-createdAt -updatedAt',
                //         //     }
                //         // ]
                //     },
                //     {
                //         path: 'event',
                //         match: { _id: { $exists: true } },
                //         select: '-createdAt -updatedAt -parent -ticketcategorys',
                //         populate: {
                //             path: 'taxes',
                //             match: { _id: { $exists: true } },
                //             select: '-createdAt -updatedAt',
                //         },
                //     },
                // ])
                .select('-bookedParking')
                ;
            res.status(200).json({ status: 0, message: 'Remaining Slot', data: remainignData });


        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    parkingStatics: async function (req, res, next) {
        try {
            const result = await PARKINGSTORAGEMODAL.aggregate([
                {
                    $group: {
                        _id: '$event', // Group by the 'event' field
                        parkingRecords: { $push: '$$ROOT' }, // Store the grouped records in an array
                    },
                },
                {
                    $lookup: {
                        from: 'events', // Replace 'events' with the actual collection name for events
                        localField: '_id', // Field from the previous stage (event ID)
                        foreignField: '_id', // Field in the 'events' collection (event ID)
                        as: 'event', // Name of the field to populate with event data
                    },
                },
                {
                    $unwind: '$event', // Unwind the 'event' array
                },
                {
                    $lookup: {
                        from: 'parkings', // Replace 'parkings' with the actual collection name for parking
                        localField: 'parkingRecords.parking', // Field from 'parkingRecords' (parking ID)
                        foreignField: '_id', // Field in the 'parkings' collection (parking ID)
                        as: 'parkingRecords', // Name of the field to populate with parking data
                    },
                },
            ]);

            res.status(200).json({ status: 1, message: "All Parking Statics", data: result });

        } catch (error) {
            console.log(error)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }

    },

}
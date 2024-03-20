const { StatusCodes } = require('http-status-codes');
const helaperfn = require('../helper/helper');
const ZONEMODAL = require('../models/zonemodal');
const zonevalidate = require('../validator/zonevalidate');

const querynames = helaperfn.QUERY;
module.exports = {
    createZones: async function (req, res, next) {
        try {
            const { zone_name, gates, checkpoints, price } = req.body;
            const existZones = await helaperfn.commonQuery(ZONEMODAL, querynames.findOne, { zone_name });
            if (existZones.status == 1) {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.EXISTS("Zones") });
            } else {
                await zonevalidate.createZone.validateAsync(req.body);
                const newZones = await helaperfn.commonQuery(ZONEMODAL, querynames.create, {
                    ...req.body, price: Number(price),
                    ...(gates && gates.length && { gates: [...new Set(gates)] }),
                    ...(checkpoints && checkpoints.length && { checkpoints: [...new Set(checkpoints)] })

                });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.CREATED_SUCCESS(`Zones`), data: newZones.data });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while creating Zones', error: err?.details[0]?.message || err });
        }
    },
    updateZones: async function (req, res, next) {
        try {
            const { zone_id, gates, checkpoints } = req.body;
            const existZones = await helaperfn.commonQuery(ZONEMODAL, querynames.findOne, { _id: zone_id });
            if (existZones.status == 1) {
                const updateZones = await helaperfn.commonQuery(ZONEMODAL, querynames.findOneAndUpdate,
                    { _id: existZones.data._id },
                    {
                        ...req.body,
                        ...(gates && gates.length && { gates: [...new Set(gates)] }),
                        ...(checkpoints && checkpoints.length && { checkpoints: [...new Set(checkpoints)] })
                    }
                );
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.UPDATED_SUCCESS("Zones"), data: updateZones.data });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Zones") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updating Zones', error: err });
        }
    },
    deleteZones: async function (req, res, next) {
        try {
            const { zone_id } = req.body;
            const existZones = await helaperfn.commonQuery(ZONEMODAL, querynames.findOne, { _id: zone_id });
            if (existZones.status == 1) {
                await helaperfn.commonQuery(ZONEMODAL, querynames.findOneAndUpdate, { _id: existZones.data._id }, { is_deleted: true });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.DELETED_SUCCESS("Zones") });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Zones") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Zones', error: err });
        }
    },
    getZone: async function (req, res, next) {
        try {
            let { zone_id } = req.params;
            const existZone = await ZONEMODAL.findOne({ _id: zone_id }).populate([
                {
                    path: 'gates checkpoints',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt',
                }
            ]);
            if (existZone) {
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Zone"), tickets: existZone });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Zone") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Zones', error: err });
        }
    },
    getAllZones: async function (req, res, next) {
        try {
            const existZones = await ZONEMODAL.find({ is_deleted: false }).populate([
                {
                    path: 'gates checkpoints',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt',
                }
            ]);
            res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Zones"), tickets: existZones });
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Zones', error: err });
        }
    },
}
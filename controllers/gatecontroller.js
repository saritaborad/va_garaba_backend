const { StatusCodes } = require('http-status-codes');
const helaperfn = require('../helper/helper');
const GATEMODAL = require('../models/gatemodal');
const gatevalidate = require('../validator/gatevalidate');
const querynames = helaperfn.QUERY;
module.exports = {
    createGate: async function (req, res, next) {
        try {
            const { gate_name } = req.body;
            const existGate = await helaperfn.commonQuery(GATEMODAL, querynames.findOne, { gate_name });
            if (existGate.status == 1) {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.EXISTS("Gate") });
            } else {
                await gatevalidate.createGate.validateAsync(req.body);

                const newGate = await helaperfn.commonQuery(GATEMODAL, querynames.create, { ...req.body });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.CREATED_SUCCESS(`Gate`), data: newGate.data });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while creating Gate', error: err?.details[0]?.message || err });
        }
    },
    updateGate: async function (req, res, next) {
        try {
            const { gate_id } = req.body;
            const existGate = await helaperfn.commonQuery(GATEMODAL, querynames.findOne, { _id: gate_id });
            if (existGate.status == 1) {
                const updateGate = await helaperfn.commonQuery(GATEMODAL, querynames.findOneAndUpdate, { _id: existGate.data._id }, { ...req.body });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.UPDATED_SUCCESS("Gate"), data: updateGate.data });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Gate") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updating Gate', error: err });
        }
    },
    deleteGate: async function (req, res, next) {
        try {
            const { gate_id } = req.body;
            const existGate = await helaperfn.commonQuery(GATEMODAL, querynames.findOne, { _id: gate_id });
            if (existGate.status == 1) {
                await helaperfn.commonQuery(GATEMODAL, querynames.findOneAndUpdate, { _id: existGate.data._id }, { is_deleted: true });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.DELETED_SUCCESS("Gate") });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Gate") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Gate', error: err });
        }
    },
    getAllGates: async function (req, res, next) {
        try {
            const existGates = await GATEMODAL.find({ is_deleted: false });
            res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Gates"), gates: existGates });
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Gates', error: err });
        }
    },
}
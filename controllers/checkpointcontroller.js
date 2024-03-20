const { StatusCodes } = require('http-status-codes');
const helaperfn = require('../helper/helper');
const CHECKPONTMODAL = require('../models/checkpointmodal');
const checkpointvalidator = require('../validator/checkpointvalidate');
const querynames = helaperfn.QUERY;
module.exports = {
    createCheckpoint: async function (req, res, next) {
        try {
            const { checkpoint_name } = req.body;
            const existCheckpoint = await helaperfn.commonQuery(CHECKPONTMODAL, querynames.findOne, { checkpoint_name });
            if (existCheckpoint.status == 1) {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.EXISTS("Checkpoint") });
            } else {
                await checkpointvalidator.createcheckpoint.validateAsync(req.body);
                const newCheckpoint = await helaperfn.commonQuery(CHECKPONTMODAL, querynames.create, { ...req.body });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.CREATED_SUCCESS(`Checkpoint`), data: newCheckpoint.data });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while creating Checkpoint', error: err?.details[0]?.message || err });
        }
    },
    updateCheckpoint: async function (req, res, next) {
        try {
            const { checkpoint_id } = req.body;
            const existCheckpoint = await helaperfn.commonQuery(CHECKPONTMODAL, querynames.findOne, { _id: checkpoint_id });
            if (existCheckpoint.status == 1) {
                const updateCheckpoint = await helaperfn.commonQuery(CHECKPONTMODAL, querynames.findOneAndUpdate, { _id: existCheckpoint.data._id }, { ...req.body });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.UPDATED_SUCCESS("Checkpoint"), data: updateCheckpoint.data });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Checkpoint") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updating Checkpoint', error: err });
        }
    },
    deleteCheckpoint: async function (req, res, next) {
        try {
            const { checkpoint_id } = req.body;
            const existCheckpoint = await helaperfn.commonQuery(CHECKPONTMODAL, querynames.findOne, { _id: checkpoint_id });
            if (existCheckpoint.status == 1) {
                await helaperfn.commonQuery(CHECKPONTMODAL, querynames.findOneAndUpdate, { _id: checkpoint_id }, { is_deleted: true });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.DELETED_SUCCESS("Checkpoint") });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Checkpoint") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Checkpoint', error: err });
        }
    },
    getAllCheckpoint: async function (req, res, next) {
        try {
            const existCheckpoint = await CHECKPONTMODAL.find({ is_deleted: false });
            res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Checkpoint"), data: existCheckpoint });
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Checkpoint', error: err });
        }
    },
}
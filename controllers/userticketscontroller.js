const { StatusCodes } = require('http-status-codes');
const helaperfn = require('../helper/helper');
const USERTICKETMODAL = require('../models/userticketmodel');
const querynames = helaperfn.QUERY;
module.exports = {
    createUsertickets: async function (req, res, next) {
        try {
            const { name } = req.body;
            const existUsertickets = await helaperfn.commonQuery(USERTICKETMODAL, querynames.findOne, { name });
            if (existUsertickets.status == 1) {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.EXISTS("Usertickets") });
            } else {
                const newUsertickets = await helaperfn.commonQuery(USERTICKETMODAL, querynames.create, { ...req.body });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.CREATED_SUCCESS(`Usertickets`), data: newUsertickets.data });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while creating Usertickets', error: err?.details[0]?.message || err });
        }
    },
    updateUsertickets: async function (req, res, next) {
        try {
            const { name } = req.body;
            const existUsertickets = await helaperfn.commonQuery(USERTICKETMODAL, querynames.findOne, { name });
            if (existUsertickets.status == 1) {
                const updateUsertickets = await helaperfn.commonQuery(USERTICKETMODAL, querynames.findOneAndUpdate, { _id: existUsertickets.data._id }, { ...req.body });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.UPDATED_SUCCESS("Usertickets"), data: updateUsertickets.data });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Usertickets") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updating Usertickets', error: err });
        }
    },
    deleteUsertickets: async function (req, res, next) {
        try {
            const { name } = req.body;
            const existUsertickets = await helaperfn.commonQuery(USERTICKETMODAL, querynames.findOne, { name });
            if (existUsertickets.status == 1) {
                await commonQuery(USERTICKETMODAL, querynames.findOneAndDelete, { _id: existUsertickets.data._id });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.DELETED_SUCCESS("Usertickets") });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Usertickets") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Usertickets', error: err });
        }
    },
}
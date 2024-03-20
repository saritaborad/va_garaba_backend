const { StatusCodes } = require('http-status-codes');
const helaperfn = require('../helper/helper');
const PROMOCODEMODAL = require('../models/promocodemodal');
const promocodevalidate = require('../validator/promocodevalidate');

const querynames = helaperfn.QUERY;
module.exports = {
    createPromocode: async function (req, res, next) {
        try {
            const { promo_code } = req.body;
            let { _id: provode_id, roles } = req.user;
            const existPromocode = await helaperfn.commonQuery(PROMOCODEMODAL, querynames.findOne, { promo_code });
            if (existPromocode.status == 1) {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.EXISTS("Promo code") });
            } else {
                await promocodevalidate.createPromocode.validateAsync(req.body);
                const newPromocode = await helaperfn.commonQuery(PROMOCODEMODAL, querynames.create, { ...req.body, created_id: provode_id, created_by: roles });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.CREATED_SUCCESS(`Promo code`), data: newPromocode.data });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while creating Promo code', error: err?.details[0]?.message || err });
        }
    },
    updatePromocode: async function (req, res, next) {
        try {
            const { promocode_id } = req.body;
            const existPromocode = await helaperfn.commonQuery(PROMOCODEMODAL, querynames.findOne, { _id: promocode_id });
            if (existPromocode.status == 1) {
                const updatePromocode = await helaperfn.commonQuery(PROMOCODEMODAL, querynames.findOneAndUpdate, { _id: existPromocode.data._id }, { ...req.body });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.UPDATED_SUCCESS("Promo code"), data: updatePromocode.data });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Promo code") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updating Promo code', error: err });
        }
    },
    deletePromocode: async function (req, res, next) {
        try {
            const { promocode_id } = req.body;
            const existPromocode = await helaperfn.commonQuery(PROMOCODEMODAL, querynames.findOne, { _id: promocode_id });
            if (existPromocode.status == 1) {
                await helaperfn.commonQuery(PROMOCODEMODAL, querynames.findOneAndUpdate, { _id: existPromocode.data._id }, { is_deleted: true });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.DELETED_SUCCESS("Promo code") });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Promo code") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Promo code', error: err });
        }
    },
    codeVerify: async function (req, res, next) {
        try {

            let { promo_code } = req.body;
            const existPromocode = await helaperfn.commonQuery(PROMOCODEMODAL, querynames.findOne, { promo_code });
            if (existPromocode.status == 1) {
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.EXISTS("Promo code"), data: existPromocode.data });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Promo code"), data: null });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Promo code', error: err });
        }
    },
    getAllPromocode: async function (req, res, next) {
        try {
            const existPromocode = await helaperfn.commonQuery(PROMOCODEMODAL, querynames.find);
            res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Promo code"), tickets: existPromocode.data });
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Promo code', error: err });
        }
    },


}
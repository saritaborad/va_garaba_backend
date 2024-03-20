const { StatusCodes } = require('http-status-codes');
const helaperfn = require('../helper/helper');
const agencyvalidate = require('../validator/agencyvalidate');
const AGENCYMODAL = require('../models/agencymodel');
const ocenfileupload = require('../utilis/oceanspcecode');
const querynames = helaperfn.QUERY;
module.exports = {
    creatAgency: async function (req, res, next) {
        try {
            const { phone_number, email } = req.body;

            let gtFiledname = email ? { email } : { phone_number };
            const existAgency = await helaperfn.commonQuery(AGENCYMODAL, querynames.findOne, gtFiledname);

            if (existAgency.status == 1) {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.EXISTS("Agency") });
            } else {

                await agencyvalidate.createagency.validateAsync(req.body);

                const file = req.file;
                let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'Agency' }) : '';
                imagurlpath = status === 1 ? imagurlpath : '';

                const newAgency = await helaperfn.commonQuery(AGENCYMODAL, querynames.create, { ...req.body, profile_pic: imagurlpath });
                if (newAgency.status == 1) {
                    res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.CREATED_SUCCESS(`Agency`), data: newAgency.data });

                } else {
                    res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_CREATED(`Agency`), data: null });
                }
            }
        } catch (err) {
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while creating agency', error: JSON.stringify(err) });
        }
    },
    updateAgency: async function (req, res, next) {
        try {
            const { agency_id } = req.body;
            const existAgency = await helaperfn.commonQuery(AGENCYMODAL, querynames.findOne, { _id: agency_id });
            if (existAgency.status == 1) {
                const updateAgency = await helaperfn.commonQuery(AGENCYMODAL, querynames.findOneAndUpdate, { _id: existAgency.data._id }, { ...req.body });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.UPDATED_SUCCESS("Agency"), data: updateAgency.data });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Agency") });
            }

        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updating agency', error: err });
        }
    },
    deleteAgency: async function (req, res, next) {
        try {
            const { agency_id } = req.body;
            console.log({ agency_id })
            const existAgency = await helaperfn.commonQuery(AGENCYMODAL, querynames.findOne, { _id: agency_id });
            console.log({ existAgency })
            if (existAgency.status == 1) {

                await helaperfn.commonQuery(AGENCYMODAL, querynames.findOneAndUpdate, { _id: agency_id }, { is_deleted: true });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.DELETED_SUCCESS("Agency") });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Agency") });
            }
        } catch (err) {
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting agency', error: JSON.stringify(err) });
        }
    },
    getAllAgency: async function (req, res, next) {
        try {
            const existAgency = await helaperfn.commonQuery(AGENCYMODAL, querynames.find);
            res.status(StatusCodes.OK).json({
                status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Agency"),
                data: existAgency.data.length > 0 ? existAgency.data : null
            });
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Agency', error: err });
        }
    },
}
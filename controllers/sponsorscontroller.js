const { StatusCodes } = require('http-status-codes');
const helaperfn = require('../helper/helper');
const USERMODAL = require('../models/users.model');
const SPONSORMODAL = require('../models/sponsormodal');
const ocenfileupload = require('../utilis/oceanspcecode');
const sponsorvalidate = require('../validator/sponsorvalidate');
const querynames = helaperfn.QUERY;

module.exports = {
    createSponsors: async function (req, res, next) {

        try {
            const { phone_number, roles, name, zone, parking, ...sponsorfiled } = req.body;
            const existSponsors = await helaperfn.commonQuery(SPONSORMODAL, querynames.findOne, { phone_number });

            if (existSponsors.status == 1) {
                return res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.EXISTS("Sponsors") });
            }

            await sponsorvalidate.createsponsor.validateAsync(req.body);

            const filelist = req.files || {};
            const uploads = Object.keys(filelist).map(async (key) => {
                const file = filelist[key][0];
                if (file) {
                    const { status, url } = await ocenfileupload.imageuploads({ file, foldername: 'Sponsors' });
                    return status === 1 ? url : '';
                }
                return '';
            });
            const [company_logo, profile_pic, authorized_person_photo] = await Promise.all(uploads);

            const newSponsors = await SPONSORMODAL.create({
                ...(parking && { parking: parking }),
                ...(zone && { zone: zone }),
                profile_pic, company_logo, authorized_person_photo, phone_number, name, ...sponsorfiled
            });
            console.log({ newSponsors })
            if (newSponsors) {
                let createSponsoeuser = await USERMODAL.create({
                    profile_pic, phone_number, roles: 'sponsor',
                    name, is_sponsore: true, sponsore: newSponsors._id
                })
                await SPONSORMODAL.findOneAndUpdate({ _id: newSponsors?._id }, { user_id: createSponsoeuser?._id })

            }
            res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.CREATED_SUCCESS('Sponsors'), data: newSponsors.data });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while creating Sponsors', error: error.message });
        }


    },
    updateSponsors: async function (req, res, next) {
        try {
            const { email } = req.body;
            const existSponsors = await helaperfn.commonQuery(SPONSORMODAL, querynames.findOne, { email });
            if (existSponsors.status == 1) {
                const updateSponsors = await helaperfn.commonQuery(SPONSORMODAL, querynames.findOneAndUpdate, { _id: existSponsors.data._id }, { ...req.body });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.UPDATED_SUCCESS("Sponsors"), data: updateSponsors.data });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Sponsors") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updating Sponsors', error: err });
        }
    },
    deleteSponsors: async function (req, res, next) {
        try {
            const { sponsor_id } = req.body;
            const existSponsors = await helaperfn.commonQuery(SPONSORMODAL, querynames.findOne, { _id: sponsor_id });
            if (existSponsors.status == 1) {
                await commonQuery(SPONSORMODAL, querynames.findOneAndUpdate, { _id: existSponsors.data._id }, { is_deleted: true });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.DELETED_SUCCESS("Sponsors") });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Sponsors") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Sponsors', error: err });
        }
    },
    getAllSponsores: async function (req, res, next) {
        try {
            const existSponsores = await helaperfn.commonQuery(SPONSORMODAL, querynames.find);
            res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Sponsores"), data: existSponsores.data.length > 0 ? existSponsores.data : null });
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Sponsores', error: err });
        }
    },
}
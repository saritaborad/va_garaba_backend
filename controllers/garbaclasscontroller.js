const { StatusCodes } = require('http-status-codes');
const helaperfn = require('../helper/helper');
const querynames = helaperfn.QUERY;
const GARBACLASSMODAL = require('../models/garbaclassmodal');
const BRANCHMODAL = require('../models/branchmodal');
const USERMODAL = require('../models/users.model');
const garbaValidator = require('../validator/garbaclassvalidate');
const ocenfileupload = require('../utilis/oceanspcecode');
module.exports = {
    creatGarbaClass: async function (req, res, next) {
        try {
            let { garba_classname, branch_list, owner_email, owner_contact_number, owner_name, zone_id, ...clssfields } = req.body;
            branch_list = branch_list ? JSON.parse(branch_list) : '';
            let findBranchOwnerMobbileNum = [owner_contact_number, ...branch_list].map((brn) => brn.branch_owner_number).flat();

            let findExitUser = await USERMODAL.find({ phone_number: { $in: findBranchOwnerMobbileNum }, roles: { $nin: ["branchowner", "garbaclassowner"] }, is_deleted: false }).select('name roles phone_number');
            console.log({ findExitUser })
            if (findExitUser && findExitUser.length) {
                return res.status(StatusCodes.OK).json({ status: 0, message: 'User Already owner! Please check number', data: findOwner || findExitUser });
            }
            const existGarbaClass = await helaperfn.commonQuery(GARBACLASSMODAL, querynames.findOne, { garba_classname });

            if (existGarbaClass.status === 1) {
                return res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.EXISTS("Garba Class") });
            }
            console.log({ garba_classname })

            await garbaValidator.creategarbaclass.validateAsync(req.body);

            let userField = owner_email ? { email: owner_email } : { phone_number: owner_contact_number };
            const existUser = await helaperfn.commonQuery(USERMODAL, querynames.findOne, { ...userField, is_deleted: false });


            const filelist = req.files || {};
            const uploads = Object.keys(filelist).map(async (key) => {
                const file = filelist[key][0];
                if (file) {
                    const { status, url } = await ocenfileupload.imageuploads({ file, foldername: 'Garbaclass' });
                    return status === 1 ? url : '';
                }
                return '';
            });
            const [owner_profile_pic, garba_class_logo] = await Promise.all(uploads);

            var newOwnerId = '';
            if (existUser.status === 1) {
                newOwnerId = existUser.data._id;
                await helaperfn.commonQuery(USERMODAL, querynames.findOneAndUpdate, { _id: newOwnerId, is_deleted: false }, { roles: 'garbaclassowner' });
            } else {

                const newUserData = await helaperfn.commonQuery(USERMODAL, querynames.create, {
                    email: owner_email,
                    name: owner_name,
                    phone_number: owner_contact_number,
                    profile_pic: owner_profile_pic,
                    roles: 'garbaclassowner'
                });
                newOwnerId = newUserData.data._id;
            }


            let newGarbaClass = await helaperfn.commonQuery(GARBACLASSMODAL, querynames.create, {
                ...clssfields,
                owner: newOwnerId,
                garba_classname,
                garba_class_logo, zone: zone_id
            });

            const mainBranchClass = await helaperfn.commonQuery(BRANCHMODAL, querynames.create, {
                branch_name: req.body.garba_classname,
                branch_address: req.body.garba_class_address,
                branch_area: req.body.garba_class_area,
                main_branch: true, zone: zone_id,
                parent: newGarbaClass.data._id,
                owner: newOwnerId
            });
            await USERMODAL.findOneAndUpdate(
                { _id: newOwnerId, is_deleted: false },
                { roles: 'garbaclassowner', owener_of_garba_class: newGarbaClass.data._id },
                { new: true, runValidators: true }
            );

            newGarbaClass = await helaperfn.commonQuery(GARBACLASSMODAL, querynames.findOneAndUpdate, { _id: newGarbaClass.data._id }, { $addToSet: { branch_list: mainBranchClass.data._id } });
            if (branch_list && branch_list.length > 0) {
                for (let keyObject of branch_list) {
                    let { branch_owner_name, branch_owner_email, branch_owner_number, branch_name } = keyObject;

                    if (branch_name) {
                        let userField = branch_owner_email ? { email: branch_owner_email } : { phone_number: branch_owner_number };
                        console.log({ userField })
                        const findUser = await helaperfn.commonQuery(USERMODAL, querynames.findOne, { ...userField, is_deleted: false });
                        console.log({ findUser })


                        var newBranchOwnerId = '';
                        if (findUser.status === 1) {
                            newBranchOwnerId = findUser.data._id;
                            await USERMODAL.findOneAndUpdate(
                                { _id: newBranchOwnerId },
                                { roles: 'branchowner' },
                                { new: true, runValidators: true }
                            );
                        } else {
                            const newUserData = await helaperfn.commonQuery(USERMODAL, querynames.create, {
                                email: branch_owner_email,
                                name: branch_owner_name,
                                phone_number: branch_owner_number,
                                roles: 'branchowner'
                            });
                            newBranchOwnerId = newUserData.data._id;
                        }

                        console.log({ newBranchOwnerId })

                        const findBranch = await helaperfn.commonQuery(BRANCHMODAL, querynames.findOne, { branch_name: branch_name });
                        console.log({ findBranch })

                        if (findBranch.status !== 1) {
                            const newBranchClass = await helaperfn.commonQuery(BRANCHMODAL, querynames.create, {
                                ...keyObject, zone: zone_id,
                                parent: newGarbaClass.data._id,
                                owner: newBranchOwnerId
                            });
                            console.log({ newBranchClass })

                            await USERMODAL.findOneAndUpdate(
                                { _id: newBranchOwnerId, is_deleted: false },
                                { owener_of_garba_class_branch: newBranchClass.data._id },
                                { new: true, runValidators: true }
                            );
                            newGarbaClass = await helaperfn.commonQuery(GARBACLASSMODAL, querynames.findOneAndUpdate, { _id: newGarbaClass.data._id }, { $addToSet: { branch_list: newBranchClass.data._id } });
                        } else {
                            newGarbaClass = await helaperfn.commonQuery(GARBACLASSMODAL, querynames.findOneAndUpdate, { _id: newGarbaClass.data._id }, { $addToSet: { branch_list: findBranch.data._id } });
                        }
                        console.log({ findBranch })
                    }
                }
            }

            const findGarbaClass = await GARBACLASSMODAL.findOne({ _id: newGarbaClass.data._id }).populate('branch_list');

            return res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.CREATED_SUCCESS('Garba Class'), data: findGarbaClass });
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while creating GarbaClass', error: JSON.stringify(err) });
        }
    },
    updateGarbaClass: async function (req, res, next) {
        try {
            const { garba_classname } = req.body;
            const existGarbaClass = await helaperfn.commonQuery(GARBACLASSMODAL, querynames.findOne, { garba_classname });

            if (existGarbaClass.status == 1) {
                const updateGarbaClass = await helaperfn.commonQuery(GARBACLASSMODAL, querynames.findOneAndUpdate, { _id: existGarbaClass.data._id }, { ...req.body });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.UPDATED_SUCCESS("Garba Class"), data: updateGarbaClass.data });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Garba Class") });
            }

        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updating GarbaClass', error: err });
        }
    },
    updateGarbaBranch: async function (req, res, next) {
        try {
            const { branch_id, branch_address, branch_name, branch_area } = req.body;
            const existGarbaBranch = await helaperfn.commonQuery(BRANCHMODAL, querynames.findOne, { _id: branch_id });

            if (existGarbaBranch.status == 1) {
                const file = req.file;
                let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'BranchOwner' }) : '';
                imagurlpath = status === 1 ? imagurlpath : '';
                const updateGarbaClass = await helaperfn.commonQuery(BRANCHMODAL, querynames.findOneAndUpdate,
                    { _id: existGarbaBranch.data._id },
                    { branch_address, branch_name, branch_area, profile_pic: imagurlpath });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.UPDATED_SUCCESS("Branch Class"), data: updateGarbaClass.data });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Branch Class") });
            }

        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updating garba Branch', error: err });
        }
    },
    deleteGarbaClass: async function (req, res, next) {
        try {
            const { garba_classname_id } = req.body;
            const existGarbaClass = await helaperfn.commonQuery(GARBACLASSMODAL, querynames.findOne, { _id: garba_classname_id });

            if (existGarbaClass.status == 1) {
                await helaperfn.commonQuery(GARBACLASSMODAL, querynames.findOneAndUpdate, { _id: garba_classname_id }, { is_deleted: true });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.DELETED_SUCCESS("Garba Class") });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Garba Class") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting GarbaClass', error: err });
        }
    },
    getAllGarbaClass: async function (req, res, next) {
        try {
            const existGarbaClass = await GARBACLASSMODAL.find({ is_deleted: false })
                .populate([
                    {
                        path: 'owner',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                    },
                    {
                        path: 'branch_list',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                        // populate: [
                        //     {
                        //         path: 'student_list',
                        //         match: { _id: { $exists: true } },
                        //         select: 'profile_pic name gender phone_number',
                        //         // populate: {
                        //         //     path: 'pass_list',
                        //         //     match: { _id: { $exists: true } },
                        //         //     select: '-createdAt -updatedAt',
                        //         //     populate: [{
                        //         //         path: 'parking',
                        //         //         match: { _id: { $exists: true } },
                        //         //         select: '-createdAt -updatedAt',
                        //         //     }]
                        //         // }
                        //     },
                        // ]
                    },
                ])

            console.log({ existGarbaClass })
            let garbaclassData = existGarbaClass.length > 0 ? existGarbaClass : null;
            res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Garba Class"), data: garbaclassData });
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Garba Class', error: err });
        }
    },
    getGarbaClass: async function (req, res, next) {
        try {
            const { garba_id } = req.params;

            const existGarbaClass = await GARBACLASSMODAL.findOne({ _id: garba_id })
                .populate('owner')
                .populate([
                    {
                        path: 'branch_list',
                        populate: {
                            path: 'student_list',
                            match: { _id: { $exists: true } },
                            select: 'profile_pic name gender phone_number',
                            populate: {
                                path: 'pass_list',
                                match: { _id: { $exists: true } },
                                select: '-createdAt -updatedAt',
                                populate: [
                                    {
                                        path: 'parking',
                                        match: { _id: { $exists: true } },
                                        select: '-createdAt -updatedAt',
                                    },
                                    {
                                        path: 'mentor_list',
                                        match: { _id: { $exists: true } },
                                        select: '-createdAt -updatedAt',
                                    },
                                    {
                                        path: "special_accesszones special_accessgates special_accesscheckpoints",
                                        match: { _id: { $exists: true } },
                                        select: '-createdAt -updatedAt',
                                    },
                                    {
                                        path: "access_blockzones access_blockgates access_blockcheckpoints",
                                        match: { _id: { $exists: true } },
                                        select: '-createdAt -updatedAt',
                                    },
                                ]
                            }
                        },

                    },
                    {
                        path: 'zone',
                        match: { _id: { $exists: true } },
                    },
                    {
                        path: 'branch_list',
                        populate: {
                            path: 'approval_request_list',
                            model: 'users'
                        }
                    }
                ]);

            if (existGarbaClass) {
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Garba Class"), data: existGarbaClass });

            } else {
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.NOT_FOUND("Garba Class") });

            }

        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while fetching Garba Class', error: err });
        }
    },
    getBranchInfo: async function (req, res, next) {
        try {
            const { branch_id } = req.params;

            const existBranch = await BRANCHMODAL.findOne({ _id: branch_id })
                .populate([
                    {
                        path: 'owner',
                        match: { _id: { $exists: true } },
                        select: 'name gender phone_number profile_pic roles',

                    },
                    {
                        path: 'parent zone approval_request_list',
                        match: { _id: { $exists: true } },
                        select: '-updatedAt -createdAt',
                    },
                    {
                        path: 'student_list',
                        match: { _id: { $exists: true } },
                        select: 'profile_pic name gender phone_number',
                        // populate: {
                        //     path: 'pass_list',
                        //     match: { _id: { $exists: true } },
                        //     select: '-createdAt -updatedAt',
                        //     populate: [{
                        //         path: 'parking',
                        //         match: { _id: { $exists: true } },
                        //         select: '-createdAt -updatedAt',
                        //     }]
                        // }
                    },
                ]);

            console.log({ existBranch });

            if (existBranch) {
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Garba class Branch"), data: existBranch });

            } else {
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.NOT_FOUND("Garba class Branch"), data: null });

            }

        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while fetching Garba class Branch', error: err });
        }
    },
    getAllBranch: async function (req, res, next) {
        try {

            const existAllBranch = await BRANCHMODAL.find({ is_deleted: false })
                .populate('owner')
                .populate('parent')
                .populate('student_list')
                .populate('approval_request_list');

            if (existAllBranch) {
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Garba class All Branch"), data: existAllBranch });

            } else {
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.NOT_FOUND("Garba class ALL Branch"), data: null });

            }

        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while fetching Garba class ALL Branch', error: err });
        }
    },

}
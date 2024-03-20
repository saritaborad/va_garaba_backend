const { StatusCodes } = require('http-status-codes');
const judgevalidate = require("../validator/judgevalidate")
const ocenfileupload = require('../utilis/oceanspcecode');
const helaperfn = require('../helper/helper');
const querynames = helaperfn.QUERY;
const User = require("../models/users.model")
const PRIZECATEGORIES = require("../models/prizecategoriesmodel");
const prizecategoriesvalidate = require('../validator/prizecategoriesvalidate');
const PASSUSER = require('../models/passmodal');
const EVENTS = require('../models/eventmodal');
const { OK, CREATED, INTERNAL_SERVER_ERROR, BAD_REQUEST } = StatusCodes;

module.exports = {
    addJudge: async function (req, res) {
        try {
            let { judge_name, judge_gender, judge_phone_number, judge_blood_group } = req.body;

            let { _id: user_id } = req.user;
            const existUser = await User.findOne({ _id: user_id });
            if (existUser) {
                await judgevalidate.createJudge.validateAsync(req.body);
                const file = req.file;
                let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'Judge' }) : '';
                imagurlpath = status === 1 ? imagurlpath : '';

                const createJudge = await helaperfn.commonQuery(User, querynames.create, { name: judge_name, gender: judge_gender, phone_number: judge_phone_number, roles: "judge", blood_group: judge_blood_group, profile_pic: imagurlpath });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.CREATED_SUCCESS(`Judge`), data: createJudge.data });
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
        }
    },
    getAllJudge: async function (req, res) {
        try {
            let { _id: user_id } = req.user;
            const existUser = await User.findOne({ _id: user_id });
            if (existUser) {
                let andQuery = [{ roles: "judge" }];
                if (req.query.assign === `true`) {
                    andQuery.push({ event: { $exists: true, $ne: [] } });
                } else if (req.query.assign === `false`) {
                    andQuery.push({ event: { $size: 0 } });
                }
                if (req.query.name) {
                    andQuery.push({ name: { $regex: req.query.name, "$options": "i" } })
                }
                let arrData;
                if (andQuery.length > 0) {
                    arrData = {
                        $and: andQuery,
                    };
                } else {
                    arrData = {};
                }
                const judgeList = await helaperfn.commonQuery(User, querynames.find, arrData);
                // const judgeList = await User.find({ roles: "judge" })
                res.status(StatusCodes.OK).json({ status: 1, message: 'All Judge List.', data: judgeList.data });
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
        }
    },
    getJudge: async function (req, res, next) {
        try {
            let { judge_id } = req.params;
            let { _id: user_id } = req.user;
            const existUser = await User.findOne({ _id: user_id });
            if (existUser) {
                const existJudge = await User.findOne({ _id: judge_id })
                if (existJudge) {
                    res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Judge"), data: existJudge ? existJudge : null });
                } else {
                    res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Judge") });
                }
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while getting Prize category', error: err });
        }
    },
    updateJudge: async function (req, res, next) {
        try {
            const { judge_id } = req.body;
            let { _id: user_id } = req.user;
            const existUser = await User.findOne({ _id: user_id });
            if (existUser) {
                const existJudge = await helaperfn.commonQuery(User, querynames.findOne, { _id: judge_id, roles: "judge" });
                if (existJudge.status == 1) {
                    const updateJudge = await helaperfn.commonQuery(PRIZECATEGORIES, querynames.findOneAndUpdate, { _id: existJudge.data._id }, { ...req.body });
                    res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.UPDATED_SUCCESS("Judge"), data: updateJudge.data });
                } else {
                    res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Judge") });
                }
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updating Judge', error: err });
        }
    },
    assignJudgeEvent: async function (req, res) {
        try {
            let { event_id, judge_id } = req.body;
            let { _id: user_id } = req.user;
            const existUser = await User.findOne({ _id: user_id });
            if (existUser) {
                const isEventExists = await User.findOne({ event: event_id })
                console.log("isEventExists", isEventExists)
                if (isEventExists) {
                    return res.status(StatusCodes.OK).json({ status: 1, message: 'Already Assign this event.', data: null });
                }

                const createJudge = await helaperfn.commonQuery(User, querynames.findOneAndUpdate, { _id: judge_id }, { $addToSet: { "event": { $each: [event_id] } } });
                res.status(StatusCodes.OK).json({ status: 1, message: 'Assign judge event Succesfully.', data: createJudge.data });
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
        }
    },
    unassignJudgeEvent: async function (req, res) {
        try {
            let { judge_id, event_id } = req.body;
            let { _id: user_id } = req.user;
            const existUser = await User.findOne({ _id: user_id });
            if (existUser) {
                const unassignJudgeEvent = await helaperfn.commonQuery(User, querynames.findOneAndUpdate, { _id: judge_id }, { $pull: { event: event_id } });
                res.status(StatusCodes.OK).json({ status: 1, message: 'Remove event Succesfully.', data: unassignJudgeEvent.data });
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
        }
    },
    addPrizeCategories: async function (req, res) {
        try {
            let { prize_name, type, prize_rank, couple_flag } = req.body;
            let { _id: user_id } = req.user;
            const existUser = await User.findOne({ _id: user_id });
            if (existUser) {
                await prizecategoriesvalidate.createPrizeCategroies.validateAsync(req.body);
                const createPriceCategories = await helaperfn.commonQuery(PRIZECATEGORIES, querynames.create, { prize_name, type, prize_rank, couple_flag });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.CREATED_SUCCESS(`Prize Categories`), data: createPriceCategories.data });
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
        }
    },
    updatePrizeCategory: async function (req, res, next) {
        try {
            const { prize_category_id } = req.body;
            let { _id: user_id } = req.user;
            const existUser = await User.findOne({ _id: user_id });
            if (existUser) {
                const existPrizeCategory = await helaperfn.commonQuery(PRIZECATEGORIES, querynames.findOne, { _id: prize_category_id });
                if (existPrizeCategory.status == 1) {
                    const updatePrizeCategory = await helaperfn.commonQuery(PRIZECATEGORIES, querynames.findOneAndUpdate, { _id: existPrizeCategory.data._id }, { ...req.body });
                    res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.UPDATED_SUCCESS("Prize category"), data: updatePrizeCategory.data });
                } else {
                    res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Prize category") });
                }
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updating Prize category', error: err });
        }
    },
    deletePrizeCategory: async function (req, res, next) {
        try {
            const { prize_category_id } = req.body;
            const existPrizeCategory = await helaperfn.commonQuery(PRIZECATEGORIES, querynames.findOne, { _id: prize_category_id });
            if (existPrizeCategory.status == 1) {
                await helaperfn.commonQuery(PRIZECATEGORIES, querynames.findOneAndUpdate, { _id: existPrizeCategory.data._id }, { is_deleted: true });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.DELETED_SUCCESS("Prize Category") });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Prize Category") });
            }
        } catch (err) {
            console.error(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Prize Category', error: err });
        }
    },
    getAllPrizeCategories: async function (req, res) {
        try {
            let { _id: user_id } = req.user;
            const existUser = await User.findOne({ _id: user_id });
            if (existUser) {
                let arrData;
                if (req.query.name) {
                    arrData = {
                        $and: [{ prize_name: { $regex: req.query.name, "$options": "i" } }],
                    };
                } else {
                    arrData = {};
                }
                const prizeCategoriesList = await helaperfn.commonQuery(PRIZECATEGORIES, querynames.find, arrData);
                res.status(StatusCodes.OK).json({ status: 1, message: 'All Prize Categories List.', data: prizeCategoriesList.data });
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
        }
    },
    getPrizeCategory: async function (req, res, next) {
        try {
            let { prize_categroies_id } = req.params;
            let { _id: user_id } = req.user;
            const existUser = await User.findOne({ _id: user_id });
            if (existUser) {
                const existPrizeCategory = await PRIZECATEGORIES.findOne({ _id: prize_categroies_id })
                if (existPrizeCategory) {
                    res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Prize category"), data: existPrizeCategory ? existPrizeCategory : null });
                } else {
                    res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Prize category") });
                }
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while getting Prize category', error: err });
        }
    },
    judgeResult: async function (req, res) {
        try {
            let { event_id, prize_categroies_id } = req.body;
            let { _id: user_id } = req.user;
            const existUser = await User.findOne({ _id: user_id });
            if (existUser) {
                const result = await PASSUSER.find({ "winner.event": event_id, "winner.prize_category": prize_categroies_id })
                    .populate({
                        path: 'user',
                        match: { _id: { $exists: true } },
                        select: 'phone_number name profile_pic '
                    }).sort({"winner.rank":1})
                // .populate({
                //     path: 'winner.event',
                //     match: { _id: { $exists: true } },
                //     select: '-createdAt -updatedAt'
                // })
                // .populate({
                //     path: 'winner.prize_category',
                //     match: { _id: { $exists: true } },
                //     select: '-createdAt -updatedAt'
                // })
                // .populate({
                //     path: 'winner.judge',
                //     match: { _id: { $exists: true } },
                //     select: '-createdAt -updatedAt'
                // })
                res.status(StatusCodes.OK).json({ status: 1, message: 'result.', data: result });
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
        }
    },
    getJudgeEventAssign: async function (req, res) {
        try {
            //view assign event
            let { _id: user_id } = req.user;
            const existUser = await User.findOne({ _id: user_id })
            if (existUser) {
                const judgeEventList = await User.findOne({ _id: user_id }).populate([
                    {
                        path: 'event',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                    },

                ]);
                res.status(StatusCodes.OK).json({ status: 1, message: 'Judge assign event List.', data: judgeEventList });
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
        }
    },
    judgePrizeAssign: async function (req, res) {
        try {
            let { pass_id, event_id, prize_category_id, rank } = req.body;
            let { _id: user_id } = req.user;

            const existUser = await User.findOne({ _id: user_id });
            if (existUser) {
                let winner = {
                    event: event_id,
                    prize_category: prize_category_id,
                    rank: rank,
                    judge: user_id,
                }
                const existPassUser = await helaperfn.commonQuery(PASSUSER, querynames.findOne, { _id: pass_id, "winner.rank": 0 || undefined });
                if (existPassUser.status == 1) {
                    //add winner details
                    const updatePassUser = await helaperfn.commonQuery(PASSUSER, querynames.findOneAndUpdate, { _id: existPassUser.data._id }, { winner: winner });
                    res.status(StatusCodes.OK).json({ status: 1, message: "Judge prize assign ", data: updatePassUser.data });
                } else {
                    const isCouple = await PRIZECATEGORIES.findOne({ _id: prize_category_id })
                    // p-user assign couple prize - already assign price
                    if (isCouple.type === "couple") {
                        // store p-user inforamation
                    } else {
                        res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Already assgin Prize Or Pass User") });
                    }

                }
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
        }
    },
    updateRank: async function (req, res) {
        try {
            let { pass_id, rank, prize_category_id } = req.body;
            let { _id: user_id } = req.user;

            const existUser = await User.findOne({ _id: user_id });
            if (existUser) {
                let winner = {
                    prize_category: prize_category_id,
                    rank: rank,
                    judge: user_id,
                }
                const existPassUser = await helaperfn.commonQuery(PASSUSER, querynames.findOne, { _id: pass_id, "winner.rank": { $ne: 0 || undefined } });
                if (existPassUser.status == 1) {
                    const updatePassUser = await helaperfn.commonQuery(PASSUSER, querynames.findOneAndUpdate, { _id: existPassUser.data._id }, { "winner.rank": rank, "winner.prize_category": prize_category_id });
                    res.status(StatusCodes.OK).json({ status: 1, message: "Update Rank or price category ", data: updatePassUser.data });
                } else {
                    res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("User Prize ") });
                }
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
        }
    },
    // updateJudgePrizeAssign: async function (req, res) {
    //     try {
    //         let { pass_id, prize_category_id, rank } = req.body;
    //         let { _id: user_id } = req.user;

    //         const existUser = await User.findOne({ _id: user_id });
    //         if (existUser) {
    //             let winner = { 
    //                 prize_category: prize_category_id,
    //                 rank: rank,
    //                 judge: user_id,
    //             }
    //             const existPassUser = await helaperfn.commonQuery(PASSUSER, querynames.findOne, { _id: pass_id,"winner.rank": {$ne : 0 || undefined} });
    //             if (existPassUser.status == 1) {
    //                 const updatePassUser = await helaperfn.commonQuery(PASSUSER, querynames.findOneAndUpdate, { _id: existPassUser.data._id }, { winner: winner });
    //                 res.status(StatusCodes.OK).json({ status: 1, message: "Judge prize assign ", data: updatePassUser.data });
    //             } else {
    //                 res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("User Prize ") });  
    //             }
    //         } else {
    //             res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
    //     }
    // },
    JudgePrizeUnAssign: async function (req, res) {
        try {
            let { pass_id } = req.body;
            let { _id: user_id } = req.user;

            const existUser = await User.findOne({ _id: user_id });
            if (existUser) {
                let winner = {
                    rank: 0,
                }
                const existPassUser = await helaperfn.commonQuery(PASSUSER, querynames.findOne, { _id: pass_id, "winner.rank": { $ne: 0 || undefined } });
                if (existPassUser.status == 1) {
                    const updatePassUser = await helaperfn.commonQuery(PASSUSER, querynames.findOneAndUpdate, { _id: existPassUser.data._id }, { winner: winner });
                    res.status(StatusCodes.OK).json({ status: 1, message: "Judge prize Unassign ", data: updatePassUser.data });
                } else {
                    res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS(" Prize ") });
                }
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
        }
    },
    getPassUserPhoneNo: async function (req, res) {
        try {
            let { _id: user_id } = req.user;
            const existUser = await User.findOne({ _id: user_id })
            if (existUser) {
                // const existPhoneNO = await helaperfn.commonQuery(User, querynames.findOne, { phone_number: req.query.phone_number, roles: "p-user" });
                const existPhoneNO = await User.findOne({ phone_number: req.query.phone_number, roles: "p-user" }).populate(
                    {
                        path: 'pass_list',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                    }).populate(
                    {
                        path: 'owener_of_garba_class',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                    });
                if (existPhoneNO) {
                    res.status(StatusCodes.OK).json({ status: 1, message: 'pass user.', data: existPhoneNO });
                } else {
                    res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Pass User") });
                }
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
        }
    },
    judgeGetPassUser: async function (req, res) {
        try {
            let { pass_id} = req.body;
            let { _id: user_id } = req.user;
            const existUser = await User.findOne({ _id: user_id });
            if (existUser) {
                const result = await PASSUSER.findOne({ _id:pass_id})
                    .populate({
                        path: 'winner.prize_category',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                    })
                    .populate({
                        path: 'user',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                    })
                res.status(StatusCodes.OK).json({ status: 1, message: 'result.', data: result });
            } else {
                res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
            }
        } catch (error) {
            console.log(error);
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
        }
    },
    // getPassUserQRscan: async function (req, res) {
    //     try {
    //         let { pass_qr } = req.body
    //         let { _id: user_id } = req.user;
    //         const existUser = await User.findOne({ _id: user_id })
    //         if (existUser) {
    //             //logic 
    //         } else {
    //             res.status(BAD_REQUEST).json({ status: 0, message: 'User Not Found.', data: null });
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error), data: null });
    //     }
    // },
}
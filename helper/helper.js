const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const allconfig = require('../config/allconfig');

const commonMessages = {
    COMMON_ERROR: "Error, Please try again!",
    INTERNAL_SERVER_ERROR: "Internal Server Error!",
    NOT_AUTHORIZED: "Not Authorized!",
    EXISTS: (_tag) => `${_tag} exists!`,
    ALREADY_EXISTS: (_tag) => `${_tag} Already exists!`,
    NOT_EXISTS: (_tag) => `${_tag} not exists!`,
    OTP_NOT_VALID: (_tag) => `${_tag} does not exist!`,
    OTP_VALID: (_tag) => `${_tag} is Valid.`,
    SEND_SUCCESS: (_tag) => `${_tag} sent successfully.`,
    NOT_SEND: (_tag) => `${_tag} not sent!`,
    SIGNUP_SUCCESS: (_tag) => `${_tag} Signup Successfully.`,
    LOGIN_SUCCESS: (_tag) => `${_tag} Login Successfully.`,
    CREATED_SUCCESS: (_tag) => `${_tag} Created Successfully.`,
    GET_DATA_SUCCESS: (_tag) => `${_tag} Fetch Successfully.`,
    UPDATED_SUCCESS: (_tag) => `${_tag} Updated Successfully.`,
    DELETED_SUCCESS: (_tag) => `${_tag} Deleted Successfully.`,
    LIKED_SUCCESS: (_tag) => `${_tag} Liked Successfully.`,
    DISLIKED_SUCCESS: (_tag) => `${_tag} Disliked Successfully.`,
    BOOKMARK_SUCCESS: (_tag) => `${_tag} Bookmarked Successfully.`,
    BOOKMARK_REMOVE: (_tag) => `${_tag} Bookmark Removed.`,
    SUBSCRIBE_SUCCESS: (_tag) => `${_tag} Subscribed Successfully.`,
    SUBSCRIBE_REMOVE: (_tag) => `${_tag} Subscribe Removed.`,
    FOUND_SUCCESS: (_tag) => `${_tag} Found.`,
    NOT_CREATED: (_tag) => `${_tag} Not Created!`,
    NOT_FOUND: (_tag) => `${_tag} Not Found!`
}

const QUERY = {
    find: "find",
    findOne: "findOne",
    create: "create",
    findById: "findById",
    findOneAndDelete: "findOneAndDelete",
    findOneAndUpdate: "findOneAndUpdate",
    upsert: 'upsert',
    countDocuments: "countDocuments",
    findwithorcondition: "findwithorcondition",
}

const { find, findOne, create, findById, findOneAndDelete, findOneAndUpdate, upsert, countDocuments, findwithorcondition } = QUERY

module.exports = {
    QUERY,
    commonMessages,
    commonQuery: async (model, query, data = {}, update = {}, select = '', populate = null, perPage = 0, page = 1) => {
        try {
            let res;
            switch (query) {
                case find:
                    res = await model.find(data).sort(update).limit(perPage).skip(perPage * (page - 1)).select(select).populate(populate).lean();
                    break;
                case findOne:
                    res = await model.findOne(data).select(select).populate(populate).lean().sort(update);
                    break;
                case create:
                    res = await model.create(data);
                    break;
                case findById:
                    res = await model.findById(data);
                    break;
                case findOneAndDelete:
                    res = await model.findOneAndDelete(data);
                    break;
                case findOneAndUpdate:
                    res = await model.findOneAndUpdate(data, update, { new: true }).select(select).populate(populate);
                    break;
                case upsert:
                    res = await model.findOneAndUpdate(data, update, { upsert: true, new: true });
                    break;
                case countDocuments:
                    res = await model.countDocuments(data);
                case findwithorcondition:
                    let resdata = await model.find({
                        $and: data
                    });
                    res = resdata.length > 0 ? resdata[0] : 0;
                    break;
            };

            if (!res || !data) {
                console.log(res, '====>>>> res');
                return { status: 2, message: commonMessages.COMMON_ERROR }
            } else {
                return { status: 1, data: res }
            }
        } catch (error) {
            console.log("helperError ====>>>> ", error);
            return { status: 0, message: error.message || error, error }
        }
    },
    createBcryptPassword: async (password) => {
        try {
            let hash_password = await bcrypt.hash(password, 10);
            return hash_password;
        } catch (error) {
            return { status: 0, message: commonMessages.INTERNAL_SERVER_ERROR, error };
        }
    },
    checkBcryptPassword: async (password, savedPassword) => {
        try {
            let is_match = await bcrypt.compare(password, savedPassword);
            if (!is_match) {
                return { status: 2, message: 'Password does not match!' };
            } else {
                return { status: 1, message: 'Welcome to Project.' };
            };
        } catch (error) {
            return { status: 0, message: commonMessages.INTERNAL_SERVER_ERROR, error };
        }
    },
    generateToken: async (data) => {
        try {
            // let token = jwt.sign(data, allconfig.secret_private_key, { expiresIn: '1d' })
            let token = jwt.sign(data, allconfig.secret_private_key)
            return { status: 1, token };
        } catch (error) {
            return { status: 0, message: commonMessages.INTERNAL_SERVER_ERROR, error };
        }
    },
    verifyToken: async (token) => {
        try {
            const decodedData = jwt.verify(token, allconfig.secret_private_key)
            return { status: 1, data: decodedData };
        } catch (error) {
            return { status: 0, message: commonMessages.INTERNAL_SERVER_ERROR, error };
        }
    },
};

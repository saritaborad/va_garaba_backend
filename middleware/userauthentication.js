const catchAsyncError = require("./catchAsyncError");
const JWT = require('jsonwebtoken')
const ErrorHandler = require("../utilis/catchErrorhandler");
let User = require('../models/users.model');
const allConfig = require('../config/allconfig');

module.exports = {
    isUserAdmin: (...roles) => {

        return (req, res, next) => {
            if (!roles.includes(req.user.roles)) {
                return next(
                    res.status(403).json({ status: 1, message: `Role: ${req.user.roles} is not Allowed to access this resource.` })
                    // new ErrorHandler(
                    //     `Role: ${req.user.roles} is not Allowed to access this resource.`, 403
                    // )
                )
            }
            next()
        }
    },
    isAuthonticate: catchAsyncError(async (req, res, next) => {
        const { token } = req.headers || req.cookies;
        try {
            if (!token) {
                // return next(new ErrorHandler("Please Login to access this resource", 401))
                return res.status(403).json({ status: 10, message: `Please Login to access this resource` })
            }

            let decoded = JWT.verify(token, allConfig.JWT_SECRET);
            console.log({ decoded });
            const user = await User.findOne({ phone_number: decoded.phone_number, is_deleted: false });
            if (!user) {
                return res.status(403).json({ status: 10, message: 'User not found' });
            }
            req.user = user;
            next();
        } catch (error) {
            res.status(403).json({ status: 10, message: 'Token is not valid or Expired!' });
        }

    })
}
const { commonMessages, verifyToken } = require("../helper/helper");
const { StatusCodes } = require("http-status-codes");
const { BAD_REQUEST } = StatusCodes;

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (token) {
            const { data } = await verifyToken(token);
            req.user = data.userId;
            next();
        } else {
            res.status(BAD_REQUEST).json({ status: 0, message: commonMessages.NOT_AUTHORIZED });
        }
    } catch (error) {
        console.log(error, '====>>>> auth-error');
        res.status(BAD_REQUEST).json({ status: 0, message: commonMessages.NOT_AUTHORIZED });
    }
}

module.exports = auth;
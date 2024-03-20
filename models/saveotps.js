const mongoose = require('mongoose');

const saveotpSchema = mongoose.Schema({
    email: { type: String, trim: true },
    email_otp: { type: String, trim: true },
    phone_otp: { type: String, trim: true },
    phone: { type: String, trim: true },

}, { timestamps: true, versionKey: false });

const saveOtps = mongoose.model('saveotp', saveotpSchema);

module.exports = saveOtps;
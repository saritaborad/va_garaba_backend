const mongoose = require('mongoose');

const sendingSmsWpSchema = mongoose.Schema({
    type: { String },
    phone_number: { String },
    url: String,
    status: String,
    template: String,
    payload: Object,
    componets: Array,
    data: Object,

}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('sending_sms_wp', sendingSmsWpSchema);
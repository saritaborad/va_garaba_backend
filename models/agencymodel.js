const mongoose = require('mongoose');

const agencySchema = mongoose.Schema({
    profile_pic: { type: String, },
    name: { type: String, trim: true },
    phone_number: { type: Number, required: true },
    is_deleted: { type: Boolean, default: false },
    blood_group: { type: String, trim: true },
    birth_date: { type: String },
    instagram_id: { type: String },
    addresss: { type: String },
    email: { type: String, lowercase: true, trim: true },
    gender: {
        type: String,
        enum: ['male', 'female', ''],
        default: ''
    },
    garba_class_name: { type: String, trim: true },
    agency_type: { type: String, trim: true },
    authorized_name: { type: String, trim: true },
    authorized_contactnumber: { type: String, trim: true },
}, { timestamps: true, versionKey: false });



const Agency = mongoose.model('agencys', agencySchema);

module.exports = Agency;
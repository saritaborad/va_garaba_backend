const mongoose = require('mongoose');

const passmentorsSchema = mongoose.Schema({
    name: { type: String, trim: true },
    profile_pic: { type: String },
    birth_date: { type: String },
    instagram_id: { type: String },
    gender: { type: String },
    phone_number: { type: String, required: true, unique: true, },
    blood_group: { type: String, },
    is_deleted: { type: Boolean, default: false },
    is_completed: { type: Boolean, default: true },
    allow_change: { type: Boolean, default: true },
    is_valid: { type: Boolean, default: false },
    is_used: { type: Boolean, default: false },
    is_expire: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('passmentors', passmentorsSchema);
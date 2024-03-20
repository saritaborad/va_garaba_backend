const mongoose = require('mongoose');
const RANDOMID = require('../utilis/miscellaneous');
const genid = RANDOMID.generate();
const groundStaffSchema = mongoose.Schema({
    random_id: { type: String, default: genid },
    is_used: { type: Boolean, default: false },
    is_active: { type: Boolean, default: false },
    is_expire: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    is_valid: { type: Boolean, default: false },
    qr_code: { type: String, default: false },
    profile_pic: { type: String, trim: true },
    provided_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },

}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('ground_staff_qr', groundStaffSchema);
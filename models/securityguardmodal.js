const mongoose = require('mongoose');

const securityGuardSchema = mongoose.Schema({
    guard_name: { type: String, trim: true },
    guard_gender: { type: String, trim: true },
    phone_number: { type: String, trim: true },
    profile_pic: { type: String, },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    gate: { type: mongoose.Schema.Types.ObjectId, ref: 'gates' },
    parking: { type: mongoose.Schema.Types.ObjectId, ref: 'parkings' },
    checkpoint: { type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },
    scanningLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'scanningLogs' }],
    is_deleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('securityguards', securityGuardSchema);
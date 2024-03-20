const mongoose = require('mongoose');

const privilegeInviteLogsSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    user_name: { type: String, },
    phone_number: { type: String, },
    profile_pic: { type: String, },
    log: { type: String, },
    seat: { type: mongoose.Schema.Types.ObjectId, ref: 'sofaseats' },


}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('privilegeinvitelogs', privilegeInviteLogsSchema);
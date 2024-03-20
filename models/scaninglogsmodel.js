const mongoose = require('mongoose');
const FUNCTIONSLIST = require('../helper/functions');
const scanningLogsSchema = mongoose.Schema({
    time: { type: String, default: FUNCTIONSLIST.currentDateTime() },
    status: { type: String, },
    type: { type: String, },
    location_name: { type: String, },
    user_login: { type: Object },
    gaurd_login: { type: Object },
    is_maingate: { type: Boolean, default: false },
    location: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'gates' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'parkings' }
    ],
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'userorderticketcategory' },
    parking: { type: mongoose.Schema.Types.ObjectId, ref: 'userorderparkings' },
    pass: { type: mongoose.Schema.Types.ObjectId, ref: 'passes' },
    privilge: { type: mongoose.Schema.Types.ObjectId, ref: 'privilegeordertickets' },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'ground_staff_qr' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    guard: { type: mongoose.Schema.Types.ObjectId, ref: 'securityguards' },
}, { timestamps: true, versionKey: false })

scanningLogsSchema.set('strictPopulate', false);

module.exports = mongoose.model('scanningLogs', scanningLogsSchema)
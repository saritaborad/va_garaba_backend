const mongoose = require('mongoose');
const RANDOMID = require('../utilis/miscellaneous');
const genid = RANDOMID.generate();

const sofaSeatSchema = mongoose.Schema({
    seat_id: { type: String, default: genid },
    seat_name: { type: String, trim: true },
    main_section: { type: String, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    ticket_user: { type: mongoose.Schema.Types.ObjectId, ref: 'userordertickets' },
    sofa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'sofas' },
    position: { type: String, trim: true },
    seat_status: { type: String, default: 'Available' },//Invited Booked
    is_expire: { type: Boolean, default: false },
    is_used: { type: Boolean, default: false },
    is_alloted: { type: Boolean, default: false },
    is_active: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    allow_change: { type: Boolean, default: true },
    provide_by: { type: String, trim: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'events' },
    parking: { type: mongoose.Schema.Types.ObjectId, ref: 'userorderparkings' },
    provided_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },

}, { timestamps: true, versionKey: false });



module.exports = mongoose.model('sofaseats', sofaSeatSchema);
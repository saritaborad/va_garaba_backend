const mongoose = require('mongoose');
const RANDOMID = require('../utilis/miscellaneous');
const genid = RANDOMID.generate();

const seatUserSchema = mongoose.Schema({
    seat: { type: mongoose.Schema.Types.ObjectId, ref: 'sofaseats' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    is_expire: { type: Boolean, default: false },
    is_used: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'privilegeordertickets' },


}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('sofaseatusers', seatUserSchema);
const mongoose = require('mongoose');
const RANDOMID = require('../utilis/miscellaneous');
const genid = RANDOMID.generate();

let userTicketSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    ticket_random_id: { type: String, default: genid },
    gender: { type: String, trim: true },
    ticket_user: { type: mongoose.Schema.Types.ObjectId, ref: 'userordertickets' },
    allow_change: { type: Boolean, default: true },
    is_used: { type: Boolean, default: false },
    is_privilege: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    in_zone: { type: Boolean, default: false },
    is_active: { type: Boolean, default: false },
    provided_by: { type: String, trim: true },
    provided_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    seat: { type: mongoose.Schema.Types.ObjectId, ref: 'sofaseats' },
    is_valid: { type: Boolean, default: false },
    is_expire: { type: Boolean, default: false },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'events' },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },
    parking: { type: mongoose.Schema.Types.ObjectId, ref: 'userorderparkings' },
    special_access: { type: Boolean, default: false },
    special_accesszones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'zones' }],
    special_accessgates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gates' }],
    special_accesscheckpoints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' }],
    special_accessids: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'gates' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'parkings' }
    ],
    access_block: { type: Boolean, default: false },
    access_blockzones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'zones' }],
    access_blockgates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gates' }],
    access_blockcheckpoints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' }],
    access_blockids: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'gates' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'parkings' }
    ],
    payment_status: { type: String, trim: true, default: 'success' },
}, { timestamps: true, versionKey: false });

userTicketSchema.set('strictPopulate', false);

module.exports = mongoose.model('privilegeordertickets', userTicketSchema);
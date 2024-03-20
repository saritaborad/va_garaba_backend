const mongoose = require('mongoose');
const RANDOMID = require('../utilis/miscellaneous');
const generateid = RANDOMID.generate();

const mediaPressTicketSchema = mongoose.Schema({
    random_id: { type: String, default: generateid },
    house_name: { type: String },
    phone_number: { type: String, trim: true },
    blood_group: { type: String, },
    position: { type: String },
    name: { type: String, trim: true },
    remark: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },
    parking: { type: mongoose.Schema.Types.ObjectId, ref: 'userorderparkings' },
    is_valid: { type: Boolean, default: false },
    is_csv: { type: Boolean, default: false },
    is_used: { type: Boolean, default: false },
    is_active: { type: Boolean, default: false },
    is_expire: { type: Boolean, default: false },
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
    is_completed: { type: Boolean, default: true },
    allow_change: { type: Boolean, default: true },
    profile_pic: { type: String, trim: true },
    birth_date: { type: String },
    vehicle_number: { type: String, trim: true, default: null },
}, { timestamps: true, versionKey: false });



module.exports = mongoose.model('mediapress_ticket', mediaPressTicketSchema);
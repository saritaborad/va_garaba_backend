const mongoose = require('mongoose');
const RANDOMID = require('../utilis/miscellaneous');
const genid = RANDOMID.generate();

const sofaSchema = mongoose.Schema({
    sofa_id: { type: String, default: genid },
    sofa_name: { type: String, trim: true },
    sofa_section: { type: String, trim: true },
    main_section: { type: String, trim: true },
    total: { type: Number, trim: true },
    is_expire: { type: Boolean, default: false },
    is_used: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    is_active: { type: Boolean, default: false },
    sofa_status: { type: String, default: 'Available' },//Booked
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    seats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'sofaseats' }],
    row: { type: mongoose.Schema.Types.ObjectId, ref: 'sofarows' },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },

}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('sofas', sofaSchema);
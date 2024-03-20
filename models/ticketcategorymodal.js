const mongoose = require('mongoose');

const ticketcategorySchema = mongoose.Schema({
    ticket_name: { type: String, trim: true },
    color_code: { type: String, trim: true },
    gates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gates' }],
    checkpoints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' }],
    zones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'zones' }],
    ticket_sell: { type: Number, trim: true, default: 0 },
    dates: { type: Array, trim: true, default: [] },
    is_dropped: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    is_privilege: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });



const Ticketcategorys = mongoose.model('ticketcategorys', ticketcategorySchema);

module.exports = Ticketcategorys;
const mongoose = require('mongoose');

const eventCategorySchema = mongoose.Schema({
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'ticketcategorys' },
    ticket_name: { type: String, trim: true },
    color_code: { type: String, trim: true },
    gates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gates' }],
    checkpoints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' }],
    zones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'zones' }],
    price: { type: mongoose.Schema.Types.Mixed, trim: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'events' },
    qty: { type: Number, trim: true },
    is_deleted: { type: Boolean, default: false },

}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('eventcategory', eventCategorySchema);
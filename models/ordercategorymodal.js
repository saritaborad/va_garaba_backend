const mongoose = require('mongoose');

const orderCategorySchema = mongoose.Schema({
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'ticketcategorys' },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'events' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    assigned_user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    ticket_name: { type: String, trim: true },
    color_code: { type: String, trim: true },
    gates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gates' }],
    checkpoints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' }],
    zones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'zones' }],
    price: { type: mongoose.Schema.Types.Mixed, trim: true },
    qty: { type: Number, trim: true },
    is_dropped: { type: Boolean, default: false },
    is_active: {
        type: Boolean, default: false
    },
    is_deleted: { type: Boolean, default: false },
    is_salesteam: { type: Boolean, default: false },
    provided_by: { type: String, trim: true },
    provided_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    is_privilege: { type: Boolean, default: false },
    is_passuser: { type: Boolean, default: false },
    remark: { type: String, trim: true },
    by_cash: { type: Boolean, default: false },
    payment_status: { type: String, trim: true, default: 'cancel' },
}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('ordercategory', orderCategorySchema);
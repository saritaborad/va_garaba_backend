const mongoose = require('mongoose');

const couponcodeSchema = mongoose.Schema({
    phone_number: { type: String, trim: true },
    coupon_code: { type: String, trim: true },
    coupon_code_type: { type: String, trim: true, default: 'promocode' }, //complimantory and promocode
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    remark: { type: String, trim: true },
    event_date: { type: String, trim: true },
    event_day: { type: String, trim: true },
    provided_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    provided_by: { type: String, trim: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "events" },
    total: { type: Number, default: 0, trim: true },
    is_used: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },

}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('couponcodesrecords', couponcodeSchema);
const mongoose = require('mongoose');

const complimantorycodeSchema = mongoose.Schema({
    phone_number: { type: String, trim: true },
    remark: { type: String, trim: true },
    complimantory_code: { type: String, trim: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    coupon_id: { type: mongoose.Schema.Types.ObjectId, ref: 'couponcodes' },
    provided_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },

}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('complimantorycode', complimantorycodeSchema);
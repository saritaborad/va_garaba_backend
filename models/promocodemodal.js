const mongoose = require('mongoose');

const promocodeSchema = mongoose.Schema({
    promo_code: { type: String, trim: true },
    remark: { type: String, trim: true },
    discount_percentage: { type: String, trim: true },
    max_discount: { type: String, trim: true },
    name: { type: String, trim: true },
    is_deleted: { type: Boolean, default: false },
    created_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    created_by: { type: String, trim: true },
}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('promocode', promocodeSchema);
const mongoose = require('mongoose');

const taxeSchema = mongoose.Schema({
    tax_name: { type: String, trim: true },
    tax_rate: { type: String, trim: true },
    is_deleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('taxes', taxeSchema);
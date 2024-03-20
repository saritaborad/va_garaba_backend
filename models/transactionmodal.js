const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    transaction_date: { type: Date, default: Date.now },
    description: { type: String, trim: true },
    amount: { type: Number, trim: true },
    debit: { type: Number, trim: true },
    credit: { type: Number, trim: true },
    complimantory: { type: Boolean, trim: false },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'couponcodesrecords' },
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'sponsors' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    provided_by: { type: String, trim: true },
    provided_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
});

module.exports = mongoose.model('transactions', transactionSchema);
const mongoose = require('mongoose');
function generateId() {
    // Generate a random OTP
    let digits = '0123456789';
    let limit = 10;
    let getID = ''
    for (i = 0; i < limit; i++) {
        getID += digits[Math.floor(Math.random() * 10)];

    }
    return getID;
}

let orderSchema = mongoose.Schema({
    order_id: { type: String, required: true, default: generateId() },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "events" },
    total: { type: mongoose.Schema.Types.Mixed, trim: true, default: 0 },
    discounted_total: { type: Number, trim: true, default: 0 },
    sub_total: { type: mongoose.Schema.Types.Mixed, trim: true },
    total_tax: { type: mongoose.Schema.Types.Mixed, trim: true },
    base_price: { type: mongoose.Schema.Types.Mixed, trim: true },
    discount_price: { type: mongoose.Schema.Types.Mixed, trim: true },
    gst_in: { type: String, trim: true },
    is_gst_in: {
        type: Boolean, default: function () {
            return !!this.gst_in;
        }
    },
    business_name: { type: String, trim: true },
    business_address: { type: String, trim: true },
    promo_code_apply: { type: Boolean, trim: true, default: false },
    promo_code: { type: String, trim: true },
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ordercategory' }],
    parkings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'orderparkings' }],
    active_status: { type: Boolean, trim: true, default: false },
    used: { type: Boolean, trim: true, default: false },
    order_status: { type: Boolean, trim: true, default: false },
    is_csv: { type: Boolean, trim: true, default: false },
    by_cash: { type: Boolean, trim: true, default: false },
    transaction_Id: { type: String, trim: true, },
    payment_status: { type: String, trim: true, default: 'cancel' },
    payment_method: { type: String, trim: true, default: '---' },
    payment_response: { type: String, trim: true, },
    billdesk_order_id: { type: String, trim: true, },
    complimantory_code: { type: String, trim: true, },
    is_cc_created_superadmin: { type: Boolean, default: false },
    is_cc_created_sponsor: { type: Boolean, default: false },
    is_cc_created_admin: { type: Boolean, default: false },
    is_created_salesteam: { type: Boolean, default: false },
    payment_date: { type: String, trim: true, default: Date.now() },
    is_deleted: { type: Boolean, default: false },
    provided_by: { type: String, trim: true },
    order_slip: { type: String, trim: true },
    txn_process_type: { type: String, trim: true },
    provided_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
});


module.exports = mongoose.model('orders', orderSchema);
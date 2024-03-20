const mongoose = require('mongoose');
const RANDOMID = require('../utilis/miscellaneous');

const genid = RANDOMID.generate();
const userOrderticketCategorySchema = mongoose.Schema({
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'ticketcategorys' },
    ticket_random_id: { type: String, default: genid },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'events' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    assigned_user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    ticket_name: { type: String, trim: true },
    ticket_user: { type: mongoose.Schema.Types.ObjectId, ref: 'userordertickets' }, // USER DATA SAVE FOR TICKET
    color_code: { type: String, trim: true },
    gates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gates' }],
    checkpoints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' }],
    zones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'zones' }],
    price: { type: mongoose.Schema.Types.Mixed, trim: true },
    complimanotry: { type: Boolean, default: false },
    qty: { type: Number, trim: true },
    is_dropped: { type: Boolean, default: false },
    allow_change: { type: Boolean, default: true },
    is_used: { type: Boolean, default: false },
    is_expire: { type: Boolean, default: false },
    is_privilege: { type: Boolean, default: false },
    is_active: {
        type: Boolean, default: false
    },
    is_deleted: { type: Boolean, default: false },
    is_valid: { type: Boolean, default: false },
    provided_by: { type: String, trim: true },
    remark: { type: String, trim: true },
    by_cash: { type: Boolean, default: false },
    is_passuser: { type: Boolean, default: false },
    is_salesteam: { type: Boolean, default: false },
    provided_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    sofaseat: { type: mongoose.Schema.Types.ObjectId, ref: 'sofaseats' },
    special_access: { type: Boolean, default: false },
    special_accesszones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'zones' }],
    special_accessgates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gates' }],
    special_accesscheckpoints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' }],
    special_accessids: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'gates' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'parkings' }
    ],
    access_block: { type: Boolean, default: false },
    access_blockzones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'zones' }],
    access_blockgates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gates' }],
    access_blockcheckpoints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' }],
    access_blockids: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'gates' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'parkings' }
    ],
    payment_status: { type: String, trim: true, },
}, { timestamps: true, versionKey: false });

userOrderticketCategorySchema.set('strictPopulate', false);



module.exports = mongoose.model('userorderticketcategory', userOrderticketCategorySchema);
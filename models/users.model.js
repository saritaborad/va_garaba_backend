const mongoose = require('mongoose');
const { createBcryptPassword } = require('../helper/helper');
let JWT = require('jsonwebtoken');
const allconfig = require('../config/allconfig');


const userSchema = mongoose.Schema({
    name: { type: String, trim: true },
    profile_pic: { type: String },
    password: { type: String, trim: true },
    fcm_token: { type: String },
    user_ip: { type: String },
    device_id: { type: String },
    birth_date: { type: String },
    instagram_id: { type: String },
    phone_number: { type: String, required: true, unique: true, },
    blood_group: { type: String, },
    token: { type: String, },
    class_id: { type: String, },
    device_id: { type: String, },
    app_version: { type: String, },
    device_modal: { type: String, },
    owener_of_garba_class: { type: mongoose.Schema.Types.ObjectId, ref: 'garbaclass' },
    is_guard: { type: Boolean, default: false },
    guard: { type: mongoose.Schema.Types.ObjectId, ref: 'securityguards' },
    is_privilegeuser: { type: Boolean, default: false },
    is_privilegemember: { type: Boolean, default: false },
    sofa_member: [{ type: mongoose.Schema.Types.ObjectId, ref: 'sofas' }],
    is_sponsore: { type: Boolean, default: false },
    sponsore: { type: mongoose.Schema.Types.ObjectId, ref: 'sponsors' },
    owener_of_garba_class_branch: { type: mongoose.Schema.Types.ObjectId, ref: 'branches' },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'orders' }],
    garba_classes: { type: mongoose.Schema.Types.ObjectId, ref: 'branches' },
    pending_approval: { type: mongoose.Schema.Types.ObjectId, ref: 'branches' },
    order_tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ordercategory' }],
    order_parkings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'orderparkings' }],
    pass_list: { type: mongoose.Schema.Types.ObjectId, ref: 'passes' },
    my_parkings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userorderparkings' }],
    my_tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userorderticketcategory' }],
    privilege_tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'privilegeordertickets' }],
    is_deleted: { type: Boolean, default: false },
    super_admin_promocode: { type: Boolean, default: false },
    admin_promocode: { type: Boolean, default: false },
    sponsor_promocode: { type: Boolean, default: false },
    android_device: { type: Boolean, default: false },
    ios_device: { type: Boolean, default: false },
    is_blocked: { type: Boolean, default: false },
    all_access: { type: Boolean, default: false },
    is_mentor: { type: Boolean, default: false },
    is_salesteam: { type: Boolean, default: false },
    is_complimantorycode: { type: Boolean, default: false },
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'pendingnotifications' }],
    privilege_invitelogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'privilegeinvitelogs' }],
    complimantorycode_provided_by: { type: String, trim: true },
    roles: {
        type: String,
        default: 'n-user'
    },
    is_completed: { type: Boolean, default: true },
    gender: {
        type: String,
        default: null
    },
    access: { type: mongoose.Schema.Types.ObjectId, ref: 'accessusers' },
    event: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }],
    allow_change: { type: Boolean, default: true },
    access_ids: { type: Array },
    qrUpdateMinute: { type: Number },
    eventShowCount: { type: Number },
    remark: { type: String },
    gsqrcode: { type: String },
    house_name: { type: String },
    position: { type: String },
    login_activity: [],
    media_house: { type: Object },

    media_press: { type: mongoose.Schema.Types.ObjectId, ref: 'mediapress_ticket' },
}, { timestamps: true, versionKey: false });

// userSchema.pre('save', async function (next) {
//     if (this.roles === 'branchowner') {
//         this.owener_of_garba_class = await this.model('branches').create({});
//     } else {
//         this.owener_of_garba_class = await this.model('garbaclass').create({});
//     }
//     next();
// });

const User = mongoose.model('users', userSchema);

module.exports = User;
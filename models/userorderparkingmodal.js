const mongoose = require('mongoose');
const RANDOMID = require('../utilis/miscellaneous');
const genid = RANDOMID.generate();

console.log({ genid })
const userorderParkingSchema = mongoose.Schema({
    parking_name: { type: String, trim: true },
    location_reference: { type: String, trim: true },
    parking_random_id: { type: String, default: genid },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    ticket_user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'events' },
    allow_change: { type: Boolean, default: true },
    provided_by: { type: String, trim: true },
    provided_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    color_code: { type: String, trim: true },
    vehicle_number: { type: String, trim: true, default: null },
    price: { type: mongoose.Schema.Types.Mixed, trim: true },
    slot: { type: Number, trim: true },
    by_cash: { type: Boolean, default: false },
    reserve_slot: { type: Number, trim: true },
    allot_slot: { type: Number, trim: true },
    allot_reserve_slot: { type: Number, trim: true },
    is_dropped: { type: Boolean, default: false },
    is_expire: { type: Boolean, default: false },
    is_used: { type: Boolean, default: false },
    is_privilege: { type: Boolean, default: false },
    pass_parking: {
        type: Boolean,
    },
    ticket_parking: {
        type: Boolean,
    },
    two_wheeler_parking: {
        type: Boolean,
    },
    car_parking: {
        type: Boolean,
    },
    is_active: {
        type: Boolean, default: false
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'parkings' },
    is_deleted: { type: Boolean, default: false },
    purchased_slot: { type: Number, default: 0 },
    is_valid: { type: Boolean, default: false },
    is_passuser: { type: Boolean, default: false },
    purchased_reseved_slot: { type: Number, default: 0 },
    remaining_slot: { type: Number, default: 0 },
    remaining_reseved_slot: { type: Number, default: 0 },
    is_salesteam: { type: Boolean, default: false },
    gates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gates' }],
    payment_status: { type: String, trim: true },
}, { timestamps: true, versionKey: false });

userorderParkingSchema.set('strictPopulate', false);

module.exports = mongoose.model('userorderparkings', userorderParkingSchema);
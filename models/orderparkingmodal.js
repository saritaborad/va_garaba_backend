const mongoose = require('mongoose');

const orderparkingSchema = mongoose.Schema({
    parking_name: { type: String, trim: true },
    location_reference: { type: String, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    assigned_user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'events' },
    gates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gates' }],
    color_code: { type: String, trim: true },
    provided_by: { type: String, trim: true },
    provided_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    vehicle_number: { type: String, trim: true, default: null },
    price: { type: mongoose.Schema.Types.Mixed, trim: true },
    slot: { type: Number, trim: true },
    qty: { type: Number, trim: true, default: 1 },
    reserve_slot: { type: Number, trim: true },
    is_reserved: { type: Boolean, default: false },
    complimanotry: { type: Boolean, default: false },
    is_dropped: { type: Boolean, default: false },
    allow_change: { type: Boolean, default: true },
    is_privilege: { type: Boolean, default: false },
    is_passuser: { type: Boolean, default: false },
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
    is_used: {
        type: Boolean, default: false
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'parkings' },
    is_deleted: { type: Boolean, default: false },
    payment_status: { type: String, trim: true, default: 'cancel' },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('orderparkings', orderparkingSchema);
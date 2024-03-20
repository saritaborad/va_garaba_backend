const mongoose = require('mongoose');

const parkingSchema = mongoose.Schema({
    parking_name: { type: String, trim: true },
    location_reference: { type: String, trim: true },
    color_code: { type: String, trim: true },
    price: { type: mongoose.Schema.Types.Mixed, trim: true },
    slot: { type: Number, trim: true },
    reserve_slot: { type: Number, default: 0 },
    purchased_slot: { type: Number, default: 0 },
    purchased_reseved_slot: { type: Number, default: 0 },
    remaining_slot: {
        type: Number, default: function () {
            return this.slot - this.reserve_slot;
        },
    },
    remaining_reseved_slot: {
        type: Number, default: function () {
            return this.reserve_slot;
        },
    },
    gates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gates' }],
    is_dropped: { type: Boolean, default: false },
    bookedParking: { type: Object, default: {} },
    is_privilege: { type: Boolean, default: false },
    pass_parking: {
        type: Boolean, default: function () {
            return !this.ticket_parking;
        },
    },
    ticket_parking: {
        type: Boolean, default: function () {
            return !this.pass_parking;
        },
    },
    two_wheeler_parking: {
        type: Boolean, default: function () {
            return !this.car_parking;
        },
    },
    car_parking: {
        type: Boolean, default: function () {
            return !this.two_wheeler_parking;
        },
    },
    is_deleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

// parkingSchema.post('findOneAndUpdate', async function (doc, next) {
//     const update = this.getUpdate();
//     const purchased_slot = update.$inc?.purchased_slot || 0;
//     const purchased_reseved_slot = update.$inc?.purchased_reseved_slot || 0;
//     const reserve_slot = doc.reserve_slot;
//     const remaining_slot = doc.remaining_slot;
//     const remaining_reseved_slot = doc.remaining_reseved_slot;
//     const slot = doc.slot;
//     console.log({ old: doc.purchased_slot, purchased_slot })
//     doc.purchased_slot = doc.purchased_slot + purchased_slot;
//     console.log({ remaining_slot, remaining_reseved_slot })
//     doc.remaining_slot = remaining_slot >= 0 ? slot - reserve_slot - doc.purchased_slot : 0;
//     doc.remaining_reseved_slot = remaining_reseved_slot >= 0 ? reserve_slot - purchased_reseved_slot : 0;

//     console.log({ update, slot, purchased_slot, f: doc.remaining_slot, k: doc.remaining_reseved_slot });
//     try {
//         await doc.save();
//         console.log('Remaining slot updated and document saved:', doc);
//         next();
//     } catch (error) {
//         console.error('Error updating remaining slot:', error);
//         next(error);
//     }
//     next();
// });


module.exports = mongoose.model('parkings', parkingSchema);
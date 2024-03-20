const mongoose = require('mongoose');

let parkingStorageSchema = mongoose.Schema({
    slot: { type: Number, default: 0 },
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
    pass_parking: { type: Boolean, default: false },
    gates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gates' }],
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'events' },
    parking: { type: mongoose.Schema.Types.ObjectId, ref: 'parkings' },
    bookedParking: { type: Object, default: {} },
});


parkingStorageSchema.post('findOneAndUpdate', async function (doc, next) {
    const update = this.getUpdate();
    const reserve_slot = doc.reserve_slot;
    const remaining_slot = doc.remaining_slot;
    const remaining_reseved_slot = doc.remaining_reseved_slot;
    const slot = doc.slot;

    // doc.purchased_slot = doc.purchased_slot + purchased_slot;
    // doc.purchased_slot = doc.purchased_slot;
    // doc.purchased_reseved_slot = doc.purchased_reseved_slot;
    doc.remaining_slot = remaining_slot >= 0 ? slot - reserve_slot - doc.purchased_slot : 0;
    doc.remaining_reseved_slot = remaining_reseved_slot >= 0 ? reserve_slot - doc.purchased_reseved_slot : 0;
    try {
        await doc.save();
        console.log('Remaining slot updated and document saved:', doc);
        next();
    } catch (error) {
        console.error('Error updating remaining slot:', error);
        next(error);
    }
    next();
});


module.exports = mongoose.model('parkingstorages', parkingStorageSchema);
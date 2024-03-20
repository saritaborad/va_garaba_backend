const mongoose = require('mongoose');

const zoneSchema = mongoose.Schema({
    zone_name: { type: String, trim: true },
    color_code: { type: String, trim: true, default: '#F14S24' },
    price: { type: mongoose.Schema.Types.Mixed, trim: true, default: 0 },
    pass_zone: { type: Boolean, default: false },
    ticket_zone: { type: Boolean, default: false },
    play_zone: { type: Boolean, default: false },
    press_zone: { type: Boolean, default: false },
    location_reference: { type: String, trim: true },
    is_deleted: { type: Boolean, default: false },
    is_privilege: { type: Boolean, default: false },
    gates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gates' }],
    checkpoints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' }],
}, { timestamps: true, versionKey: false });



const Zones = mongoose.model('zones', zoneSchema);

module.exports = Zones;
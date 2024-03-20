const mongoose = require('mongoose');

const gateSchema = mongoose.Schema({
    gate_name: { type: String, trim: true },
    location_reference: { type: String, trim: true },
    is_deleted: { type: Boolean, default: false },
    is_privilege: { type: Boolean, default: false },
    entry_gate: { type: Boolean, default: false },
    parking_gate: { type: Boolean, default: false },
    is_main: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

const Gates = mongoose.model('gates', gateSchema);

module.exports = Gates;
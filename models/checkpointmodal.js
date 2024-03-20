const mongoose = require('mongoose');

const checkpointSchema = mongoose.Schema({
    checkpoint_name: { type: String, trim: true },
    location_reference: { type: String, trim: true },
    is_deleted: { type: Boolean, default: false },
    is_privilege: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });



const checkPoints = mongoose.model('checkpoints', checkpointSchema);

module.exports = checkPoints;
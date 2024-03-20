const mongoose = require('mongoose');

const accessUserschema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    zones: [{
        mg_id: { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },
        blocked: { type: Boolean, default: false },
        access: { type: Boolean, default: false }
    }],
    gates: [{
        mg_id: { type: mongoose.Schema.Types.ObjectId, ref: 'gates' },
        blocked: { type: Boolean, default: false },
        access: { type: Boolean, default: false }
    }],
    checkpoints: [{
        mg_id: { type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' },
        blocked: { type: Boolean, default: false },
        access: { type: Boolean, default: false }
    }],
    parkings: [{
        mg_id: { type: mongoose.Schema.Types.ObjectId, ref: 'parking' },
        blocked: { type: Boolean, default: false },
        access: { type: Boolean, default: false }
    }],
    is_deleted: { type: Boolean, default: false },
    provided_by: { type: String, trim: true },
    provided_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },

}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('accessusers', accessUserschema);;
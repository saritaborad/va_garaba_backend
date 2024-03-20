const mongoose = require('mongoose');

const subfolderSchema = mongoose.Schema({
    foldername: { type: String, trim: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'gallery' },
    images: { type: Array, default: [] },
    is_deleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('subfolders', subfolderSchema);
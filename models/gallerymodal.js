const mongoose = require('mongoose');

const gallerySchema = mongoose.Schema({
    foldername: { type: String, trim: true },
    is_subfolder: {
        type: Boolean, default: function () {
            return !!this.subfolder.length;
        }
    },
    subfolder: [{
        type: mongoose.Schema.Types.ObjectId
        , ref: 'subfolders'
    }],
    images: { type: Array, default: [] },
    is_deleted: { type: Boolean, default: false },

}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('gallery', gallerySchema);
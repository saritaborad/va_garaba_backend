const mongoose = require('mongoose');

const sofaSchema = mongoose.Schema({
    sofa_section: { type: String, trim: true },
    sofa_row: { type: String, trim: true },
    main_section: { type: String, trim: true },
    is_expire: { type: Boolean, default: false },
    is_used: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    sofas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'sofas' }],

}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('sofarows', sofaSchema);
const mongoose = require('mongoose');

const prizeCategoriesSchema = mongoose.Schema({
    prize_name: { type: String, trim: true },
    type: { type: String, enum: ['male', 'female', 'couple', ''], default: '', trim: true },
    prize_rank: { type: Number, default: 0 },
    couple_flag: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('prizecategories', prizeCategoriesSchema);


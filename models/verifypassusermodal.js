const mongoose = require('mongoose');

const verifypassUserSchema = mongoose.Schema({
    doc_front: { type: String, trim: true, },
    doc_back: { type: String, trim: true, },
    branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'branches' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('verifypassuser', verifypassUserSchema);
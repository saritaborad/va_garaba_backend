const mongoose = require('mongoose');

const notificationsSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    image: { type: String, trim: true, },
    action: { type: String, trim: true, },
    title: { type: String, trim: true },
    body: { type: String, trim: true },
    date: { type: String, trim: true },
    time: { type: String, trim: true },
    used_for: { type: String, trim: true },
    is_deleted: { type: Boolean, default: false },

}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('notifications', notificationsSchema);
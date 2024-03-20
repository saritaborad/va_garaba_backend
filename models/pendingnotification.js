const mongoose = require('mongoose');

const pendingNotificationsSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    title: { type: String, trim: true },
    body: { type: String, trim: true },
    is_read: { type: Boolean, default: false },
    date: { type: String, trim: true },
    time: { type: String, trim: true },

}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('pendingnotifications', pendingNotificationsSchema);
const mongoose = require('mongoose');

let userTicketSchema = mongoose.Schema({
    name: { type: String, trim: true },
    gender: { type: String, trim: true },
    phone_number: { type: String, trim: true },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'userorderticketcategory' },
    profile_pic: { type: String, },
});

module.exports = mongoose.model('userordertickets', userTicketSchema);
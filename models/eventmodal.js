const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    event_name: { type: String, trim: true },
    event_photo: { type: Object, trim: true },
    portrait_image: { type: Object, trim: true },
    event_band_name: { type: String, trim: true },
    event_location: { type: String, trim: true },
    event_map: { type: String, trim: true },
    event_description: { type: String, trim: true },
    event_time: { type: String, trim: true },
    event_lattitude: { type: String, trim: true },
    event_longitude: { type: String, trim: true },
    event_day: { type: String, trim: true },
    event_date: { type: String, trim: true },
    youtube_link: { type: String, trim: true,default:'' },
    taxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'taxes' }],
    ticketcategorys: [{ type: mongoose.Schema.Types.ObjectId, ref: 'eventcategory' }],
    is_deleted: { type: Boolean, default: false },
    is_expire: { type: Boolean, default: false },
    selling: { type: Boolean, default: false },
    venue_pdf: { type: String },
    term_condition_Pdf: { type: String },

}, { timestamps: true, versionKey: false });


const Events = mongoose.model('events', eventSchema);

module.exports = Events;
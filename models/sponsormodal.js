const mongoose = require('mongoose');

const sponsorSchema = mongoose.Schema({
    profile_pic: { type: String, },
    company_logo: { type: String },
    company_name: { type: String },
    roles: { type: String, default: 'sponsor' },
    name: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    authorized_person: { type: String, trim: true },
    authorized_person_photo: { type: String, trim: true },
    phone_number: { type: Number, trim: true },
    balance_alloted: { type: Number, trim: true },
    is_deleted: { type: Boolean, default: false },
    parking: { type: mongoose.Schema.Types.ObjectId, ref: 'parkings' },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
}, { timestamps: true, versionKey: false });



const Sponsors = mongoose.model('sponsors', sponsorSchema);

module.exports = Sponsors;
const mongoose = require('mongoose');

const garbaclassSchema = mongoose.Schema({
    garba_classname: { type: String, trim: true, required: true },
    garba_class_email: { type: String, lowercase: true, trim: true },
    garba_class_logo: { type: String, default: "defaultProfileImg.png" },
    garba_class_since: { type: String, },
    fcm_token: { type: String },
    garba_class_address: { type: String, },
    garba_class_area: { type: String, },
    instagram_id: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },
    branch_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'branches' }],
    is_deleted: { type: Boolean, default: false },

}, { timestamps: true, versionKey: false });


const garbaClass = mongoose.model('garbaclass', garbaclassSchema);

module.exports = garbaClass;
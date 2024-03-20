const mongoose = require('mongoose');

let branchSchema = mongoose.Schema({
    branch_name: { type: String, },
    profile_pic: { type: String, },
    branch_address: { type: String, },
    branch_mobile_number: { type: String },
    branch_area: { type: String, },
    fcm_token: { type: String },
    main_branch: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "garbaclass" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },
    student_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    approval_request_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
});

module.exports = mongoose.model('branches', branchSchema);
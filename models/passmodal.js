const mongoose = require('mongoose');
const RANDOMID = require('../utilis/miscellaneous');
const allconfig = require('../config/allconfig');

const currentDateTime = new Date();
const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
const currentTime = currentDateTime.toLocaleTimeString('en-US', timeOptions);
const currentDate = currentDateTime.toLocaleDateString('en-US', dateOptions);
const generateid = RANDOMID.generate();

const passSchema = mongoose.Schema({
    pass_name: { type: String, trim: true, default: 'Season Pass' },
    pass_image: { type: String, trim: true, default: allconfig.PASS_IMAGE },
    pass_random_id: { type: String, default: generateid },
    pass_date: { type: String, trim: true, default: currentDate },
    pass_time: { type: String, trim: true, default: '07:00 PM' },
    pass_status: { type: String, trim: true, default: 'Pending' }, //'Used' 'Approved' 
    pass_qty: { type: String, trim: true, default: 1 },
    season_name: { type: String, trim: true, default: 'Navaratri 2023' },
    season_time: { type: String, trim: true, default: '06:00 PM' },
    from_date: { type: String, trim: true, default: '2023-10-15' }, //
    to_date: { type: String, trim: true, default: '2023-10-24' },
    pass_price: { type: mongoose.Schema.Types.Mixed, trim: true, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    assigned_user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    garba_class: { type: mongoose.Schema.Types.ObjectId, ref: 'branches' },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },
    parking: { type: mongoose.Schema.Types.ObjectId, ref: 'userorderparkings' },
    is_dropped: { type: Boolean, default: false },
    is_parking: { type: Boolean, default: false },
    winner_prize: { type: Object, default: {} },
    is_csv: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    complimanotry: { type: Boolean, default: false },
    vehicle_number: { type: String, trim: true, default: null },
    is_privilege: { type: Boolean, default: false },
    is_completed: { type: Boolean, default: true },
    allow_change: { type: Boolean, default: true },
    winner: {
        event: { type: mongoose.Schema.Types.ObjectId, ref: 'events' },
        judge: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        prize_category: { type: mongoose.Schema.Types.ObjectId, ref: 'prizecategories' },
        rank: { type: Number, default: 0 }
    },
    mentor_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'passmentors' }],
    is_valid: { type: Boolean, default: false },
    is_used: { type: Boolean, default: false },
    is_active: { type: Boolean, default: false },
    is_expire: { type: Boolean, default: false },
    special_access: { type: Boolean, default: false },
    special_accesszones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'zones' }],
    special_accessgates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gates' }],
    special_accesscheckpoints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' }],
    special_accessids: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'gates' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'parkings' }
    ],
    access_block: { type: Boolean, default: false },
    access_blockzones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'zones' }],
    access_blockgates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gates' }],
    access_blockcheckpoints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' }],
    access_blockids: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'gates' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'checkpoints' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'zones' },
        { type: mongoose.Schema.Types.ObjectId, ref: 'parkings' }
    ],
    payment_status: { type: String, trim: true, default: 'cancel' },
}, { timestamps: true, versionKey: false });

passSchema.set('strictPopulate', false);


module.exports = mongoose.model('passes', passSchema);

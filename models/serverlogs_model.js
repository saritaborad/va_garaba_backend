const mongoose = require('mongoose');

const serverLogsSchema = mongoose.Schema({
    level: { type: String, trim: true },
    message: { type: String, trim: true },
    req_url: { type: String, trim: true },
    statusCode: { type: Number, trim: true },
    responseTime: { type: Number, trim: true },
    metadata: { type: Object, trim: true },
    timestamp: { type: String, trim: true },
}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('server_logs', serverLogsSchema);
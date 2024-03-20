const { createLogger, format, transports, errorLogger } = require('winston');
const SERVER_LOG_MODAL = require('../models/serverlogs_model');

const myFormat = format.printf(({ level, meta, message, timestamp, metadata, stack }) => {

    SERVER_LOG_MODAL.create({
        level: level,
        req_url: metadata?.meta?.req?.url,
        req_method: metadata?.meta?.req?.method,
        statusCode: metadata?.meta?.res?.statusCode,
        responseTime: metadata?.meta?.responseTime,
        metadata: metadata,
        message: message,
        timestamp: metadata?.timestamp,
    })
    return `${metadata?.timestamp} ${level}:  ${stack || message}`;
});
const allconfig = require('../config/allconfig');

let logger = createLogger({
    transports: [
        new transports.Console(),
        new transports.File({
            level: 'warn',
            filename: 'logsWarnings.log'
        }),
        new transports.File({
            level: 'error',
            filename: 'logsErrors.log'
        }),
        new transports.File({
            level: 'info',
            filename: 'logsInfos.log'
        }),
        new transports.File({
            level: 'debug',
            filename: 'logsDebugs.log'
        }),
    ],
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
        format.json(),
        format.metadata(),
        format.errors({ stack: true }),
        format.prettyPrint(),
        myFormat,
    ),
    tailable: true,
})

let winerrorLogger = createLogger({
    transports: [
        new transports.File({
            filename: 'logsInternalErrors.log'
        })
    ],
    format: format.combine(
        format.json(),
        format.errors({ stack: true }),
        format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
        myFormat

    ),
    tailable: true,
})

module.exports = { logger, winerrorLogger };
const allConfig = require('../config/allconfig');

module.exports = {
    node_port: allConfig.PORT,
    db_url: allConfig.DB_URL,
    secret_private_key: allConfig.SECRET_PRIVATE_KEY,
    sender_email: allConfig.SENDER_EMAIL,
    sender_password: allConfig.SENDER_PASSWORD,
}
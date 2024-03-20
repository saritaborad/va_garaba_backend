const multer = require("multer")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}.${file.mimetype.split("/")[1]}`);
    },
});

const upload = multer(
    {
        // storage,
        limits: {
            fileSize: 50 * 1024 * 1024, // 10MB in bytes
            fieldNameSize: 100, // Maximum field name length (adjust as needed)
            fieldSize: 100 * 1024, // Maximum field size (adjust as needed)
        },
    }
);
// const upload = multer({ storage });

module.exports = upload;
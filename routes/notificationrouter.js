const express = require('express');
const router = express.Router();

const Auth = require('../middleware/userauthentication');
const upload = require('../helper/multerFileUpload');

const controller = require('../controllers/notificationcontroller');

// AGENCY ROUTES
router.post('/create', upload.single('image'), controller.createNotification);
router.post('/update', controller.updateNotification);
router.post('/delete', controller.deleteNotification);

router.post('/send', controller.sendNotification);
router.post('/allpassuser', controller.sendPassuserNotification);
router.post('/alluser', controller.sendUserNotification);
router.get('/all', controller.getAllNotification);

module.exports = router;

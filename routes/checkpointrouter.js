const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const upload = require('../helper/multerFileUpload');

const controller = require('../controllers/checkpointcontroller');

// AGENCY ROUTES
router.post('/create', controller.createCheckpoint);
router.post('/update', controller.updateCheckpoint);
router.post('/delete', controller.deleteCheckpoint);

router.get('/all', controller.getAllCheckpoint);

module.exports = router;

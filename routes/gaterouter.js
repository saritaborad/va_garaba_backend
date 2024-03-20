const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const upload = require('../helper/multerFileUpload');

const controller = require('../controllers/gatecontroller');

// AGENCY ROUTES
router.post('/create', controller.createGate);
router.post('/update', controller.updateGate);
router.post('/delete', controller.deleteGate);

router.get('/all', controller.getAllGates);

module.exports = router;

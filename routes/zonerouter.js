const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const upload = require('../helper/multerFileUpload');

const controller = require('../controllers/zonescontroller');

// AGENCY ROUTES
router.post('/create', controller.createZones);
router.post('/update', controller.updateZones);
router.post('/delete', controller.deleteZones);

router.get('/info/:zone_id', controller.getZone);
router.get('/all', controller.getAllZones);


module.exports = router;

const express = require('express');
const router = express.Router();

const Auth = require('../middleware/userauthentication');
const upload = require('../helper/multerFileUpload');

const controller = require('../controllers/parkingcontroller');

// AGENCY ROUTES
router.post('/create', controller.createParking);
router.post('/update', controller.updateParking);
router.post('/delete', controller.deleteParking);

router.get('/all', controller.getAllParkings);
router.get('/details', controller.parkingInfoAdmin);
router.get('/records', Auth.isUserAdmin('superadmin'), controller.parkingRecords);
router.get('/info/:parking_id', controller.getParking);
router.get('/reminingparkingslot', Auth.isUserAdmin('superadmin'), controller.reminingParkingSLot);
router.get('/statics', controller.parkingStatics);
router.post('/remaining', controller.remainingAllParkings);

module.exports = router;

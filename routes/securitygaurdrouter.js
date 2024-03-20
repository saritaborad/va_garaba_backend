const express = require('express');
const router = express.Router();

const Auth = require('../middleware/userauthentication');
const upload = require('../helper/multerFileUpload');

const controller = require('../controllers/securitygaurdcontroller');

// AGENCY ROUTES
router.post('/create', Auth.isUserAdmin('superadmin'), upload.single('profile_pic'), controller.create);
router.post('/update', Auth.isUserAdmin('superadmin'), upload.single('profile_pic'), controller.update);
router.post('/delete', controller.delete);
router.get('/gate', controller.getAllGate);
router.post('/removeguard', Auth.isUserAdmin('superadmin'), controller.removedGuard);
router.get('/scanlogs', Auth.isUserAdmin('superadmin'), controller.allScanLogs);
router.get('/checkpoint', controller.getAllCheckpoint);
router.get('/parking', controller.getAllParking);
router.get('/zone', controller.getAllZone);
router.post('/scan', Auth.isUserAdmin('securityguard'), controller.scaning); // Auth.isUserAdmin('securityguard'),
router.post('/scantest', controller.scantest);
router.post('/uservalided', Auth.isUserAdmin('securityguard'), controller.gaurdUserValided);

// router.get('/info/:guard_id', controller.getZone);
router.get('/all', controller.getAll);


module.exports = router;

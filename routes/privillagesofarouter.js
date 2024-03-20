const express = require('express');
const router = express.Router();

const Auth = require('../middleware/userauthentication');
const upload = require('../helper/multerFileUpload');

const controller = require('../controllers/privilageseatcontroller');

// AGENCY ROUTES
router.post('/create', Auth.isUserAdmin('superadmina'), controller.arrantSeating);
router.post('/addmember', Auth.isUserAdmin('superadmin'), upload.single('profile_pic'), controller.addmember);
router.post('/seating', Auth.isUserAdmin('superadmin', 'privilegemember'), controller.getSofas);
router.get('/sofainfo', Auth.isUserAdmin('privilegemember'), controller.getSofaDetails);
router.get('/tickets', Auth.isUserAdmin('privilegemember'), controller.invitedTickets);
router.post('/removeseatuser', Auth.isUserAdmin('privilegemember'), controller.removedSeatuser);
router.post('/active', upload.single('profile_pic'), controller.activeTicket);
router.get('/allmember', controller.allPrivilegeMembers);
router.post('/invite', Auth.isUserAdmin('privilegemember'), upload.single('profile_pic'), controller.inviteTosofauser);
// router.post('/delete', controller.deleteGate);

// router.get('/all', controller.getAllGates);

module.exports = router;

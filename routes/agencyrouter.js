const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const upload = require('../helper/multerFileUpload');

const controller = require('../controllers/agencycontroller');

// AGENCY ROUTES
router.post('/create', upload.single('profile_pic'), controller.creatAgency);
router.post('/update', controller.updateAgency);
router.post('/delete', controller.deleteAgency);

router.get('/all', controller.getAllAgency);


module.exports = router;

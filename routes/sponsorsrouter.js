const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const upload = require('../helper/multerFileUpload');

const controller = require('../controllers/sponsorscontroller');

// AGENCY ROUTES
router.post('/create', upload.fields([{ name: 'profile_pic', maxCount: 1 }, { name: 'company_logo', maxCount: 1 }, { name: 'authorized_person_photo', maxCount: 1 }]), controller.createSponsors);
router.post('/update', controller.updateSponsors);
router.post('/delete', controller.deleteSponsors);

router.get('/all', controller.getAllSponsores);

module.exports = router;

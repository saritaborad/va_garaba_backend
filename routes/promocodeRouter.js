const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const upload = require('../helper/multerFileUpload');

const controller = require('../controllers/promocodecontroller');

// AGENCY ROUTES
router.post('/create', controller.createPromocode);
router.post('/update', controller.updatePromocode);
router.post('/delete', controller.deletePromocode);
router.post('/verify', controller.codeVerify);

router.get('/all', controller.getAllPromocode);


module.exports = router;

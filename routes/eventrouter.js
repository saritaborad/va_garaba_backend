const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const upload = require('../helper/multerFileUpload');

const controller = require('../controllers/eventcontroller');

// AGENCY ROUTES
router.post('/create', upload.fields([{ name: 'event_photo', maxCount: 1 }, { name: 'portrait_image', maxCount: 1 }, { name: 'term_condition_Pdf', maxCount: 1 }, { name: 'venue_pdf', maxCount: 1 }]), controller.createEvent);
router.post('/update', upload.fields([{ name: 'event_photo', maxCount: 1 }, { name: 'portrait_image', maxCount: 1 }, { name: 'term_condition_Pdf', maxCount: 1 }, { name: 'venue_pdf', maxCount: 1 }]), controller.updateEvent);
router.post('/delete', controller.deleteEvent);
router.post('/duplicate', controller.duplicateEvent);

router.get('/all', controller.getAllEvents);
router.get('/info/:event_id', controller.getEventInfo);

module.exports = router;

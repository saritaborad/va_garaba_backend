const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const upload = require('../helper/multerFileUpload');

const controller = require('../controllers/ticketcategoryscontroller');

// AGENCY ROUTES
router.post('/create', controller.createTicketCategory);
router.post('/update', controller.updateTicketCategory);
router.post('/delete', controller.deleteTicketCategory);

router.get('/all', controller.getAllCategoryTicket);
router.get('/transferticket', controller.recentTransferTicket);
router.get('/info/:ticket_id', controller.getTicketcategoryInfo);
router.get('/statics', controller.stasticOfTicketCategory);

module.exports = router;

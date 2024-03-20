const express = require('express');
const router = express.Router();
const usersRouter = require('./users.router');
const privillageSofaRouter = require('./privillagesofarouter');
const agencyRouter = require('./agencyrouter');
const garbaclassRouter = require('./garbaclassrouter');
const parkingRouter = require('./parkingrouter');
const checkpointRouter = require('./checkpointrouter');
const gateRouter = require('./gaterouter');
const sponsorRouter = require('./sponsorsrouter');
const zoneRouter = require('./zonerouter');
const eventRouter = require('./eventrouter');
const ticketcategoryRouter = require('./ticketcategoryrouter');
const promocodeRouter = require('./promocodeRouter');
const Auth = require('../middleware/userauthentication');
const notificationRouter = require('./notificationrouter');
const securityGuardRouter = require('./securitygaurdrouter');
const judgeRouter = require('./judgerouter');


router.use('/promocode', Auth.isAuthonticate, promocodeRouter);
router.use('/event', Auth.isAuthonticate, eventRouter);
router.use('/zone', Auth.isAuthonticate, zoneRouter);
router.use('/sponsor', Auth.isAuthonticate, sponsorRouter);
router.use('/garbaclass', Auth.isAuthonticate, garbaclassRouter);
router.use('/checkpoint', Auth.isAuthonticate, checkpointRouter);
router.use('/ticketcategory', Auth.isAuthonticate, ticketcategoryRouter);
router.use('/gate', Auth.isAuthonticate, gateRouter);
router.use('/parking', Auth.isAuthonticate, parkingRouter);
router.use('/user', usersRouter);
router.use('/agency', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), agencyRouter);
router.use('/sofa', Auth.isAuthonticate, privillageSofaRouter);
router.use('/guard', Auth.isAuthonticate, securityGuardRouter);
router.use('/notification', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), notificationRouter);
router.use('/judge', Auth.isAuthonticate,judgeRouter );

module.exports = router;

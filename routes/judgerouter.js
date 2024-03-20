const express = require('express');
const router = express.Router();

const Auth = require('../middleware/userauthentication');
const upload = require('../helper/multerFileUpload');

const controller = require('../controllers/judgecontroller');

// judge 
router.post('/createjudge', Auth.isUserAdmin('superadmin'), upload.single('judge_photo'), controller.addJudge);
router.get('/getalljudge', Auth.isUserAdmin('superadmin'), controller.getAllJudge);
router.get('/info/:judge_id', Auth.isUserAdmin('superadmin', 'admin'), controller.getJudge);
router.post('/update', Auth.isUserAdmin('superadmin', 'admin'), controller.updateJudge);

router.post('/assignevent', Auth.isUserAdmin('superadmin', 'admin'), controller.assignJudgeEvent);
router.post('/unassignevent', Auth.isUserAdmin('superadmin', 'admin'), controller.unassignJudgeEvent);

router.post('/createprizecategories', Auth.isUserAdmin('superadmin', 'admin'), controller.addPrizeCategories);
router.post('/updateprizecategory', Auth.isUserAdmin('superadmin', 'admin'), controller.updatePrizeCategory);
router.post('/deleteprizecategory', Auth.isUserAdmin('superadmin', 'admin'), controller.deletePrizeCategory);
router.get('/getallprizecategories', Auth.isUserAdmin('superadmin', 'admin','judge'), controller.getAllPrizeCategories);
router.get('/getprizecategory/:prize_categroies_id', Auth.isUserAdmin('superadmin', 'admin', "judge"), controller.getPrizeCategory);

router.post('/result', Auth.isUserAdmin('superadmin', 'admin'), controller.judgeResult);
router.post('/passuserresult', Auth.isUserAdmin('judge'), controller.judgeGetPassUser);

router.get('/getjudgeassignevent', Auth.isUserAdmin('judge'), controller.getJudgeEventAssign);
router.post('/updaterank', Auth.isUserAdmin('judge'), controller.updateRank);
router.post('/unassignprize', Auth.isUserAdmin('judge'), controller.JudgePrizeUnAssign);
router.post('/assignprize', Auth.isUserAdmin('judge'), controller.judgePrizeAssign);

//judge retrive pass user data
router.get('/getpassuserphoneno', Auth.isUserAdmin('judge'), controller.getPassUserPhoneNo);
// router.get('/getpassuserqrscan', Auth.isUserAdmin('judge'), controller.getPassUserQRscan);

module.exports = router;    
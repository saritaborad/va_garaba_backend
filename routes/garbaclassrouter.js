const express = require('express');
const router = express.Router();

const Auth = require('../middleware/userauthentication');
const upload = require('../helper/multerFileUpload');

const controller = require('../controllers/garbaclasscontroller');

// AGENCY ROUTES
router.post('/create', Auth.isUserAdmin('superadmin', 'garbaclassowner'), upload.fields([{ name: 'owner_profile_pic', maxCount: 1 }, { name: 'garba_class_logo', maxCount: 1 }]), controller.creatGarbaClass);
router.post('/update', Auth.isUserAdmin('superadmin', 'garbaclassowner'), controller.updateGarbaClass);
router.post('/delete', Auth.isUserAdmin('superadmin', 'garbaclassowner'), controller.deleteGarbaClass);

router.get('/all', controller.getAllGarbaClass);
router.get('/info/:garba_id', controller.getGarbaClass);
router.get('/branch/info/:branch_id', controller.getBranchInfo);
router.post('/branch/branchupdate', upload.single('profile_pic'), controller.updateGarbaBranch);
router.get('/branch/all', controller.getAllBranch);

module.exports = router;

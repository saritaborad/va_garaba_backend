const express = require('express');
const router = express.Router();

const Auth = require('../middleware/userauthentication');
const upload = require('../helper/multerFileUpload');
const FUNCTIONSLIST = require('../helper/functions')

const controller = require('../controllers/users.controller');
router.post('/sendotp', controller.emailPhoneWithotp);
router.post('/verifyotp', controller.otpverify);
router.post('/signup', upload.single('profile_pic'), controller.usersignup);
router.post('/login', controller.userlogin);

// USERS ROUTES
router.post('/update', Auth.isAuthonticate, upload.single('profile_pic'), controller.userupdate);
router.post('/updatepassuser', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin'), controller.updatePassuser);
router.post('/requestforapproval', Auth.isAuthonticate, Auth.isUserAdmin('n-user', 'p-user'), upload.single('profile_pic'), controller.requestForApproval);
router.post('/activenow', Auth.isAuthonticate, Auth.isUserAdmin('n-user', 'p-user'), upload.single('profile_pic'), controller.activeNow);
router.post('/proceedtopay', Auth.isAuthonticate, Auth.isUserAdmin('n-user', 'p-user'), controller.orderCreate);
router.post('/parking/update', Auth.isAuthonticate, Auth.isUserAdmin('n-user', 'p-user'), controller.updateUserOrder);
router.post('/ticket/update', Auth.isAuthonticate, Auth.isUserAdmin('n-user', 'p-user'), upload.single('profile_pic'), controller.updateUserTicketOrder);
router.post('/delete', Auth.isAuthonticate, controller.deleteUser);

router.get('/info', Auth.isAuthonticate, controller.getUserInfo);
router.get('/transactionhistory', Auth.isAuthonticate, controller.transactionHistory);
router.get('/gallary', Auth.isAuthonticate, controller.getgallery);
router.get('/logout/:userid', controller.logout);

//superadmin', 'admin', 'sponsoer'
let adminSideLsit = []
router.post('/complimantorypass', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin',), controller.complimentroypass);
router.post('/allorder', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin', 'sponsor'), controller.complimentroypass);
router.post('/createcomplimantorycode', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin', 'sponsor'), controller.createComplimantoryCode);
router.post('/bookmyshow', Auth.isAuthonticate, Auth.isUserAdmin('salesteam'), controller.bookMyshowSalesTeam);
router.get('/allcomplimantorycode', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin', 'sponsor'), controller.allComplimantoryCode);

router.post('/addaccessadmin', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.addAdminAccessIds);
router.post('/updateaccessadmin', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.updateAdminAccessIds);
router.get('/alladmin', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.allAdmin);
router.get('/allusers', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.allUsers);
router.post('/userdetails', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin', 'salesteam'), controller.getUserDetails);
router.post('/updatesposnobal', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin'), controller.increDescSponsorBalance);
router.get('/alltaxes', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin'), controller.allTaxes);
router.get('/userlist', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin'), controller.allUsersList);
router.get('/orderlist', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin'), controller.orderList);
router.post('/userblockaccess', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin'), controller.userBlockAccess);
//branchowner
router.post('/approverequest', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin', 'garbaclassowner', 'branchowner'), controller.approveRequest);
router.get('/studentlist/:user_id', Auth.isAuthonticate, controller.getClassStudent);

router.post('/pendingpaymentplayer', Auth.isAuthonticate, Auth.isUserAdmin('garbaclassowner', 'branchowner'), controller.pendingPaymentForPassPlayer);
router.get('/tappendingpass', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'garbaclassowner', 'branchowner'), controller.tapTosendpendingPaymentForPassPlayer);

//promo code Assign By Administrator
router.post('/viewcomplimantorycode', Auth.isAuthonticate, controller.viewcomplimantorycode);
router.post('/redeemcomplimantorycode', Auth.isAuthonticate, Auth.isUserAdmin('n-user', 'p-user'), controller.redeemcomplimantorycode);
router.post('/complimentroypass', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin'), controller.complimentroypass);
// router.post('/getcomplimanotrycode', Auth.isAuthonticate, controller.getComplimanotryCode);

//superadmin',
router.post('/uploadimages', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), upload.array('images'), controller.addGallary);
// router.post('/grantaccess', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.accessProvideToUser);
router.post('/specialaccess', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin'), controller.speacialAccessInUserTicket);
router.post('/accessblock', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin'), controller.blockInUserTicket);
router.get('/creditbedit', Auth.isAuthonticate, Auth.isUserAdmin('sponsor'), controller.creditDebitHistory);

router.post('/isexist', Auth.isAuthonticate, controller.useExist);
router.post('/billdesk', controller.callbildesk);
// ------ BBBB ------ S ---
router.post('/orderupdate', controller.orderUpdate);
router.post('/orderdetails', controller.orderDetails);
// ------ BBBB ------- E --
router.get('/showqrcode', Auth.isAuthonticate, controller.showQrCode);
router.get('/allprivilege', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.allPrivilege);
router.get('/allpass', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.allPasses);
router.post('/addmentorinpass', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), upload.single('profile_pic'), controller.addmentorInPass);
router.post('/addsalesteam', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), upload.single('profile_pic'), controller.addSalesTeam);
router.post('/activegroundstaff', Auth.isAuthonticate, Auth.isUserAdmin('groundstaff'), upload.single('profile_pic'), controller.activeGroundStaffQrcode);
router.post('/activemediapress', Auth.isAuthonticate, Auth.isUserAdmin('mediapress'), upload.single('profile_pic'), controller.activeMediaPress);
router.post('/updategroundstaff', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin'), controller.updateGroundStaff);
router.get('/gsqr', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.groundStaffQrcode);
router.get('/allsalesteam', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.allSalesTeam);
router.get('/allmediapress', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.allMediaPress);
router.get('/allgroundstaff', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.allGroundStaff);

router.get('/errorlogs', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.errorServerLogs);
router.get('/infologs', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.infoServerLogs);
router.get('/debugologs', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.debugServerLogs);
router.get('/serverlogs', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.serverLogs);

//import CSV fro brnch
router.post('/importcsv', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'garbaclassowner', 'branchowner'), FUNCTIONSLIST.multerUpload.single('csv'), controller.importCsvForPassuser);
router.post('/importmediapress', Auth.isAuthonticate, Auth.isUserAdmin('superadmin', 'admin'), FUNCTIONSLIST.multerUpload.single('csv'), controller.importMediaPress);
router.post('/addparking', Auth.isAuthonticate, Auth.isUserAdmin('p-user'), controller.addParkingPassUser);
router.post('/addparkingplayer', Auth.isAuthonticate, Auth.isUserAdmin('superadmin'), controller.addParkingActivePassUserbyAdmin);

router.post('/updatepass', Auth.isAuthonticate, Auth.isUserAdmin('p-user'), upload.single('profile_pic'), controller.updatePassUserData);
router.post('/uploaddoc', Auth.isAuthonticate, upload.fields([{ name: 'doc_front', maxCount: 1 }, { name: 'doc_back', maxCount: 1 }]), controller.uploadcoforpassuser);

router.post('/read', Auth.isAuthonticate, controller.readNotification);
router.get('/clear', Auth.isUserAdmin('dev'), controller.clearDb);

module.exports = router;

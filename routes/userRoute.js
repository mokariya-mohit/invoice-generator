const express = require("express");
const router = express.Router();
const { registerUser,userlogin,updateuser,deleteuser,forgotpassword,verifyOtp,resetPassword,changePassword,getalluser,getuserbyid} = require("../controllers/userController");
const checkRole = require('../middleware/authMiddleware')

router.post('/registerUser', registerUser);
router.post('/userlogin', userlogin);
router.put('/updateuser/:id',checkRole(['user']),updateuser);
router.delete('/deleteuser/:id',checkRole(['user']),deleteuser);
router.post('/forgot-password', forgotpassword);
router.post('/verifyOtp', verifyOtp);
router.post('/resetPassword', resetPassword);
router.post('/changePassword',checkRole(['user']), changePassword);
router.get('/getalluser', getalluser);
router.get('/getuserbyid/:id',checkRole(['user']), getuserbyid);


module.exports = router
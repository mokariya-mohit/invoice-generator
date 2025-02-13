const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { registerBusiness, loginBusiness, getBusiness, getBusinessByID, updateBusiness, deleteBusiness, changePassword, forgotPassword, verifyOtp, resetPassword } = require('../controllers/businessController');
const checkRole = require('../middleware/authMiddleware');

router.post('/registerBusiness', upload.single('image'), registerBusiness);
router.post('/loginBusiness', loginBusiness);

router.get('/getBusiness', checkRole(['business']), getBusiness);
router.get('/getBusinessByID/:id', getBusinessByID);
router.put('/updateBusiness/:id', upload.single('image'), updateBusiness);
router.delete('/deleteBusiness/:id', checkRole(['business']), deleteBusiness);
router.post('/change-password', checkRole(['business']), changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp/:id', verifyOtp);
router.post('/reset-password/:id', resetPassword);

module.exports = router;
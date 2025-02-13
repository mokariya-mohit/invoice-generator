const express = require('express');
const { createPayment, capturePayment, getPaymentDetails, webhook } = require('../controllers/paymentController');

const router = express.Router();

// router.post('/create-payment', createPayment); 
router.post('/capture-payment', capturePayment); 
router.get('/payment/:paymentId', getPaymentDetails);

module.exports = router;

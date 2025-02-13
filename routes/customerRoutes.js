const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const customerController = require('../controllers/customerController');
const checkRole = require('../middleware/authMiddleware');

// Routes for customer operations
router.post('/createCustomer',checkRole(['user']), customerController.createCustomer); 
router.post('/Customercsv',checkRole(['user']), upload.single('file'), customerController.Customercsv); 
router.get('/viewCustomers',checkRole(['user']), customerController.getAllCustomers); 
router.get('/viewCustomers/:id',checkRole(['user']), customerController.getCustomerById);
router.put('/updateCustomer',checkRole(['user']), customerController.updateCustomer);
router.delete('/deleteCustomer',checkRole(['user']), customerController.deleteCustomer); 

module.exports = router;

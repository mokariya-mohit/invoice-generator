const express = require('express');
const router = express.Router();
const { createInvoice, getAllInvoices, getInvoiceById, updateInvoice, deleteInvoice, bulkUploadInvoices } = require('../controllers/invoiceController');
const checkRole = require('../middleware/authMiddleware');


const multer = require('multer');

// Multer in-memory storage setup
const storage = multer.memoryStorage();
const upload = multer({ storage });



// Route to create a new invoice
router.post('/create', checkRole(['user']), upload.single('image'), createInvoice);
router.get('/viewAll', checkRole(['user']), getAllInvoices);
router.get('/ViewById/:id', checkRole(['user']), getInvoiceById);
router.put('/updateById/:id', checkRole(['user']), upload.single('image'), updateInvoice);
router.delete('/deleteById/:id', checkRole(['user']), deleteInvoice);
router.post('/bulkupload', checkRole(['user']), upload.single('file'), bulkUploadInvoices);

module.exports = router;

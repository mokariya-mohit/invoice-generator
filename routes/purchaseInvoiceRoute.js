const express = require('express');
const router = express.Router();
const purchaseinvoiceController = require('../controllers/purchaseInvoiceController');
const checkRole = require('../middleware/authMiddleware');
const upload = require('../middleware/multerConfig');

// Route to import purchase invoices from CSV
router.post('/purchaseinvoices/import', checkRole(['user']), upload.single('file'), purchaseinvoiceController.importPurchaseInvoicesFromCSV);
router.post('/creatpurchaseinvoice', checkRole(['user']), purchaseinvoiceController.createPurchaseinvoice);
router.get('/getallpurchaseinvoice', checkRole(['user']), purchaseinvoiceController.getAllPurchaseinvoices);
router.get('/getsinglepurchaseinvoice/:id', checkRole(['user']), purchaseinvoiceController.getPurchaseinvoiceById);
router.put('/updatepurchaseinvoice/:id', checkRole(['user']), purchaseinvoiceController.updatePurchaseInvoice);
router.delete('/deletepurchaseinvoice/:id', checkRole(['user']), purchaseinvoiceController.deletePurchaseinvoice);

module.exports = router;
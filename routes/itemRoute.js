const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const multer = require('multer');

// Multer in-memory storage setup
const storage = multer.memoryStorage();
const upload = multer({ storage });
const checkRole = require('../middleware/authMiddleware');


router.post('/creatitem', checkRole(['user']), itemController.createItem);

router.get('/getallitem', checkRole(['user']), itemController.getAllItems);

router.get('/getitembyitemid/:id', checkRole(['user']), itemController.getItemsByUserId);

router.put('/updateitem/:id', checkRole(['user']), itemController.updateItem);

router.delete('/deletitem/:id', checkRole(['user']), itemController.deleteItem);

router.get('/verifyqr/:qrCodeNumber', checkRole(['user']), itemController.verifyQrCode);

router.post('/bulkupload', checkRole(['user']), upload.single('file'), itemController.bulkUploadItems);


module.exports = router;
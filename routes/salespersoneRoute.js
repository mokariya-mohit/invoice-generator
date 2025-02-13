const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const salespersoneController = require('../controllers/salespersoneController');
const checkRole = require('../middleware/authMiddleware')

router.post('/creatsalespersone',checkRole(['user']), salespersoneController.createSalespersone);
router.post('/salespersonecsv',checkRole(['user']),  upload.single('file'), salespersoneController.salespersonecsv);

router.get('/getallsalespersone',checkRole(['user']),  salespersoneController.getAllSalespersones);
router.get('/getsalespersonebyid/:id',checkRole(['user']),  salespersoneController.getSalespersoneById);

module.exports = router;
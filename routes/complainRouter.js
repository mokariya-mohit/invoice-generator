const express = require('express');
const router = express.Router();
const userComplainController = require('../controllers/complainController');
const checkRole = require('../middleware/authMiddleware');

router.post('/creatusercomplain',checkRole(['user']), userComplainController.createUserComplain);

router.get('/getallcomplain',checkRole(['user']), userComplainController.getAllUserComplains);

router.get('/getsinglecomplain/:id',checkRole(['user']), userComplainController.getUserComplainById);

router.put('/updatecomplain/:id',checkRole(['user']), userComplainController.updateUserComplainById);

module.exports = router;
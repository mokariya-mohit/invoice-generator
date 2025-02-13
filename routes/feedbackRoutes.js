const express = require('express');
const { createFeedback, getAllFeedback } = require('../controllers/feedbackController');

const router = express.Router();

router.post('/feedback', createFeedback);

router.get('/feedback', getAllFeedback);

module.exports = router;

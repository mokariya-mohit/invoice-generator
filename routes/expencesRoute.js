const express = require('express');
const router = express.Router();
const checkRole = require('../middleware/authMiddleware');
const upload = require('../middleware/multerConfig');
const { createExpense,getAllExpenses,getExpenseById,updateExpense,deleteExpense,addBankStatementExpenses,addexpenceimage} = require('../controllers/expensesController');



router.post('/expenses', checkRole(['user']), upload.single('file'), createExpense);

router.get('/expenses',checkRole(['user']),getAllExpenses);
router.get('/expenses/:id',checkRole(['user']),getExpenseById);
router.put('/expenses/:id',checkRole(['user']),upload.single('receiptImage'),updateExpense);
router.delete('/expenses/:id',checkRole(['user']),deleteExpense);
// router.post('/addexpenceimage', checkRole(['user']), upload.single('recipeimage'), addexpenceimage);
router.post('/addexpenceimage', checkRole(['user']), upload.single('receiptImage'), addexpenceimage);
router.put('/addexpenceimage/:id', checkRole(['user']), upload.single('receiptImage'), addexpenceimage);

module.exports = router
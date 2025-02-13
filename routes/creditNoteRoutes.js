const express = require('express');
const router = express.Router();
const creditNoteController = require('../controllers/creditNoteController');
const checkRole = require('../middleware/authMiddleware');
const upload = require('../middleware/multerConfig'); 



router.post('/creditnotes/import', checkRole(['user']), upload.single('file'), creditNoteController.importCreditNotesFromCSV);
router.post('/create',  checkRole(['user']), creditNoteController.createCreditNote);
router.get('/viewAll',  checkRole(['user']), creditNoteController.getAllCreditNotes);
router.get('/:id',  checkRole(['user']), creditNoteController.getCreditNoteById);
router.get('/:id',  checkRole(['user']), creditNoteController.getCreditNoteById);
router.delete('/:id',  checkRole(['user']), creditNoteController.deleteCreditNote);


module.exports = router;

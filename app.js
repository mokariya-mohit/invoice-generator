const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const path = require('path');

dotenv.config();

const userRoute = require('./routes/userRoute');
const businessRoute = require('./routes/businessRoute');
const itemRoute = require('./routes/itemRoute');
const customerRoute = require('./routes/customerRoutes');
const expensesRoute =require('./routes/expencesRoute');
const invoiceRoute = require('./routes/invoiceRoute');
const salespersoneRouter = require('./routes/salespersoneRoute')
const creditNotes = require('./routes/creditNoteRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
// const uploadRouter = require('./routes/uploadRouter');
const feedbackRoutes = require('./routes/feedbackRoutes');
const purchaseInvoice = require('./routes/purchaseInvoiceRoute');
const usercomplain = require('./routes/complainRouter');

const connectDB = require('./config/db'); 

require('./services/cronJob');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); 

// Connect to MongoDB
connectDB(); 

app.use('/invoices', express.static(path.join(__dirname, 'invoices')));


// Routes
app.use('/api/user', userRoute);
app.use('/api/business', businessRoute); 
app.use('/api/item',itemRoute)
app.use('/api/customer', customerRoute);
app.use('/api/expenses',expensesRoute)
app.use('/api/invoice', invoiceRoute);
app.use('/api/salespersons', salespersoneRouter);
app.use('/api/creditNotes', creditNotes);
app.use('/api/payments', paymentRoutes);
// app.use('/api/expenses/upload', uploadRouter);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/purchaseInvoice', purchaseInvoice);
app.use('/api/usercomplain', usercomplain);


// Start the server
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    return res.send('Welcome to the Invoice App API');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

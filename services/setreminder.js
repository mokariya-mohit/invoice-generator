const cron = require('node-cron');
const Invoice = require('../models/invoiceModel');
const Payment = require('../models/paymentModel');
const nodemailer = require('nodemailer');

const sendReminder = async (invoice) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: invoice.customerEmail, // Ensure this field contains the email address
            subject: 'Payment Reminder',
            text: `Dear ${invoice.customerName}, 
            
Please pay your bill with Invoice Number: ${invoice.invoiceNumber} by the due date: ${invoice.dueDate.toDateString()}.

Thank you!`,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Error sending reminder for invoice ${invoice.invoiceNumber}:`, error.message);
    }
};

const sendRemindersForDueInvoices = async () => {
    try {
        const today = new Date();
        const twoDaysAhead = new Date(today);
        twoDaysAhead.setDate(today.getDate() + 2);

        // Find invoices due in 2 days
        const invoices = await Invoice.find({
            dueDate: {
                $gte: twoDaysAhead.setHours(0, 0, 0, 0),
                $lte: twoDaysAhead.setHours(23, 59, 59, 999),
            },
        });


        for (const invoice of invoices) {
            // Check if there is a pending payment for the invoice
            const payment = await Payment.findOne({
                invoiceId: invoice._id,
                status: 'pending',
            });

            if (payment) {
                await sendReminder(invoice);
            }
        }
    } catch (error) {
        console.error('Error sending reminders:', error.message);
    }
};

// Schedule the cron job to run daily at 8 AM
cron.schedule('0 0 * * *', () => {
    console.log('Cron job started: Checking for recurring invoices...');
    sendRemindersForDueInvoices();
});

module.exports = { sendRemindersForDueInvoices };

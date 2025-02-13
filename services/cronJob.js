require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Invoice = require('../models/invoiceModel');
const Payment = require('../models/paymentModel')  
const Customer = require('../models/customerModel')  

const generateRecurringInvoices = async () => {
    try {
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        const invoices = await Invoice.find({
            recurring: true,
            nextInvoiceDate: { $exists: true, $ne: null, $lte: today },
        });


        for (const invoice of invoices) {
            const newDueDate = new Date(invoice.nextInvoiceDate);
            newDueDate.setDate(newDueDate.getDate() + 30);

            const newInvoice = new Invoice({
                customer: invoice.customer,
                customerName: invoice.customerName,
                invoiceDate: invoice.nextInvoiceDate,
                dueDate: newDueDate,
                terms: invoice.terms,
                salesperson: invoice.salesperson,
                salespersonName: invoice.salespersonName,
                items: invoice.items,
                subtotal: invoice.subtotal, 
                total: invoice.total,
                createdBy: invoice.createdBy,
                recurring: true,
                templateId: invoice.templateId,
                font: invoice.font,
                color: invoice.color,
                userId: invoice.userId,
                nextInvoiceDate: new Date(newDueDate.setDate(newDueDate.getDate() + 30)),
            });

            await newInvoice.save();

            invoice.nextInvoiceDate = null;
            await invoice.save();

        }
    } catch (error) {
        console.error('Error generating recurring invoices:', error.message);
    }
};

// Schedule the recurring invoice cron job to run daily at midnight (server time)
cron.schedule('0 0 * * *', () => {
    console.log('Cron job started: Checking for recurring invoices...');
    generateRecurringInvoices();
});

module.exports = { generateRecurringInvoices };

const mongoose = require('mongoose');
const Invoice = require('../models/invoiceModel');
const Payment = require('../models/paymentModel');
const { razorpay } = require('../services/paypalClient');










exports.capturePayment = async (req, res) => {
    const { orderId } = req.body;

    // Check if orderId is provided
    if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required' });
    }

    try {

        const order = await razorpay.orders.fetch(orderId);        
        if (!order || order.status !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed yet or order does not exist' });
        }

       
        const payment = await Payment.findOneAndUpdate(
            { paymentId: orderId },
            { status: 'paid' },
            { new: true }
        );

        
        const a = await Payment.findOne({ paymentId: orderId });

        
        
        // Find the associated invoice and update its status to 'paid'
        const invoice = await Invoice.findById(payment.invoiceId);
        if (invoice) {
            invoice.status = 'paid';
            await invoice.save();
        }

        res.status(200).json({
            message: 'Payment captured successfully',
        });

    } catch (error) {
        console.error('Error capturing payment:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};



// exports.capturePayment = async (req, res) => {
//     const { orderId } = req.body;

//     // Check if orderId is provided
//     if (!orderId) {
//         return res.status(400).json({ message: 'Order ID is required' });
//     }

//     try {
//         // Fetch the order details from Razorpay
//         const order = await razorpay.orders.fetch(orderId);
//         if (!order) {
//             return res.status(404).json({ message: 'Order not found in Razorpay' });
//         }

//         // Ensure the order is paid
//         if (order.status !== 'paid') {
//             return res.status(400).json({ message: 'Payment not completed yet' });
//         }

//         // Find the Payment record in your database
//         const payment = await Payment.findOne({ paymentId: orderId });
//         if (!payment) {
//             return res.status(404).json({ message: 'Payment record not found' });
//         }

//         // Update payment status to 'paid'
//         payment.status = 'paid';
//         await payment.save();

//         // Update associated Invoice status to 'paid'
//         const invoice = await Invoice.findById(payment.invoiceId);
//         if (invoice) {
//             invoice.status = 'paid';
//             await invoice.save();
//         }

//         res.status(200).json({
//             message: 'Payment captured successfully',
//             paymentDetails: payment,
//         });

//     } catch (error) {
//         console.error('Error capturing payment:', error);
//         res.status(500).json({ message: 'Internal Server Error', error: error.message });
//     }
// };


// Get Payment Details
exports.getPaymentDetails = async (req, res) => {
    const { paymentId } = req.params;

    try {
        if (!paymentId || !paymentId.startsWith('pay_')) {
            return res.status(400).json({ message: 'Invalid paymentId format' });
        }

        const paymentDetails = await razorpay.payments.fetch(paymentId);
        

        res.status(200).json({
            message: 'Payment details fetched successfully',
            paymentDetails,
        });
    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




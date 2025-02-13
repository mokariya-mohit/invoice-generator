const Invoice = require('../models/invoiceModel');
const Customer = require('../models/customerModel');
const Item = require('../models/itemModel');
const User = require('../models/userModel');
const Salesperson = require('../models/salespersoneModel');
const generatePDF = require('../services/generatePDF');
const sendEmail = require('../services/sendEmail');
const sendWhatsApp = require('../services/sendWhatsApp');
const cloudinary = require('../config/cloudinaryConfig');
const mongoose = require('mongoose');
const Payment = require('../models/paymentModel');
const { razorpay } = require('../services/paypalClient');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const csvParser = require('csv-parser');


// const createInvoice = async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//         const userId = req.business.userId;
//         const {
//             customer,
//             salesperson,
//             invoiceDate,
//             dueDate,
//             terms,
//             createdBy,
//             recurring,
//             nextInvoiceDate,
//             color,
//             font,
//         } = req.body;

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         if (recurring && !nextInvoiceDate) {
//             return res.status(400).json({
//                 message: 'nextInvoiceDate is required for recurring invoices',
//             });
//         }

//         let items = req.body.items;
//         if (typeof items === 'string') {
//             try {
//                 items = JSON.parse(items);
//             } catch (err) {
//                 return res.status(400).json({ message: 'Invalid items format' });
//             }
//         }

//         if (!Array.isArray(items) || items.length === 0) {
//             return res.status(400).json({ message: 'Invoice must have at least one item' });
//         }

//         const customerExists = await Customer.findById(customer).session(session);
//         if (!customerExists) {
//             return res.status(404).json({ message: 'Customer not found' });
//         }
//         const customerName = `${customerExists.firstName} ${customerExists.lastName}`;
//         const customerMobile = customerExists.phoneNumber;
//         const customerEmail = customerExists.email;

//         const salespersonExists = await Salesperson.findById(salesperson).session(session);
//         if (!salespersonExists) {
//             return res.status(404).json({ message: 'Salesperson not found' });
//         }
//         const salespersonName = salespersonExists.name;

//         let subtotal = 0;
//         let total = 0;

//         const processedItems = await Promise.all(
//             items.map(async (itemData) => {
//                 const itemDetails = await Item.findById(itemData.item).session(session);

//                 if (!itemDetails) {
//                     throw new Error(`Item with ID ${itemData.item} not found`);
//                 }

//                 const quantity = Number(itemData.quantity) || 1;
//                 if (itemDetails.stock < quantity) {
//                     throw new Error(`Not enough stock for item: ${itemDetails.name}`);
//                 }

//                 const price = Number(itemData.price) || 0;
//                 const taxRate = itemDetails.defaultTaxRates || 0;
//                 const tax = (price * quantity * taxRate) / 100;
//                 const totalItemCost = (price * quantity) + tax;

//                 subtotal += quantity * price;
//                 total += totalItemCost;

//                 itemDetails.stock -= quantity;
//                 await itemDetails.save({ session, validateBeforeSave: false }); 

//                 return {
//                     item: itemData.item,
//                     name: itemDetails.name,
//                     description: itemDetails.description,
//                     quantity,
//                     price,
//                     tax,
//                     total: totalItemCost,
//                 };
//             })
//         );

//         const freightCharges = Number(req.body.freightCharges) || 0;
//         const freightTax = (freightCharges * req.body.freightTax) / 100;
//         const freightTotal = freightTax + freightCharges;
//         total += freightTotal;
//         const templateId = Number(req.body.templateId);

//         const invoice = new Invoice({
//             userId,
//             customer,
//             customerName,
//             templateId,
//             invoiceDate,
//             dueDate,
//             terms,
//             salesperson,
//             salespersonName,
//             items: processedItems,
//             subtotal,
//             total,
//             freightCharges,
//             freightTax,
//             freightTotal,
//             color,
//             font,
//             createdBy,
//             image: req.file ? req.file.path : null,
//             recurring,
//             nextInvoiceDate: recurring ? new Date(nextInvoiceDate) : null,
//         });

//         await invoice.save({ session });

//         await Promise.all(
//             items.map(async (itemData) => {
//                 const itemDetails = await Item.findById(itemData.item).session(session);
//                 if (!itemDetails) {
//                     throw new Error(`Item with ID ${itemData.item} not found`);
//                 }

//                 await Item.findByIdAndUpdate(itemData.item, {
//                     $push: {
//                         invoiceHistory: {
//                             invoiceId: invoice._id,
//                             customer,
//                             customerName,
//                             invoiceNumber: invoice.invoiceNumber,
//                             invoiceDate,
//                             dueDate,
//                             recurring,
//                             nextInvoiceDate,
//                             salesperson,
//                             salespersonName,
//                             subtotal,
//                             freightCharges: req.body.freightCharges || 0,
//                             freightTax: req.body.freightTax || 0,
//                             freightTotal: req.body.freightCharges + req.body.freightTax || 0,
//                             total,
//                             items: [{
//                                 item: itemData.item,
//                                 name: itemDetails.name,
//                                 quantity: itemData.quantity,
//                                 description: itemDetails.description,
//                                 price: itemData.price,
//                                 tax: (itemData.price * itemData.quantity * itemDetails.defaultTaxRates) / 100,
//                                 total: (itemData.price * itemData.quantity) + ((itemData.price * itemData.quantity * itemDetails.defaultTaxRates) / 100),
//                             }],
//                         }
//                     }
//                 }, { session });
//             })
//         );

//         await session.commitTransaction();
//         session.endSession();

//         const paymentLink = await createPayment(invoice._id);

//         const pdfPath = await generatePDF(invoice, templateId, customerMobile, customerEmail, paymentLink);

//         const subject = `Your Invoice from [Swiftrut Technology]`;
//         const text = `Dear ${customerExists.firstName},\n\nThank you for your business,\n[Swiftrut Technology]`;
//         await sendEmail(customerExists.email, subject, text, pdfPath);

//         res.status(201).json({
//             message: 'Invoice created successfully',
//             invoice,
//         });
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();

//         console.error('Error creating invoice:', error);
//         res.status(500).json({
//             message: 'Failed to create invoice',
//             error: error.message || error,
//         });
//     }
// };



const createInvoice = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.business.userId;
        const {
            customer,
            salesperson,
            invoiceDate,
            dueDate,
            terms,
            createdBy,
            recurring,
            nextInvoiceDate,
            color,
            font,
        } = req.body;

        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new Error("User not found.");
        }

        if (recurring && !nextInvoiceDate) {
            throw new Error("nextInvoiceDate is required for recurring invoices.");
        }

        let items = req.body.items;
        if (typeof items === 'string') {
            items = JSON.parse(items);
        }

        if (!Array.isArray(items) || items.length === 0) {
            throw new Error("Invoice must have at least one item.");
        }

        const [customerExists, salespersonExists] = await Promise.all([
            Customer.findById(customer).session(session),
            Salesperson.findById(salesperson).session(session),
        ]);

        if (!customerExists) {
            throw new Error("Customer not found.");
        }

        if (!salespersonExists) {
            throw new Error("Salesperson not found.");
        }

        const customerName = `${customerExists.firstName} ${customerExists.lastName}`;
        const salespersonName = salespersonExists.name;

        let subtotal = 0;
        let total = 0;

        const processedItems = await Promise.all(
            items.map(async (itemData) => {
                const itemDetails = await Item.findById(itemData.item).session(session);

                if (!itemDetails) {
                    throw new Error(`Item with ID ${itemData.item} not found.`);
                }

                const quantity = Number(itemData.quantity) || 1;
                if (itemDetails.stock < quantity) {
                    throw new Error(`Not enough stock for item: ${itemDetails.name}`);
                }


                const price = Number(itemData.price) || 0;
                const taxRate = itemDetails.defaultTaxRates || 0;
                const tax = (price * quantity * taxRate) / 100;
                const totalItemCost = (price * quantity) + tax;


                subtotal += quantity * price;
                total += totalItemCost;

                itemDetails.stock -= quantity;
                await itemDetails.save({ session, validateBeforeSave: false });

                return {
                    item: itemData.item,
                    name: itemDetails.name,
                    description: itemDetails.description,
                    quantity,
                    price,
                    taxRate: itemDetails.defaultTaxRates,
                    tax,
                    total: totalItemCost,
                };
            })
        );

        const freightCharges = Number(req.body.freightCharges) || 0;
        const freightTax = (freightCharges * req.body.freightTax) / 100;
        const freightTotal = freightTax + freightCharges;
        total += freightTotal;
        const templateId = Number(req.body.templateId);



        const invoice = new Invoice({
            userId,
            customer,
            customerName,
            templateId,
            invoiceDate,
            dueDate,
            terms,
            salesperson,
            salespersonName,
            items: processedItems,
            subtotal,
            total,
            freightCharges,
            freightTax,
            freightTotal,
            color,
            font,
            createdBy,
            image: req.file ? req.file.path : null,
            recurring,
            nextInvoiceDate: recurring ? new Date(nextInvoiceDate) : null,
        });
        

        await invoice.save({ session });

       

        await Promise.all(
            items.map(async (itemData) => {
                const itemDetails = await Item.findById(itemData.item).session(session);
                if (!itemDetails) {
                    throw new Error(`Item with ID ${itemData.item} not found for invoice history.`);
                }
        
                await Item.findByIdAndUpdate(
                    itemData.item,
                    {
                        $push: {
                            invoiceHistory: {
                                invoiceId: invoice._id,
                                customer,
                                customerName,
                                invoiceNumber: invoice.invoiceNumber,
                                invoiceDate,
                                dueDate,
                                recurring,
                                nextInvoiceDate,
                                salesperson,
                                salespersonName,
                                items: [
                                    {
                                        item: itemData.item,
                                        name: itemDetails.name,
                                        description: itemDetails.description,
                                        quantity: itemData.quantity,
                                        price: itemData.price,
                                        tax: itemData.tax,
                                        total: itemData.total,
                                    },
                                ],
                                subtotal,
                                freightCharges: req.body.freightCharges || 0,
                                freightTax: req.body.freightTax || 0,
                                freightTotal,
                                total,
                            },
                        },
                    },
                    { session }
                );
            })
        );
        

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: 'Invoice created successfully',
            invoice,
        });

        const paymentLink = await createPayment(invoice._id);

        const pdfPath = await generatePDF(invoice, templateId, customerExists.phoneNumber, customerExists.email, paymentLink);

        const subject = `Your Invoice from [Swiftrut Technology]`;
        const text = `Dear ${customerExists.firstName},\n\nThank you for your business,\n[Swiftrut Technology]`;
        await sendEmail(customerExists.email, subject, text, pdfPath);

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Error creating invoice:", error);
        res.status(500).json({
            message: "Failed to create invoice",
            error: error.message || error,
        });
    }
};







const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find();
        res.status(200).json({
            message: 'Invoices fetched successfully',
            invoices,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Failed to fetch invoices',
            error: error.message,
        });
    }
};


// Get Invoice by ID Controller
const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findById(id);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(200).json({
            message: 'Invoice fetched successfully',
            invoice,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Failed to fetch invoice',
            error: error.message,
        });
    }
};


const updateInvoice = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const userId = req.business.userId;
        const invoiceId = req.params.id;
        const {
            customer,
            salesperson,
            invoiceDate,
            dueDate,
            terms,
            recurring,
            nextInvoiceDate,
            color,
            font,
        } = req.body;

        const invoice = await Invoice.findById(invoiceId).session(session);
        if (!invoice) {
            throw new Error("Invoice not found.");
        }

        const customerExists = await Customer.findById(customer).session(session);
        if (!customerExists) {
            throw new Error('Customer not found');
        }
        const customerName = `${customerExists.firstName} ${customerExists.lastName}`;

        const salespersonExists = await Salesperson.findById(salesperson).session(session);
        if (!salespersonExists) {
            throw new Error('Salesperson not found');
        }
        const salespersonName = salespersonExists.name;

        let items = req.body.items;
        if (typeof items === 'string') {
            items = JSON.parse(items);
        }
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Invoice must have at least one item');
        }

        let subtotal = 0;
        let total = 0;

        const processedItems = await Promise.all(
            items.map(async (itemData) => {
                const itemDetails = await Item.findById(itemData.item).session(session);
                if (!itemDetails) {
                    throw new Error(`Item with ID ${itemData.item} not found`);
                }

                const quantity = itemData.quantity || 1;
                if (itemDetails.stock < quantity) {
                    throw new Error(`Not enough stock for item: ${itemDetails.name}`);
                }

                const price = itemDetails.price;
                const taxRate = itemDetails.defaultTaxRates || 0;
                const tax = (price * quantity * taxRate) / 100;
                const totalItemCost = (price * quantity) + tax;

                subtotal += quantity * price;
                total += totalItemCost;

                itemDetails.stock -= quantity;
                await itemDetails.save({ session });

                return {
                    item: itemData.item,
                    name: itemDetails.name,
                    description: itemDetails.description,
                    quantity,
                    price,
                    tax,
                    total: totalItemCost,
                };
            })
        );

        invoice.customer = customer;
        invoice.customerName = customerName;
        invoice.salesperson = salesperson;
        invoice.salespersonName = salespersonName;
        invoice.invoiceDate = invoiceDate;
        invoice.dueDate = dueDate;
        invoice.terms = terms;
        invoice.items = processedItems;
        invoice.color = color;
        invoice.font = font;
        invoice.subtotal = subtotal;
        invoice.total = total;
        invoice.recurring = recurring;
        invoice.nextInvoiceDate = recurring ? new Date(nextInvoiceDate) : null;

        if (req.file) {
            invoice.image = req.file.path;
        }

        await invoice.save({ session });

        await session.commitTransaction();
        session.endSession();

        const paymentLink = await createPayment(invoice._id);
        const pdfPath = await generatePDF(
            invoice,
            req.body.templateId || invoice.templateId,
            req.body.customerMobile || customerExists.mobile,
            req.body.customerEmail || customerExists.email,
            paymentLink
        );


        const subject = `Your Invoice from [Swiftrut Technology]`;
        const customerEmail = req.body.customerEmail || customerExists.email;
        const text = `Dear ${customerExists.firstName},\n\nThank you for your business,\n[Swiftrut Technology]`;
        await sendEmail(customerEmail, subject, text, pdfPath);


        res.status(200).json({
            message: 'Invoice updated successfully',
            invoice,
            pdfUrl: pdfPath,
        });
    } catch (error) {
        await session.abortTransaction().catch(() => null);
        session.endSession();

        console.error('Error updating invoice:', error);
        res.status(500).json({
            message: 'Failed to update invoice',
            error: error.message || error,
        });
    }
};


// Delete Invoice Controller
const deleteInvoice = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        const invoice = await Invoice.findById(id).session(session);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const invoiceItems = invoice.items;

        for (const { item: itemId } of invoiceItems) {
            const item = await Item.findById(itemId).session(session);
            if (item) {

                item.invoiceHistory = item.invoiceHistory.filter(
                    history => history.invoiceId && history.invoiceId.toString() !== id
                );

                await item.save({ session });
            }
        }

        await Invoice.findByIdAndDelete(id).session(session);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: 'Invoice and related invoice history deleted successfully',
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error(error.message);
        res.status(500).json({
            message: 'Failed to delete invoice',
            error: error.message,
        });
    }
};






const createPayment = async (invoiceId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
            throw new Error('Invalid Invoice ID format');
        }

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            throw new Error('Invoice not found');
        }

        const options = {
            amount: invoice.total * 100,
            currency: 'INR',
            receipt: `receipt_${invoice._id}`,
        };

        const order = await razorpay.orders.create(options);


        const paymentLinkResponse = await razorpay.paymentLink.create({
            amount: invoice.total * 100,
            currency: 'INR',
            description: `Payment for Invoice ${invoice._id}`,
            callback_url: 'https://invoich-backend-2.onrender.com/payment/callback',
            callback_method: 'get',
        });

        const paymentLink = paymentLinkResponse.short_url;

        const payment = new Payment({
            invoiceId: invoice._id,
            paymentId: order.id,
            paymentLink: paymentLink,
            amount: invoice.total,

            paymentMethod: 'Razorpay',
            status: 'success',
        });



        await payment.save();

        invoice.paymentLink = paymentLink;
        await invoice.save();

        return {
            message: 'Payment created successfully',
            orderId: order.id,
            paymentLink: paymentLink,
            status: payment.status,
        };
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Internal Server Error');
    }
};



// Helper function to parse CSV data
const parseCSV = (csvData) => {
    const records = [];
    return new Promise((resolve, reject) => {
        const stream = require('stream');
        const bufferStream = new stream.PassThrough();
        bufferStream.end(Buffer.from(csvData));

        bufferStream
            .pipe(csvParser({ separator: ',' }))
            .on('data', (row) => {

                if (row.items) {
                    try {
                        row.items = JSON.parse(row.items.replace(/""/g, '"'));
                    } catch (err) {
                        console.error("Error parsing 'items' field:", err);
                    }
                }
                records.push(row);
            })
            .on('end', () => resolve(records))
            .on('error', (error) => reject(error));
    });
};


// const bulkUploadInvoices = async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//         const invoices = []; 


//         const csvData = req.file.buffer.toString(); 


//         const records = await parseCSV(csvData);


//         for (const record of records) {
//             const {
//                 customer, color, font, invoiceDate, dueDate, recurring,
//                 nextInvoiceDate, templateId, terms, salesperson, items, freightCharges, freightTax, status
//             } = record;


//             if (!customer || !salesperson) {
//                 console.warn('Skipping empty or invalid row:', record);
//                 continue;
//             }

//             const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
//             if (!customer || !isValidObjectId(customer)) {
//                 throw new Error(`Invalid or missing customer ID: ${customer}`);
//             }

//             const userId = req.business.userId; 


//             const user = await User.findById(userId);
//             if (!user) throw new Error(`User with ID ${userId} not found.`);


//             const customerExists = await Customer.findById(customer).session(session);
//             if (!customerExists) {
//                 return res.status(404).json({ message: `Customer with ID ${customer} not found.` });
//             }

//             // Check if salesperson is a valid ObjectId
//             if (!mongoose.Types.ObjectId.isValid(salesperson)) {
//                 throw new Error(`Invalid salesperson ID: ${salesperson}`);
//             }


//             const salespersonExists = await Salesperson.findById(salesperson).session(session);
//             if (!salespersonExists) throw new Error(`Salesperson with ID ${salesperson} not found.`);

//             let subtotal = 0;
//             let total = 0;

//             // Process items and validate them
//             const processedItems = await Promise.all(
//                 items.map(async (itemData) => {


//                     const itemDetails = await Item.findById(itemData.item).session(session);
//                     console.log(itemDetails);
//                     if (!itemDetails) throw new Error(`Item with ID ${itemData.item} not found.`);
//                     if (itemDetails.stock < itemData.quantity) {
//                         throw new Error(`Not enough stock for item: ${itemDetails.name}`);
//                     }


//                     const tax = (itemData.price * itemData.quantity * itemDetails.defaultTaxRates) / 100;
//                     const totalItemCost = (itemData.price * itemData.quantity) + tax;

//                     subtotal += itemData.price * itemData.quantity;
//                     total += totalItemCost;


//                     itemDetails.stock -= itemData.quantity;
//                     await itemDetails.save({ session, validateBeforeSave: false });

//                     return {
//                         item: itemData.item,
//                         name: itemDetails.name,
//                         quantity: itemData.quantity,
//                         description: itemDetails.description,
//                         price: itemData.price,
//                         tax,
//                         total: totalItemCost,
//                     };
//                 })
//             );


//             const freightTotal = (freightCharges * freightTax) / 100 + freightCharges;
//             total += freightTotal;


//             const invoice = new Invoice({
//                 userId,
//                 customer,
//                 customerName: `${customerExists.firstName} ${customerExists.lastName}`,
//                 color,
//                 font,
//                 invoiceDate,
//                 dueDate,
//                 recurring,
//                 nextInvoiceDate: recurring ? new Date(nextInvoiceDate) : null,
//                 templateId,
//                 terms,
//                 salesperson,
//                 salespersonName: salespersonExists.name,
//                 items: processedItems,
//                 subtotal,
//                 total,
//                 freightCharges,
//                 freightTax,
//                 freightTotal,
//                 status,
//             });

//             await invoice.save({ session });

//             for (const item of processedItems) {
//                 await Item.findByIdAndUpdate(
//                     item.item,
//                     {
//                         $push: {
//                             invoiceHistory: {
//                                 invoiceId: invoice._id,
//                                 customer,
//                                 customerName: invoice.customerName,
//                                 invoiceNumber: invoice.invoiceNumber,
//                                 invoiceDate,
//                                 dueDate,
//                                 recurring,
//                                 nextInvoiceDate,
//                                 salesperson,
//                                 salespersonName: invoice.salespersonName,
//                                 subtotal,
//                                 total,
//                             },
//                         },
//                     },
//                     { session }
//                 );
//             }

//             invoices.push(invoice);
//         }

//         await session.commitTransaction();
//         session.endSession();

//         const paymentLink = await createPayment(invoice._id);

//         const pdfPath = await generatePDF(invoice, templateId, customerMobile, customerEmail, paymentLink);

//         const subject = `Your Invoice from [Swiftrut Technology]`;
//         const text = `Dear ${customerExists.firstName},\n\nThank you for your business,\n[Swiftrut Technology]`;
//         await sendEmail(customerExists.email, subject, text, pdfPath);


//         res.status(201).json({ message: 'Bulk invoices created successfully', invoices });
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();
//         console.error(error);
//         res.status(500).json({ message: 'Failed to create invoices', error: error.message || error });
//     }
// };




const bulkUploadInvoices = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const invoices = [];

        const csvData = req.file.buffer.toString();
        const records = await parseCSV(csvData);

        for (const record of records) {
            const {
                customer, color, font, invoiceDate, dueDate, recurring,
                nextInvoiceDate, templateId, terms, salesperson, items, freightCharges, freightTax, status
            } = record;

            if (!customer || !salesperson) {
                console.warn('Skipping empty or invalid row:', record);
            }

            const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
            if (!customer || !isValidObjectId(customer)) {
                throw new Error(`Invalid or missing customer ID: ${customer}`);
            }

            const userId = req.business.userId;

            const user = await User.findById(userId);
            if (!user) throw new Error(`User with ID ${userId} not found.`);

            const customerExists = await Customer.findById(customer).session(session);
            if (!customerExists) {
                return res.status(404).json({ message: `Customer with ID ${customer} not found.` });
            }

            if (!mongoose.Types.ObjectId.isValid(salesperson)) {
                throw new Error(`Invalid salesperson ID: ${salesperson}`);
            }

            const salespersonExists = await Salesperson.findById(salesperson).session(session);
            if (!salespersonExists) throw new Error(`Salesperson with ID ${salesperson} not found.`);

            let subtotal = 0;
            let total = 0;

            const processedItems = await Promise.all(
                items.map(async (itemData) => {
                    const itemDetails = await Item.findById(itemData.item).session(session);
                    if (!itemDetails) throw new Error(`Item with ID ${itemData.item} not found.`);
                    if (itemDetails.stock < itemData.quantity) {
                        throw new Error(`Not enough stock for item: ${itemDetails.name}`);
                    }

                    const tax = (itemData.price * itemData.quantity * itemDetails.defaultTaxRates) / 100;
                    const totalItemCost = (itemData.price * itemData.quantity) + tax;

                    subtotal += itemData.price * itemData.quantity;
                    total += totalItemCost;

                    itemDetails.stock -= itemData.quantity;
                    await itemDetails.save({ session, validateBeforeSave: false });
                    return {
                        item: itemData.item,
                        name: itemDetails.name,
                        quantity: itemData.quantity,
                        description: itemDetails.description,
                        price: itemData.price,
                        tax,
                        total: totalItemCost,
                    };
                })
            );

            let newFreightTax = (Number(freightCharges) * Number(freightTax)) / 100;
            const freightTotal = newFreightTax + Number(freightCharges);
            total += Number(freightTotal);



            const invoice = new Invoice({
                userId,
                customer,
                customerName: `${customerExists.firstName} ${customerExists.lastName}`,
                color,
                font,
                invoiceDate,
                dueDate,
                recurring,
                nextInvoiceDate: recurring ? new Date(nextInvoiceDate) : null,
                templateId,
                terms,
                salesperson,
                salespersonName: salespersonExists.name,
                items: processedItems,
                subtotal,
                total,
                freightCharges,
                freightTax,
                freightTotal,
                status,
            });

            await invoice.save({ session });



            for (const item of processedItems) {
                await Item.findByIdAndUpdate(
                    item.item,
                    {
                        $push: {
                            invoiceHistory: {
                                invoiceId: invoice._id,
                                customer,
                                customerName: invoice.customerName,
                                invoiceNumber: invoice.invoiceNumber,
                                invoiceDate,
                                dueDate,
                                recurring,
                                nextInvoiceDate,
                                salesperson,
                                salespersonName: invoice.salespersonName,
                                subtotal,
                                total,
                                items: processedItems
                            },
                        },
                    },
                    { session }
                );
            }



            invoices.push(invoice);
        }

        await session.commitTransaction();
        session.endSession();

        for (const invoice of invoices) {
            const customerExists = await Customer.findById(invoice.customer);

            if (!customerExists) {
                console.warn(`Customer with ID ${invoice.customer} not found for invoice ${invoice._id}`);
            }

            const { firstName, lastName, email, mobile } = customerExists;

            const paymentLink = await createPayment(invoice._id);

            const pdfPath = await generatePDF(invoice, invoice.templateId, mobile, email, paymentLink);

            const subject = `Your Invoice from [Swiftrut Technology]`;
            const text = `Dear ${firstName} ${lastName},\n\nThank you for your business.\n\nPlease find your invoice attached.\n\nBest regards,\nSwiftrut Technology`;

            await sendEmail(email, subject, text, pdfPath);
        }

        res.status(201).json({ message: 'Bulk invoices created and emails sent successfully', invoices });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        console.error(error);
        res.status(500).json({ message: 'Failed to create invoices and send emails', error: error.message || error });
    }
};





module.exports = {




    createInvoice,
    getAllInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    bulkUploadInvoices
};







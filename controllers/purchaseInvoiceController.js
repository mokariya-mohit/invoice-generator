const PurchaseInvoice = require('../models/purchaseInvoiceModel');
const Item = require('../models/itemModel');
const mongoose = require('mongoose');
const fs = require('fs');
const multer = require('multer');
const { Readable } = require('stream');
const csv = require('csv-parser');


// import CSV file
exports.importPurchaseInvoicesFromCSV = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.business.userId;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const parsedRows = [];
        const stream = Readable.from(req.file.buffer.toString('utf-8'));

        await new Promise((resolve, reject) => {
            stream
                .pipe(csv())
                .on('data', (row) => {
                    const parsedRow = {
                        userId,
                        itemID: row.itemID?.trim(),
                        unit: row.unit,
                        price: parseFloat(row.price),
                        total: parseFloat(row.total),
                        quantity: parseInt(row.quantity),
                    };

                    if (
                        !parsedRow.itemID ||
                        !mongoose.isValidObjectId(parsedRow.itemID) ||
                        !parsedRow.unit ||
                        isNaN(parsedRow.price) ||
                        isNaN(parsedRow.total) ||
                        isNaN(parsedRow.quantity)
                    ) {
                    } else {
                        parsedRows.push(parsedRow);
                    }
                })
                .on('end', resolve)
                .on('error', reject);
        });

        if (parsedRows.length === 0) {
            throw new Error("No valid rows found in CSV file");
        }

        for (const parsedRow of parsedRows) {
            const item = await Item.findById(parsedRow.itemID).session(session);
            if (!item) {
                console.warn(`Skipping row with invalid itemID: ${parsedRow.itemID}`);
                continue;
            }

            const purchaseInvoice = new PurchaseInvoice(parsedRow);
            await purchaseInvoice.save({ session });

            item.stock += parsedRow.quantity;
            await item.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "Purchase invoices imported successfully",
            results: parsedRows,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error importing purchase invoices:", error);

        res.status(500).json({
            message: "Failed to import purchase invoices",
            error: error.message || error,
        });
    }
};



// Get all purchaseinvoices
exports.getAllPurchaseinvoices = async (req, res) => {
    try {
        const purchaseinvoices = await PurchaseInvoice.find().populate('itemID');
        res.status(200).json({ purchaseinvoices });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single purchaseinvoice
exports.getPurchaseinvoiceById = async (req, res) => {
    try {
        const purchaseinvoice = await PurchaseInvoice.findById(req.params.id).populate('itemID');
        if (!purchaseinvoice) {
            return res.status(404).json({ error: 'Purchaseinvoice not found' });
        }
        res.status(200).json({ purchaseinvoice });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new purchaseinvoice
// exports.createPurchaseinvoice = async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//         const {itemID, unit, price, total, quantity } = req.body;
//         console.log(req.body);
        
//         const userId = req.business.userId;

//         if (!userId || !itemID || !unit || !price || !total || !quantity) {
//             return res.status(400).json({ message: "All fields are required 1" });
//         }

//             console.log(itemID);
            
//         const item = await Item.findById(itemID).session(session);
//         if (!item) {
//             return res.status(404).json({ message: "Item not found" });
//         }

//         const purchaseInvoice = new PurchaseInvoice({
//             userId,
//             itemID,
//             unit,
//             price,
//             total,
//             quantity,
//         });

//         await purchaseInvoice.save({ session });

//         item.stock += quantity;
//         await item.save({ session });

//         await session.commitTransaction();
//         session.endSession();

//         res.status(201).json({
//             message: "Purchase invoice created successfully",
//             purchaseInvoice,
//         });
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();
//         console.error("Error creating purchase invoice:", error);
//         res.status(500).json({
//             message: "Failed to create purchase invoice",
//             error: error.message || error,
//         });
//     }
// };

exports.createPurchaseinvoice = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { itemID, unit, price, total, quantity } = req.body;

        const userId = req.business.userId;

        // Validate required fields
        if (!userId || !itemID || !unit || !price || !total || !quantity) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find the item by ID
        const item = await Item.findById(itemID).session(session);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Create the purchase invoice
        const purchaseInvoice = new PurchaseInvoice({
            userId,
            itemID,
            unit,
            price,
            total,
            quantity,
        });

        // Save the purchase invoice
        await purchaseInvoice.save({ session });

        // Update item stock and add purchase invoice details
        item.stock += quantity;
        item.purchaseInvoices.push({
            invoiceId: purchaseInvoice._id,
            unit,
            price,
            total,
            quantity,
            date: new Date(),
        });

        // Save the updated item
        await item.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "Purchase invoice created successfully",
            purchaseInvoice,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error creating purchase invoice:", error);
        res.status(500).json({
            message: "Failed to create purchase invoice",
            error: error.message || error,
        });
    }
};

// Update a purchaseinvoice
exports.updatePurchaseInvoice = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { itemID, unit, price, total, quantity } = req.body;

        // Find the existing purchase invoice
        const purchaseInvoice = await PurchaseInvoice.findById(req.params.id).session(session);
        if (!purchaseInvoice) {
            return res.status(404).json({ error: 'Purchase invoice not found' });
        }

        // Store the old quantity for stock adjustment
        const oldQuantity = purchaseInvoice.quantity;

        // Update the purchase invoice with the new data
        purchaseInvoice.itemID = itemID || purchaseInvoice.itemID; 
        purchaseInvoice.unit = unit || purchaseInvoice.unit;
        purchaseInvoice.price = price || purchaseInvoice.price;
        purchaseInvoice.total = total || purchaseInvoice.total;
        purchaseInvoice.quantity = quantity || purchaseInvoice.quantity;

        await purchaseInvoice.save({ session });

        // Update item stock if itemID is provided
        if (itemID) {
            const item = await Item.findById(itemID).session(session);
            if (!item) {
                return res.status(404).json({ message: "Item not found" });
            }

            
            const quantityDifference = purchaseInvoice.quantity - oldQuantity;

            
            if (quantityDifference > 0) {
                item.stock += quantityDifference; 
            } else if (quantityDifference < 0) {
                item.stock += quantityDifference;
            }

            await item.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ purchaseInvoice });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error updating purchase invoice:", error);
        res.status(500).json({ error: error.message });
    }
};

// Delete a purchaseinvoice
exports.deletePurchaseinvoice = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        // Find and delete the PurchaseInvoice
        const purchaseinvoice = await PurchaseInvoice.findByIdAndDelete(id).session(session);
        if (!purchaseinvoice) {
            return res.status(404).json({ message: 'PurchaseInvoice not found' });
        }


        const items = await Item.find({ 'purchaseInvoices.invoiceId': id }).session(session);
        if (!items || items.length === 0) {
            throw new Error('No items found with the provided purchase invoice');
        }

        for (const item of items) {

            item.purchaseInvoices = item.purchaseInvoices.filter(
                invoice => invoice.invoiceId.toString() !== id  // Verifying by invoiceId
            );


            await item.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: 'PurchaseInvoice and related purchase history deleted successfully',
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        console.error('Error deleting PurchaseInvoice:', err.message);
        res.status(500).json({ message: err.message });
    }
};

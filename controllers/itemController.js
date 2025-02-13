const Item = require('../models/itemModel');
const QRCode = require('qrcode');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const cloudinary = require('../config/cloudinaryConfig');
// const fetch = require('node-fetch');
const { Readable } = require('stream');
const User = require('../models/userModel')


// Create a new item
// exports.createItem = async (req, res) => {
//     try {
//         const { type, name, unit, item, taxPreference, price, stock, description, userId, sku, defaultTaxRates } = req.body;

//         if (!type || !name || !unit || !item || !taxPreference || price === undefined || stock === undefined || !description || !userId || !sku || !defaultTaxRates) {
//             return res.status(400).json({ message: 'All fields are required' });
//         }


//         const newItem = new Item(req.body);
//         const savedItem = await newItem.save();
//         res.status(201).json(savedItem);
//     } catch (error) {
//         console.error(error);
//         res.status(400).json({ message: 'Error creating item', error: error.message });
//     }
// };


// Create a new item with QR code generation


exports.createItem = async (req, res) => {
    try {
        const { type, name, unit, item, taxPreference, price, stock, description,  sku, defaultTaxRates, openingStock } = req.body;

        const userId = req.business.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ message: 'Unauthorized: userId is missing in the request' });
        }


        if (!type || !name || !unit || !item || !taxPreference || price === undefined || stock === undefined || !description || !userId || !sku || !defaultTaxRates || !openingStock) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(400).json({ message: 'Invalid userId. User does not exist.' });
        }

        const qrCodeNumber = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const qrCodeUrl = await QRCode.toDataURL(qrCodeNumber);

        const newItem = new Item({ ...req.body, qrCode: qrCodeNumber, userId:userId });
        const savedItem = await newItem.save();

        res.status(201).json({ ...savedItem.toObject(), qrCodeUrl });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error creating item', error: error.message });
    }
};

// Verify QR code and fetch item details
exports.verifyQrCode = async (req, res) => {
    try {
        const { qrCodeNumber } = req.params;

        const item = await Item.findOne({ qrCode: qrCodeNumber });

        if (!item) {
            return res.status(404).json({ message: 'Invalid QR Code' });
        }

        res.status(200).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying QR code', error: error.message });
    }
};

// Get all items
exports.getAllItems = async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
};

// Get a specific item by ID
exports.getItemsByUserId = async (req, res) => {
    try {
        const items = await Item.find({ _id: req.params.id }).populate('userId', 'Name email');
        if (!items) {
            return res.status(404).json({ message: 'No items found for this user' });
        }
        res.status(200).json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
};

// Update an item by ID
exports.updateItem = async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error updating item', error: error.message });
    }
};

// Delete an item by ID
exports.deleteItem = async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting item', error: error });
    }
}



exports.bulkUploadItems = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.business.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ message: 'Unauthorized: userId is missing in the request' });
        }


        const items = [];
        const readableStream = Readable.from(req.file.buffer);

        readableStream
            .pipe(csv())
            .on('data', (row) => {
                items.push(row);
            })
            .on('end', async () => {
                try {
                    // Map and format items with userId from the token
                    const formattedItems = items.map(item => ({
                        type: item.type,
                        name: item.name,
                        unit: item.unit,
                        item: item.item,
                        taxPreference: item.taxPreference,
                        price: Number(item.price),
                        stock: Number(item.stock),
                        openingStock: Number(item.openingStock),
                        description: item.description,
                        sku: item.sku,
                        defaultTaxRates: Number(item.defaultTaxRates),
                        userId: userId, // Assign userId from the token
                        qrCode: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    }));

                    // Save the formatted items to the database
                    const savedItems = await Item.insertMany(formattedItems);
                    res.status(201).json({
                        message: 'Items uploaded successfully',
                        items: savedItems,
                    });
                } catch (error) {
                    console.error('Error saving items:', error);
                    res.status(500).json({
                        message: 'Error saving items',
                        error: error.message,
                    });
                }
            })
            .on('error', (err) => {
                console.error('Error parsing CSV:', err);
                res.status(500).json({
                    message: 'Error parsing CSV file',
                    error: err.message,
                });
            });

    } catch (error) {
        console.error('Error processing CSV file:', error);
        res.status(500).json({
            message: 'Error processing CSV file',
            error: error.message,
        });
    }
};

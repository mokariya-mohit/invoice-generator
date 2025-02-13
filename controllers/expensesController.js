const Expense = require('../models/expensesModel');
const cloudinary = require('../config/cloudinaryConfig');
const csv = require('csv-parser');
const fs = require('fs');
const { Readable } = require('stream');
const multer = require('multer');



//create expence
exports.createExpense = async (req, res) => {
    try {
        const userId = req.business.userId; // Ensure `userId` is correctly extracted

        if (req.file) {
            // Handle CSV file upload
            if (req.file.mimetype === 'text/csv') {
                const results = [];
                const stream = Readable.from(req.file.buffer.toString('utf-8'));

                stream
                    .pipe(csv())
                    .on('data', (row) => {
                        const parsedRow = {
                            description: row.description || row.Narration,
                            amount: parseFloat(row.amount || row.WithdrawalAmt),
                            date: new Date(row.date || row.Date),
                            category: row.category || 'Others',
                            userId: userId,
                        };

                        // Validate row before adding
                        if (!parsedRow.description || isNaN(parsedRow.amount) || isNaN(parsedRow.date.getTime())) {
                            console.warn('Skipping invalid row:', row);
                            return;
                        }

                        results.push(parsedRow);
                    })
                    .on('end', async () => {
                        try {
                            await Expense.insertMany(results);
                            res.status(201).json({ message: 'Expenses created successfully from CSV.' });
                        } catch (error) {
                            console.error('Error saving expenses from CSV:', error);
                            res.status(500).json({ message: 'Error saving expenses from CSV', error: error.message });
                        }
                    });

            } else if (req.file.mimetype.startsWith('image/')) {
                // Handle image file upload
                try {
                    const uploadResult = await new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream(
                            { folder: 'expenses_images' },
                            (error, result) => {
                                if (result) {
                                    resolve(result);
                                } else {
                                    reject(error);
                                }
                            }
                        );
                        stream.end(req.file.buffer);
                    });

                    const { description, amount, date, category } = req.body;

                    const expense = new Expense({
                        description,
                        amount,
                        date,
                        category,
                        receiptImage: uploadResult.secure_url, // Store the Cloudinary image URL
                        userId: userId,
                    });

                    await expense.save();
                    res.status(201).json({ message: 'Expense created successfully.', expense });

                } catch (uploadError) {
                    console.error('Error uploading image to Cloudinary:', uploadError);
                    res.status(500).json({ message: 'Error uploading image', error: uploadError.message });
                }
            } else {
                return res.status(400).json({ message: 'Unsupported file type. Please upload a CSV or image file.' });
            }
        } else {
            // Handle direct expense creation
            const { description, amount, date, category } = req.body;

            const expense = new Expense({
                description,
                amount,
                date,
                category,
                userId: userId,
            });

            await expense.save();
            res.status(201).json({ message: 'Expense created successfully.', expense });
        }
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ message: 'Error creating expense', error: error.message });
    }
};
exports.updateExpense = async (req, res) => {
    try {
        const userId = req.business.userId;
        const expenseId = req.params.id;  


        const expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).send('Expense not found');
        }

        const { description, amount, date, category } = req.body;

        const updateData = {
            description,
            amount,
            date,
            category,
        };

        if (req.file) {
            const imageFile = req.file;

            if (expense.imageUrl) {
                const oldImagePublicId = expense.imageUrl.split('/').pop().split('.')[0];
                
                await cloudinary.uploader.destroy(oldImagePublicId, (error, result) => {
                    if (error) {
                        console.error('Error deleting image from Cloudinary:', error);
                    } else {
                    }
                });
            }

            const uploadResponse = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );
                uploadStream.end(imageFile.buffer);
            });

            updateData.imageUrl = uploadResponse.secure_url;
        }

        const updatedExpense = await Expense.findByIdAndUpdate(
            expenseId,
            { $set: updateData },
            { new: true }  
        );

        if (!updatedExpense) {
            return res.status(404).send('Expense not found');
        }

        res.status(200).json({
            message: 'Expense updated successfully',
            expense: updatedExpense,
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong');
    }
};
  

exports.getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.business.userId;

        const expense = await Expense.findOne({ _id: id, userId });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json({ expense });
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};


exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.business.userId;


        const expense = await Expense.findOne({ _id: id, userId });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }


        if (expense.receiptImage) {
            const publicId = expense.receiptImage.split('/').slice(-2).join('/').split('.')[0];

            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error);
                return res.status(500).json({ message: 'Failed to delete receipt image' });
            }
        }
        await Expense.findOneAndDelete({ _id: id, userId });

        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.getAllExpenses = async (req, res) => {
    try {
        const getexpence = await Expense.find({});
        if (getexpence) {
            res.status(200).json({ massage: "get all expence", res: getexpence });
        } else {
            res.status(200).json({ massage: "expence not get" })
        }

    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ message: 'Server error', error });
    }
}



// Function to upload image to Cloudinary
exports.addexpenceimage = async (req, res) => {
    try {
        const userId = req.business.userId;
        // Log the request body and file to check if multer is working

        // Check if file exists
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        // Extracting expense data from the body
        const { description, amount, date, category } = req.body;

        // Image file from the request
        const imageFile = req.file;

        // Use Cloudinary upload_stream for buffer-based upload
        const uploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'auto' },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            // Pipe the buffer to Cloudinary
            uploadStream.end(imageFile.buffer);
        });

        // URL of the uploaded image
        const imageUrl = uploadResponse.secure_url;

        // Create the expense record with image URL
        const expense = new Expense({
            description,
            amount,
            date,
            category,
            userId,
            imageUrl,  // Save Cloudinary image URL
            userId: userId
        });

        // Save expense to the database
        await expense.save();

        // Respond with success
        res.status(200).json({
            message: 'Expense added successfully',
            expense,
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong');
    }
};




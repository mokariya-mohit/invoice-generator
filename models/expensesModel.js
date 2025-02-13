const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [3, 'Description must be at least 3 characters long'],
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative'],
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now, 
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Others'], 
        trim: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    imageUrl: {  // Add this field to store Cloudinary image URL
        type: String,
    }
}, {
    timestamps: true 
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;

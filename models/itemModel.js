const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    type: { type: String, enum: ['Goods', 'Service'], required: true },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    item: { type: String, required: true },
    taxPreference: { type: String, enum: ['non-taxable', 'taxable'], required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    openingStock: { type: Number, required: false },
    description: { type: String, required: true },
    sku: { type: String, required: true },
    defaultTaxRates: { type: Number, required: true },
    qrCode: { type: String, required: true },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
    },
    invoiceHistory: [{
        invoiceId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Invoice',
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'customerModel',
        },
        customerName: { type: String },
        invoiceNumber: { type: String },
        invoiceDate: { type: Date },
        dueDate: { type: Date },
        recurring: { type: Boolean, default: false },
        nextInvoiceDate: { type: Date },
        salesperson: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'salespersonModel',
        },
        salespersonName: { type: String },
        subtotal: { type: Number, required: true, default: 0 },
        freightCharges: { type: Number, default: 0 },
        freightTax: { type: Number, default: 0 },
        freightTotal: { type: Number, default: 0 },
        total: { type: Number, required: true, default: 0 },
        items: [
            {
                item: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'itemModel',
                    required: true,
                },
                name: { type: String, required: true },
                quantity: { type: Number, required: true, default: 1 },
                description: { type: String, required: true },
                price: { type: Number, required: true },
                tax: { type: Number, required: true },
                total: { type: Number, required: true },
            }
        ],
    }],
    // Add purchaseInvoice field
    purchaseInvoices: [
        {
            invoiceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'PurchaseInvoice',
                required: true,
            },
            unit: { type: String, required: true },
            price: { type: Number, required: true },
            total: { type: Number, required: true },
            quantity: { type: Number, required: true },
            date: { type: Date, default: Date.now },
        },
    ],
    // Add creditNote field
    creditNote: [{
        creditNoteId: { 
            type: String,  // Updated to String
            required: true
        },
        invoiceID: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Invoice', 
            required: true 
        },
        items: [
            {
                item: { 
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: 'Item' 
                },
                quantity: { 
                    type: Number, 
                    required: true 
                },
                price: { 
                    type: Number, 
                    required: true 
                },
                tax: { 
                    type: Number, 
                    required: true 
                },
                total: { 
                    type: Number, 
                    required: true 
                },
            },
        ],
        date: { 
            type: Date, 
            required: true 
        },
    }],
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);

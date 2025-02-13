const mongoose = require('mongoose');

// Counter Schema for auto-incrementing invoice numbers
const CounterSchema = new mongoose.Schema({
  field: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', CounterSchema);

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'customerModel',
    required: true,
  },
  customerName: {
    type: String,
  },
  
  color: {
    type: String,
    required: true,
  },
  font: {
    type: String,
    required: true,
  },
  invoiceNumber: {
    type: String,
    unique: true,
  },
  invoiceDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
  },
  recurring: { type: Boolean, default: false },
  nextInvoiceDate: { type: Date },
  templateId: { type: Number, required: true }, 
  terms: {
    type: String,
    enum: ['Due on Receipt', 'Net 15', 'Net 30', 'Net 45'],
    default: 'Due on Receipt',
  },
  salesperson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'salespersonModel',
    required: true,
  },
  salespersonName: {
    type: String,
  },
  image: {
    type: String,
  },
  items: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      description: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      taxRate:{
        type: Number,
        required: true,
      },
      tax: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
  ],
  subtotal: {
    type: Number,
    required: true,
    default: 0,
  },
  freightCharges: {
    type: Number,
    default: 0,
  },
  freightTax: {
    type: Number,
    default: 0,
  },
  freightTotal: {
    type: Number,
    default: 0, // Calculated as freightCharges + freightTax
  },
  total: {
    type: Number,
    required: true,
    default: 0,
  },
  paymentLink: { type: String }, 
  status: {
    type: String,
    enum: ['paid', 'unpaid', 'pending'],
    default: 'paid',

},

}, { timestamps: true });

// Auto-generate invoiceNumber before saving
invoiceSchema.pre('save', async function (next) {
  const Counter = mongoose.model('Counter');
  const doc = this;

  if (!doc.invoiceNumber) {
    const counter = await Counter.findOneAndUpdate(
      { field: 'invoiceNumber' },
      { $inc: { value: 1 } },
      { upsert: true, new: true }
    );
    doc.invoiceNumber = `INV-${counter.value.toString().padStart(5, '0')}`;
  }

  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);

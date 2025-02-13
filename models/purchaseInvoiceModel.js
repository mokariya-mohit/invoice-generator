const mongoose = require('mongoose');

// Counter Schema for auto-incrementing purchase invoice numbers
const CounterSchema1 = new mongoose.Schema({
  field: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});

const Counter1 = mongoose.model('Counter1', CounterSchema1);

const purchaseInvoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel',
    required: true,
  },
  itemID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true 
  }
}, { timestamps: true });


// Auto-generate invoiceNumber before saving
purchaseInvoiceSchema.pre('save', async function (next) {
  const Counter1 = mongoose.model('Counter1');
  const doc = this;

  if (!doc.purchaseInvoiceNumber) {
    const counter = await Counter1.findOneAndUpdate(
      { field: 'purchaseInvoiceNumber' },
      { $inc: { value: 1 } },
      { upsert: true, new: true }
    );
    doc.purchaseInvoiceNumber = `P-INV-${counter.value.toString().padStart(5, '0')}`;
  }

  next();
});

module.exports = mongoose.model('PurchaseInvoice', purchaseInvoiceSchema);





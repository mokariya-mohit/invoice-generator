const mongoose = require('mongoose');

// Counter Schema for auto-incrementing invoice numbers
const CounterSchema3 = new mongoose.Schema({
  field: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter3', CounterSchema3);

const creditNoteSchema = new mongoose.Schema({
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userModel',
      required: true,
    },
  creditNoteID: { type: String, required: true },
  invoiceID: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  invoiceDetails: {
    type: Object,
    required: true,
    items: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        tax: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
  },
});

const CreditNote = mongoose.model('CreditNote', creditNoteSchema);

module.exports = CreditNote;



// Auto-generate invoiceNumber before saving
creditNoteSchema.pre('save', async function (next) {
  const Counter3 = mongoose.model('Counter3');
  const doc = this;

  if (!doc.CreditNoteNumber) {
    const counter3 = await Counter3.findOneAndUpdate(
      { field: 'CreditNoteNumber' },
      { $inc: { value: 1 } },
      { upsert: true, new: true }
    );
    doc.CreditNoteNumber = `INV-${counter3.value.toString().padStart(5, '0')}`;
  }

  next();
});

module.exports = mongoose.model('CreditNote', creditNoteSchema);
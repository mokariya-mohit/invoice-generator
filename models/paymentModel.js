const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'invoiceModel', required: true },
  paymentId: { type: String }, 
  paymentLink: { type: String }, 
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Razorpay'], required: true },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);

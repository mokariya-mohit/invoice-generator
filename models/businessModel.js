const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    companyAddress: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    number: { type: String, required: true },
    image: { type: String },
    role: { type: String, enum: ['admin', 'user', 'business'], default: 'business' },
    prefix: { type: String, required: true },
    companyCategory: { type: String, required: true }
},
    { timestamps: true }
);

module.exports = mongoose.model('Business', businessSchema);

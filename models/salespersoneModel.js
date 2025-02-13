const mongoose = require('mongoose');

const salespersoneSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    userId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "User", 
                required: true,
            },
}, { timestamps: true });

module.exports = mongoose.model('Salespersone', salespersoneSchema);
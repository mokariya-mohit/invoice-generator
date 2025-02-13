const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('MongoDB connected successfully.');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

module.exports = connectDB;

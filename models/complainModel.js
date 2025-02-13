const mongoose = require('mongoose');

const UserComplainSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String, enum: ['pending', 'resolved'], default: 'pending' ,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    send: { type: String }
}, { timestamps: true });

const UserComplain = mongoose.model('UserComplain', UserComplainSchema);

module.exports = UserComplain;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Business = require("../models/businessModel");

const userSchema = new mongoose.Schema(
    {
        Name: { type: String },
        email: { type: String, unique: true },
        phoneNumber: { type: String, required: true, unique: true },
        password: { type: String, required: true},
        age: { type: Number },
        country: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        Category: { type: String, required: true },
        BusinessId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Business", 
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'user', 'business'],
            default: 'user', // Set a default role for new users
        },
        lastLogin: { type: Date }, // New field to store the last login timestamp
    },
    { timestamps: true }
);

// Hashing the password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Password comparison method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

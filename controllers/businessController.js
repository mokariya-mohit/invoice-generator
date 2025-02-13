const Business = require('../models/businessModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const sendEmail = require('../services/sendEmail');
const cloudinary = require('../config/cloudinaryConfig');
const crypto = require('crypto');
let otps = {};




// Register Business
exports.registerBusiness = async (req, res) => {
    try {
        const { companyName, companyAddress, email, number, companyCategory, prefix } = req.body;

          
        if (!companyName || !companyAddress || !email || !number || !prefix ) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newBusiness = new Business({
            companyName,
            companyAddress,
            email,
            number,
            companyCategory,
            prefix,
            image: req.file ? req.file.path : null,
        });

        await newBusiness.save();

        res.status(201).json({
            message: 'Business registered successfully',
            data: newBusiness,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering business', error: error.message });
    }
};

// Login Business and Generate Token
exports.loginBusiness = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const business = await Business.findOne({ email });

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        const isMatch = await bcrypt.compare(password, business.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { id: business._id, role: business.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Business logged in successfully',
            data: business,
            token: token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in business', error: error.message });
    }
};


// Get Business
exports.getBusiness = async (req, res) => {
    try {
        const admins = await Business.find().select('-password');
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: "Error fetching admins.", error });
    }
};


// Get Business By ID
exports.getBusinessByID = async (req, res) => {
    try {
        const { id } = req.params;

        const business = await Business.findById(id).select('-password'); 

        if (!business) {
            return res.status(404).json({ message: "Business not found." });
        }

        res.status(200).json(business);
    } catch (error) {
        res.status(500).json({ message: "Error fetching business.", error });
    }
};


// Update Business

exports.updateBusiness = async (req, res) => {
    
    try {
        const { id } = req.params; 
        const updateFields = req.body;
       
        const existingBusiness = await Business.findById(id);
        if (!existingBusiness) {
            return res.status(404).json({ message: "Business not found." });
        }

        if (req.file) {

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "businesses",
            });


            if (existingBusiness.imagePublicId) {
                await cloudinary.uploader.destroy(existingBusiness.imagePublicId);
            }

            updateFields.image = result.secure_url;
            updateFields.imagePublicId = result.public_id;
        }

        if (updateFields.password) {
            updateFields.password = await bcrypt.hash(updateFields.password, 10);
        } else {
            updateFields.password = existingBusiness.password; 
        }

        const updatedBusiness = await Business.findByIdAndUpdate(id, updateFields, { new: true });

        if (!updatedBusiness) {
            return res.status(400).json({ message: "Error updating business. No changes applied." });
        }

        res.status(200).json(updatedBusiness);
    } catch (error) {
        console.error('Error in updating business:', error);
        res.status(500).json({ message: "Error updating business.", error });
    }
};


// Delete Business
exports.deleteBusiness = async (req, res) => {
    try {
        const { id } = req.params; 

        const business = await Business.findById(id);
        if (!business) {
            return res.status(404).json({ message: "Business not found." });
        }

        if (business.imagePublicId) {
            await cloudinary.uploader.destroy(business.imagePublicId);
        }

        await Business.findByIdAndDelete(id);

        res.status(200).json({ message: "Business deleted successfully." });
    } catch (error) {
        console.error('Error in deleting business:', error);
        res.status(500).json({ message: "Error deleting business.", error });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const businessId = req.business.id;
        
        const { currentPassword, newPassword, confirmPassword } = req.body;

        const business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({ message: "Business not found." });
        }

        const isMatch = await bcrypt.compare(currentPassword, business.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New password and confirm password do not match." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        business.password = hashedPassword;
        await business.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error changing password.", error });
    }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const business = await Business.findOne({ email });        

        if (!business) {
            return res.status(404).json({ message: "Business not found!" });
        }

        const otp = crypto.randomInt(100000, 999999).toString();

        otps[business._id] = {
            otp,
            expires: Date.now() + 10 * 60 * 1000 // 10 minutes
        };

        
        const subject = 'Your OTP for password reset';
        const text = `Your OTP to reset your password is: ${otp}. It is valid for 10 minutes.`;

        await sendEmail(email, subject, text);

        res.status(200).json({ message: "OTP sent to your email!" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.verifyOtp = async (req, res) => {
    const { otp } = req.body;
    const { id } = req.params; 

    if (!otps[id]) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (otps[id].otp !== otp) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    if (Date.now() > otps[id].expires) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    delete otps[id];

    res.status(200).json({ message: "OTP verified", id });
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    try {
        const business = await Business.findById(id);
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        business.password = await bcrypt.hash(newPassword, 10);
        await business.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

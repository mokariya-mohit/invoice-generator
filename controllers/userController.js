const User = require('../models/userModel');
const Business = require('../models/businessModel'); // Ensure you import the Business model
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require('path');
const sendEmail = require('../services/sendEmail');
const crypto = require('crypto');
const otps = {};



// exports.registerUser = async (req, res) => {
//     const {
//         Name,
//         email,
//         phoneNumber,
//         age,
//         country,
//         password,
//         address,
//         city,
//         state,
//         zipCode,
//         Category,
//         BusinessId 
//     } = req.body;

//     try {
//         const UserExists = await User.findOne({ email });
//         if (UserExists) {
//             return res.status(400).json({ message: "User already exists" });
//         }

//         const newUser = await User.create({
//             Name,
//             email,
//             phoneNumber,
//             age,
//             country,
//             password,
//             address,
//             city,
//             state,
//             zipCode,
//             Category,
//             BusinessId, 
//         });

//         const populatedUser = await User.findById(newUser._id).populate('BusinessId');

//         res.status(201).json({
//             message: "User registered successfully",
//             user: {
//                 id: populatedUser._id,
//                 name: populatedUser.Name,
//                 email: populatedUser.email,
//                 phoneNumber: populatedUser.phoneNumber,
//                 age: populatedUser.age,
//                 country: populatedUser.country,
//                 address: populatedUser.address,
//                 city: populatedUser.city,
//                 state: populatedUser.state,
//                 zipCode: populatedUser.zipCode,
//                 category: populatedUser.Category,
//                 business: populatedUser.BusinessId, 
//             },
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error", error });
//     }
// };



const nodemailer = require('nodemailer');

const otpStore = {};

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Function to send OTP
const sendOtp = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Registration',
        text: `Your OTP for registration is ${otp}. It is valid for 10 minutes.`,
    };
    await transporter.sendMail(mailOptions);
};

// Unified user registration process
exports.registerUser = async (req, res) => {
    const {
        Name,
        email,
        phoneNumber,
        age,
        country,
        password,
        address,
        city,
        state,
        zipCode,
        Category,
        BusinessId,
        otp,

    } = req.body;

    try {
        const UserExists = await User.findOne({ email });
        if (UserExists) {
            return res.status(400).json({ message: 'User already exists' });
            return res.status(400).json({ message: 'User already exists' });
        }

        if (!otp) {
            const generatedOtp = crypto.randomInt(100000, 999999);
            otpStore[email] = { otp: generatedOtp, expiresAt: Date.now() + 10 * 60 * 1000 }; 

            await sendOtp(email, generatedOtp);
            return res.status(200).json({
                message: 'OTP sent successfully. Please verify the OTP to complete registration.',
            });
        }

        const otpEntry = otpStore[email];
        if (!otpEntry || otpEntry.otp !== Number(otp) || otpEntry.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        delete otpStore[email];

        const newUser = await User.create({
            Name,
            email,
            phoneNumber,
            age,
            country,
            password,
            address,
            city,
            state,
            zipCode,
            Category,
            BusinessId,
            BusinessId,
        });

        const populatedUser = await User.findById(newUser._id).populate('BusinessId');

        res.status(201).json({
            message: 'User registered successfully',
            message: 'User registered successfully',
            user: {
                id: populatedUser._id,
                name: populatedUser.Name,
                email: populatedUser.email,
                phoneNumber: populatedUser.phoneNumber,
                age: populatedUser.age,
                country: populatedUser.country,
                address: populatedUser.address,
                city: populatedUser.city,
                state: populatedUser.state,
                zipCode: populatedUser.zipCode,
                category: populatedUser.Category,
                business: populatedUser.BusinessId,
                business: populatedUser.BusinessId,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};


exports.userlogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
    }

    try {
        const user = await User.findOne({ email: new RegExp(`^${email}$`, "i") });


        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        user.lastLogin = Date.now();
        await user.save();

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } 
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.Name,
                email: user.email,
                role: user.role,
                businessId: user.BusinessId, 
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};


exports.updateuser = async (req, res) => {

    const { id } = req.params; 
    const updates = req.body; 

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true } 
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.deleteuser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
};

exports.forgotpassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const otp = crypto.randomInt(100000, 999999).toString();

        otps[user.email] = {
            otp,
            expires: Date.now() + 10 * 60 * 1000 
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
    const { otp, email } = req.body;

    if (!otps[email]) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (otps[email].otp !== otp) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (Date.now() > otps[email].expires) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    delete otps[email];

    res.status(200).json({ message: "OTP verified", email });
};

exports.resetPassword = async (req, res) => {
    const { email } = req.body; 
    const { newPassword } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { password: hashedPassword },
            { new: true } 
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Failed to reset password' });
        }

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New password and confirm password do not match" });
        }

        const userId = req.business.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect old password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword }, 
            { new: true } 
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: "Password has been changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.getalluser = async (req, res) => {
    try {
        const alluser = await User.find();
        res.status(200).json(alluser);
    } catch (error) {
        res.status(500).json({ message: "Error fetching alluser.", error });
    }
}

exports.getuserbyid = async (req, res) => {
    const userid = req.params.id
    
    try {
        const getiduser = await User.findById(userid).populate('BusinessId');
        if (getiduser) {
            res.status(200).json(getiduser);
        } else {
            res.status(200).json("user not find");
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching alluser.", error })
    }
}

const Salesperson = require('../models/salespersoneModel');
const csv = require('csv-parser');
const { Readable } = require('stream');
const multer = require('multer');
const User = require('../models/userModel')
// Create a new salesperson
exports.createSalespersone = async (req, res) => {
    try {
        const userId = req.business.userId;
        
        const { name, email } = req.body;
       

        // Validate required fields
        if (!name || !email || !userId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newSalesperson = new Salesperson({...req.body,userId:userId});
        const savedSalesperson = await newSalesperson.save();
        res.status(201).json(savedSalesperson);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error creating salesperson', error: error.message });
    }
};

// Get all salespersons
exports.getAllSalespersones = async (req, res) => {
    try {
        const salespersons = await Salesperson.find().populate('userId', 'name email');
        res.status(200).json(salespersons);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching salespersons', error: error.message });
    }
};

// Get a specific salesperson by ID
exports.getSalespersoneById = async (req, res) => {
    try {
        const salesperson = await Salesperson.findById(req.params.id).populate('userId', 'name email');
        if (salesperson) {
            res.status(200).json(salesperson);
        }
    }
    catch (error) {
        console.error(error);
        return res.status(404).json({ message: 'Salesperson not found' });
    }
};


exports.salespersonecsv = async (req, res) => {
    try {
        const results = [];
        const stream = Readable.from(req.file.buffer.toString());

        stream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {

                    const userId = req.business.userId;
                    if (!userId) {
                        return res
                            .status(401)
                            .json({ message: 'Unauthorized: userId is missing in the request' });
                    }
            
                    const salespersons = results.map((row) => ({
                        name: row.name,
                        email: row.email,
                        userId: userId,
                    }));

                    // Validate required fields
                    for (const salesperson of salespersons) {
                        if (!salesperson.name || !salesperson.email || !salesperson.userId) {
                            return res
                                .status(400)
                                .json({ message: 'Name, email, and userId are required for all salespersons' });
                        }
                    }

                    // Extract unique userIds from salespersons
                    const userIds = [...new Set(salespersons.map((sp) => sp.userId))];

                    // Validate userIds against the User collection
                    const validUsers = await User.find({ _id: { $in: userIds } });
                    const validUserIds = validUsers.map((user) => user._id.toString());

                    const missingUserIds = userIds.filter((id) => !validUserIds.includes(id));
                    if (missingUserIds.length > 0) {
                        return res.status(400).json({
                            message: 'Some userIds are invalid',
                            invalidUserIds: missingUserIds,
                        });
                    }

                    // Check for duplicate emails in the database
                    const emails = salespersons.map((sp) => sp.email);
                    const existingSalespersons = await Salesperson.find({ email: { $in: emails } });
                    const existingEmails = existingSalespersons.map((sp) => sp.email);

                    // Filter out duplicates
                    const newSalespersons = salespersons.filter(
                        (sp) => !existingEmails.includes(sp.email)
                    );

                    // Insert only new salespersons
                    if (newSalespersons.length > 0) {
                        await Salesperson.insertMany(newSalespersons);
                    }

                    res.status(201).json({
                        message: `${newSalespersons.length} new salespersons added. ${existingEmails.length} duplicates skipped.`,
                        newSalespersons,
                        duplicates: existingEmails,
                    });
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ message: 'Error processing CSV file', error });
                }
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading salespersons through CSV', error });
    }
};


// exports.salespersonecsv = async (req, res) => {
//     try {
//         const results = [];
//         const stream = Readable.from(req.file.buffer.toString());

//         stream
//             .pipe(csv())
//             .on('data', (data) => results.push(data))
//             .on('end', async () => {
//                 try {
//                     const salespersons = results.map((row) => ({
//                         name: row.name,
//                         email: row.email,
//                         userId: row.userId,
//                     }));

//                     // Validate required fields
//                     for (const salesperson of salespersons) {
//                         if (!salesperson.name || !salesperson.email || !salesperson.userId) {
//                             return res
//                                 .status(400)
//                                 .json({ message: 'Name, email, and userId are required for all salespersons' });
//                         }
//                     }

//                     // Check for duplicate emails in the database
//                     const emails = salespersons.map((sp) => sp.email);
//                     const existingSalespersons = await Salesperson.find({ email: { $in: emails } });
//                     const existingEmails = existingSalespersons.map((sp) => sp.email);

//                     // Filter out duplicates
//                     const newSalespersons = salespersons.filter(
//                         (sp) => !existingEmails.includes(sp.email)
//                     );

//                     // Insert only new salespersons
//                     if (newSalespersons.length > 0) {
//                         await Salesperson.insertMany(newSalespersons);
//                     }

//                     res.status(201).json({
//                         message: `${newSalespersons.length} new salespersons added. ${existingEmails.length} duplicates skipped.`,
//                         newSalespersons,
//                         duplicates: existingEmails,
//                     });
//                 } catch (error) {
//                     console.error(error);
//                     res.status(500).json({ message: 'Error processing CSV file', error });
//                 }
//             });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error uploading salespersons through CSV', error });
//     }
// };


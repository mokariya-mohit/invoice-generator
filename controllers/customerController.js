const Customer = require('../models/customerModel');
const csv = require('csv-parser');
const { Readable } = require('stream');
const multer = require('multer');

// Create a new customer
exports.createCustomer = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            customerType,
            companyName,
            displayName,
            phoneNumber,
            mobileNumber,
            otherDetails,
            addresses,
            currency
        } = req.body;

        const userId = req.business.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ message: 'Unauthorized: userId is missing in the request' });
        }

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }


        if (!Array.isArray(otherDetails) || !Array.isArray(addresses)) {
            return res.status(400).json({ message: 'otherDetails and addresses should be arrays' });
        }


        const customer = new Customer({
            firstName,
            lastName,
            email,
            customerType,
            companyName,
            displayName,
            phoneNumber,
            mobileNumber,
            userId:userId,
            otherDetails,
            addresses,
            currency
        });


        await customer.save();


        res.status(201).json(customer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating customer', error });
    }
};



// Get all customers
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching customers', error });
    }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
    const { id } = req.params;
    try {
        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(customer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching customer', error });
    }
};

// Update customer details
exports.updateCustomer = async (req, res) => {
    const { id } = req.query;

    try {

        const {
            firstName,
            lastName,
            email,
            customerType,
            companyName,
            displayName,
            phoneNumber,
            mobileNumber,
            otherDetails,
            addresses,
            currency
        } = req.body;


        const updateData = {
            firstName,
            lastName,
            email,
            customerType,
            companyName,
            displayName,
            phoneNumber,
            mobileNumber,
            otherDetails,
            addresses,
            currency
        };

        const updatedCustomer = await Customer.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json(updatedCustomer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating customer', error });
    }
};


// Delete customer
exports.deleteCustomer = async (req, res) => {
    const { id } = req.query;

    try {
        const customer = await Customer.findByIdAndDelete(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting customer', error });
    }
};

exports.Customercsv = async (req, res) => {
    try {
        const results = [];
        const stream = Readable.from(req.file.buffer.toString());

        stream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    const userId = req.business.userId;
                   
                    const customers = results.map((row) => ({
                        firstName: row.firstName,
                        lastName: row.lastName,
                        email: row.email,
                        customerType: row.customerType,
                        companyName: row.companyName,
                        displayName: row.displayName,
                        phoneNumber: row.phoneNumber,
                        mobileNumber: row.mobileNumber,
                        userId: userId,
                        otherDetails: JSON.parse(row.otherDetails || '[]'),
                        addresses: JSON.parse(row.addresses || '[]'),
                        currency: row.currency,
                    }));

                    // Validate the data for required fields
                    for (const customer of customers) {
                        if (!customer.userId) {
                            return res
                                .status(400)
                                .json({ message: 'userId is required for all customers' });
                        }
                    }

                    // Get existing emails from the database
                    const emails = customers.map((customer) => customer.email);
                    const existingCustomers = await Customer.find({ email: { $in: emails } });
                    const existingEmails = existingCustomers.map((customer) => customer.email);

                    // Filter out customers with duplicate emails
                    const newCustomers = customers.filter(
                        (customer) => !existingEmails.includes(customer.email)
                    );

                    // Insert only new customers
                    if (newCustomers.length > 0) {
                        await Customer.insertMany(newCustomers);
                    }

                    res.status(201).json({
                        message: `${newCustomers.length} new customers created. ${existingEmails.length} duplicates skipped.`,
                        newCustomers,
                        duplicates: existingEmails,
                    });
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ message: 'Error processing CSV file', error });
                }
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding customers through CSV', error });
    }
};


const UserComplain = require('../models/complainModel');

// Create a new user complain
exports.createUserComplain = async (req, res) => {
  try {
    const { type, title, description, status } = req.body;
    const userId = req.business.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: userId is missing in the request' });
    }

    const userComplain = new UserComplain({ userId, type, title, description, status, userId });
    await userComplain.save();
    res.status(201).json(userComplain);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all user complains
exports.getAllUserComplains = async (req, res) => {
  try {
    const userComplains = await UserComplain.find().sort({ createdAt: -1 });
    res.status(200).json(userComplains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a user complain by ID
exports.getUserComplainById = async (req, res) => {
  try {
    const userComplain = await UserComplain.findById(req.params.id);
    if (!userComplain) {
      return res.status(404).json({ error: 'User complain not found' });
    }
    res.status(200).json(userComplain);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a user complain by ID
exports.updateUserComplainById = async (req, res) => {
  try {
    const userComplain = await UserComplain.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!userComplain) {
      return res.status(404).json({ error: 'User complain not found' });
    }
    res.status(200).json(userComplain);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


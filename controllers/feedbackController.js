const Feedback = require('../models/feedbakeModel');

// Create Feedback
const createFeedback = async (req, res) => {
  try {
    const { rating, email, name, title, comment } = req.body;

    if (!rating || !email || !name || !title || !comment) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const feedback = new Feedback({ rating, email, name, title, comment });
    await feedback.save();

    res.status(201).json({ message: 'Feedback created successfully!', feedback });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};

// Get All Feedback
const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};

module.exports = { createFeedback, getAllFeedback };

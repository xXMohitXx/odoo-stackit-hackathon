const express = require('express');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes in this file should be protected and limited to admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('name');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   DELETE /api/admin/questions/:id
// @desc    Delete a question (admin)
// @access  Private/Admin
router.delete('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    // Delete all answers associated with the question
    await Answer.deleteMany({ question: req.params.id });

    await question.deleteOne();

    res.json({ success: true, data: {} });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   DELETE /api/admin/answers/:id
// @desc    Delete an answer (admin)
// @access  Private/Admin
router.delete('/answers/:id', async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }

    await answer.deleteOne();

    res.json({ success: true, data: {} });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   PUT /api/admin/ban/:userId
// @desc    Ban a user
// @access  Private/Admin
router.put('/ban/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Cannot ban another admin
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, error: 'Cannot ban an admin user' });
    }

    user.isBanned = true;
    await user.save();

    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   PUT /api/admin/unban/:userId
// @desc    Unban a user
// @access  Private/Admin
router.put('/unban/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.isBanned = false;
    await user.save();

    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
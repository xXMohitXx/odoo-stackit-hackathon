const express = require('express');
const { check, validationResult } = require('express-validator');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { processMentions } = require('../utils/mentions');
const { success, error } = require('../utils/response');

const router = express.Router();

// @route   GET /api/answers
// @desc    Get all answers with pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Answer.countDocuments();

    const answers = await Answer.find()
      .populate({
        path: 'user',
        select: 'name'
      })
      .populate('question')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.json({
      success: true,
      count: answers.length,
      total,
      pagination,
      data: answers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   PUT /api/answers/:id/accept
// @desc    Accept an answer (only by question owner)
// @access  Private
router.put('/:id/accept', protect, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }

    // Get the question
    const question = await Question.findById(answer.question);

    // Check if user is question owner
    if (question.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to accept this answer' });
    }

    // Reset all answers for this question to not accepted
    await Answer.updateMany(
      { question: question._id },
      { isAccepted: false }
    );

    // Set this answer as accepted
    answer.isAccepted = true;
    await answer.save();

    // Create notification for answer owner
    if (answer.user.toString() !== req.user.id) {
      await Notification.create({
        user: answer.user,
        message: `Your answer was accepted on: ${question.title.substring(0, 30)}...`,
        link: `/questions/${question._id}`,
      });
    }

    res.json({ success: true, data: answer });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   DELETE /api/answers/:id
// @desc    Delete an answer
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }

    // Check user is answer owner or admin
    if (answer.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this answer' });
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

module.exports = router;
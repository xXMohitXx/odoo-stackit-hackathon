const express = require('express');
const Tag = require('../models/Tag');
const Question = require('../models/Question');

const router = express.Router();

// @route   GET /api/tags
// @desc    Get all tags
// @access  Public
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find().sort('name');
    res.json({ success: true, count: tags.length, data: tags });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/tags/:slug/questions
// @desc    Get questions by tag
// @access  Public
router.get('/:slug/questions', async (req, res) => {
  try {
    const tag = await Tag.findOne({ slug: req.params.slug });

    if (!tag) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    const questions = await Question.find({ tags: tag._id })
      .populate({
        path: 'user',
        select: 'name'
      })
      .populate('tags')
      .sort('-createdAt');

    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
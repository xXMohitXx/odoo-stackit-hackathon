const express = require('express');
const { check, validationResult } = require('express-validator');
const Question = require('../models/Question');
const Tag = require('../models/Tag');
const Answer = require('../models/Answer');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { processMentions } = require('../utils/mentions');
const { success, error, getPagination } = require('../utils/response');

const router = express.Router();

// @route   GET /api/questions
// @desc    Get all questions with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Question.find(JSON.parse(queryStr)).populate({
      path: 'user',
      select: 'name'
    }).populate('tags');

    // Handle search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.or([
        { title: searchRegex },
        { description: searchRegex }
      ]);
    }

    // Handle specific filters
    if (req.query.newest === 'true') {
      query = query.sort('-createdAt');
    } else {
      // Default sort by newest
      query = query.sort('-createdAt');
    }

    if (req.query.unanswered === 'true') {
      // Find questions with no answers
      const questionsWithAnswers = await Answer.distinct('question');
      query = query.where('_id').nin(questionsWithAnswers);
    }

    if (req.query.tag) {
      // Try to find tag by slug first, then by name (without #)
      let tag = await Tag.findOne({ slug: req.query.tag });
      if (!tag) {
        // Try to find by name without # prefix
        const tagName = req.query.tag.startsWith('#') ? req.query.tag : `#${req.query.tag}`;
        tag = await Tag.findOne({ name: tagName });
      }
      if (tag) {
        query = query.where('tags').equals(tag._id);
      }
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Question.countDocuments(query);

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const questions = await query;

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
      count: questions.length,
      pagination,
      data: questions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/questions/:id
// @desc    Get question by ID with answers
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name'
      })
      .populate('tags')
      .populate({
        path: 'answers',
        populate: {
          path: 'user',
          select: 'name'
        }
      });

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    res.json({ success: true, data: question });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   POST /api/questions
// @desc    Create a question
// @access  Private
router.post(
  '/',
  [
    protect,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('tags', 'At least one tag is required').isArray({ min: 1 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, tags } = req.body;

      // Process tags
      const tagIds = [];
      for (const tagName of tags) {
        // Find or create tag
        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
          tag = await Tag.create({ name: tagName });
        }
        tagIds.push(tag._id);
      }

      const newQuestion = new Question({
        title,
        description,
        tags: tagIds,
        user: req.user.id
      });

      const question = await newQuestion.save();
      
      // Process mentions in the description
      await processMentions(
        description,
        req.user.id,
        `/questions/${question._id}`,
        `${title.substring(0, 30)}...`
      );

      return success(res, 201, question);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// @route   DELETE /api/questions/:id
// @desc    Delete a question
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    // Check user is question owner or admin
    if (question.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this question' });
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

// @route   POST /api/questions/:id/answers
// @desc    Add an answer to a question
// @access  Private
router.post(
  '/:id/answers',
  [
    protect,
    [check('content', 'Content is required').not().isEmpty()]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const question = await Question.findById(req.params.id);

      if (!question) {
        return res.status(404).json({ success: false, error: 'Question not found' });
      }

      const newAnswer = new Answer({
        content: req.body.content,
        question: req.params.id,
        user: req.user.id
      });

      const answer = await newAnswer.save();

      // Create notification for question owner
      if (question.user.toString() !== req.user.id) {
        await Notification.create({
          user: question.user,
          message: `${req.user.name} answered your question: ${question.title.substring(0, 30)}...`,
          link: `/questions/${question._id}`,
        });
      }
      
      // Process mentions in the answer content
      await processMentions(
        req.body.content,
        req.user.id,
        `/questions/${question._id}`,
        `an answer to: ${question.title.substring(0, 30)}...`
      );

      return success(res, 201, answer);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ success: false, error: 'Question not found' });
      }
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

module.exports = router;
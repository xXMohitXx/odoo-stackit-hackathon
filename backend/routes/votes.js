const express = require('express');
const Vote = require('../models/Vote');
const Answer = require('../models/Answer');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/answers/:id/vote
// @desc    Toggle vote on an answer
// @access  Private
router.post('/:id/vote', protect, async (req, res) => {
  try {
    const { voteType } = req.body;

    // Validate vote type
    if (!voteType || !['up', 'down'].includes(voteType)) {
      return res.status(400).json({ success: false, error: 'Invalid vote type' });
    }

    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }

    // Check if user already voted on this answer
    const existingVote = await Vote.findOne({
      answer: req.params.id,
      user: req.user.id
    });

    if (existingVote) {
      // If same vote type, remove the vote (toggle off)
      if (existingVote.voteType === voteType) {
        await existingVote.deleteOne();
        return res.json({ success: true, data: { message: 'Vote removed' } });
      }

      // If different vote type, update the vote
      existingVote.voteType = voteType;
      await existingVote.save();

      return res.json({ success: true, data: existingVote });
    }

    // Create new vote
    const newVote = new Vote({
      voteType,
      answer: req.params.id,
      user: req.user.id
    });

    const vote = await newVote.save();

    // Create notification for answer owner if upvote
    if (voteType === 'up' && answer.user.toString() !== req.user.id) {
      await Notification.create({
        user: answer.user,
        message: `${req.user.name} upvoted your answer`,
        link: `/questions/${answer.question}`,
      });
    }

    res.json({ success: true, data: vote });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/answers/:id/votes
// @desc    Get vote counts for an answer
// @access  Public
router.get('/:id/votes', async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }

    // Count upvotes and downvotes
    const upvotes = await Vote.countDocuments({
      answer: req.params.id,
      voteType: 'up'
    });

    const downvotes = await Vote.countDocuments({
      answer: req.params.id,
      voteType: 'down'
    });

    res.json({
      success: true,
      data: {
        upvotes,
        downvotes,
        total: upvotes - downvotes
      }
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
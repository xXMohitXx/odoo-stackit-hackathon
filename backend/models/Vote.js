const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  voteType: {
    type: String,
    enum: ['up', 'down'],
    required: [true, 'Please specify vote type']
  },
  answer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Answer',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from voting more than once per answer
VoteSchema.index({ answer: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);
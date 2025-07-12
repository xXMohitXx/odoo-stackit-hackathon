const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please add content for your answer']
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  question: {
    type: mongoose.Schema.ObjectId,
    ref: 'Question',
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
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Cascade delete votes when an answer is deleted
AnswerSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  await this.model('Vote').deleteMany({ answer: this._id });
  next();
});

// Reverse populate with votes
AnswerSchema.virtual('votes', {
  ref: 'Vote',
  localField: '_id',
  foreignField: 'answer',
  justOne: false
});

module.exports = mongoose.model('Answer', AnswerSchema);
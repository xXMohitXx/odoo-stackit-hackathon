const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  tags: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Tag'
  }],
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

// Cascade delete answers when a question is deleted
QuestionSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  await this.model('Answer').deleteMany({ question: this._id });
  next();
});

// Reverse populate with answers
QuestionSchema.virtual('answers', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'question',
  justOne: false
});

module.exports = mongoose.model('Question', QuestionSchema);
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Tag = require('./models/Tag');
const Question = require('./models/Question');
const Answer = require('./models/Answer');
const Vote = require('./models/Vote');
const Notification = require('./models/Notification');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Create admin and test users
const createUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany();

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Create regular users
    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    });

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123'
    });

    console.log('Users created');
    return { adminUser, user1, user2 };
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Create tags
const createTags = async () => {
  try {
    // Clear existing tags
    await Tag.deleteMany();

    // Create tags
    const tags = await Tag.insertMany([
      { name: 'JavaScript' },
      { name: 'Python' },
      { name: 'React' },
      { name: 'Node.js' },
      { name: 'MongoDB' },
      { name: 'SQL' },
      { name: 'HTML' },
      { name: 'CSS' },
      { name: 'Java' },
      { name: 'PHP' }
    ]);

    console.log('Tags created');
    return tags;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Create questions
const createQuestions = async (users, tags) => {
  try {
    // Clear existing questions
    await Question.deleteMany();

    // Create questions
    const question1 = await Question.create({
      title: 'How to join 2 columns in a data set to make a separate column in SQL',
      description: 'I do not know the code for it as I am a beginner. As an example what I need to do is like there is a column 1 containing First name, and column 2 consists of last name I want a column to combine these two.',
      tags: [tags.find(tag => tag.name === 'SQL')._id],
      user: users.user1._id
    });

    const question2 = await Question.create({
      title: 'How to center a div in CSS?',
      description: 'I am trying to center a div horizontally and vertically in CSS. What is the best way to do this?',
      tags: [
        tags.find(tag => tag.name === 'HTML')._id,
        tags.find(tag => tag.name === 'CSS')._id
      ],
      user: users.user2._id
    });

    const question3 = await Question.create({
      title: 'What is the difference between let and var in JavaScript?',
      description: 'I am confused about when to use let vs var in JavaScript. Can someone explain the differences and best practices?',
      tags: [tags.find(tag => tag.name === 'JavaScript')._id],
      user: users.user1._id
    });

    console.log('Questions created');
    return { question1, question2, question3 };
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Create answers
const createAnswers = async (users, questions) => {
  try {
    // Clear existing answers
    await Answer.deleteMany();

    // Create answers for question 1
    const answer1 = await Answer.create({
      content: 'You can use the CONCAT function in SQL. For example: `SELECT CONCAT(first_name, " ", last_name) AS full_name FROM users;`',
      question: questions.question1._id,
      user: users.user2._id
    });

    const answer2 = await Answer.create({
      content: 'Another option is to use the || operator in some SQL dialects: `SELECT first_name || " " || last_name AS full_name FROM users;`',
      question: questions.question1._id,
      user: users.adminUser._id
    });

    // Create answers for question 2
    const answer3 = await Answer.create({
      content: 'You can use flexbox: `.parent { display: flex; justify-content: center; align-items: center; height: 100vh; }`',
      question: questions.question2._id,
      user: users.user1._id,
      isAccepted: true
    });

    console.log('Answers created');
    return { answer1, answer2, answer3 };
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Create votes
const createVotes = async (users, answers) => {
  try {
    // Clear existing votes
    await Vote.deleteMany();

    // Create votes
    await Vote.create({
      voteType: 'up',
      answer: answers.answer1._id,
      user: users.adminUser._id
    });

    await Vote.create({
      voteType: 'up',
      answer: answers.answer1._id,
      user: users.user1._id
    });

    await Vote.create({
      voteType: 'up',
      answer: answers.answer3._id,
      user: users.user2._id
    });

    await Vote.create({
      voteType: 'down',
      answer: answers.answer2._id,
      user: users.user2._id
    });

    console.log('Votes created');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Create notifications
const createNotifications = async (users, questions) => {
  try {
    // Clear existing notifications
    await Notification.deleteMany();

    // Create notifications
    await Notification.create({
      user: users.user1._id,
      message: 'Your question received a new answer',
      link: `/questions/${questions.question1._id}`,
      isRead: false
    });

    await Notification.create({
      user: users.user2._id,
      message: 'Your answer was accepted',
      link: `/questions/${questions.question2._id}`,
      isRead: true
    });

    console.log('Notifications created');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Seed all data
const seedData = async () => {
  try {
    const users = await createUsers();
    const tags = await createTags();
    const questions = await createQuestions(users, tags);
    const answers = await createAnswers(users, questions);
    await createVotes(users, answers);
    await createNotifications(users, questions);

    console.log('Data seeded successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete all data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Tag.deleteMany();
    await Question.deleteMany();
    await Answer.deleteMany();
    await Vote.deleteMany();
    await Notification.deleteMany();

    console.log('Data deleted successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-i') {
  seedData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use correct command: -i to import data, -d to delete data');
  process.exit();
}
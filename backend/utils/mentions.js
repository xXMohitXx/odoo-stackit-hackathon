const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Extract mentions from text and create notifications
 * @param {string} text - Text to extract mentions from
 * @param {string} userId - ID of the user who created the content
 * @param {string} link - Link to the content
 * @param {string} contentPreview - Preview of the content for notification
 */
exports.processMentions = async (text, userId, link, contentPreview) => {
  try {
    // Extract mentions using regex (matches @username pattern)
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions = text.match(mentionRegex) || [];
    
    // Remove duplicates
    const uniqueMentions = [...new Set(mentions)];
    
    // Process each mention
    for (const mention of uniqueMentions) {
      // Remove the @ symbol
      const username = mention.substring(1);
      
      // Find the mentioned user
      const mentionedUser = await User.findOne({ name: new RegExp(`^${username}$`, 'i') });
      
      // If user exists and is not the author, create notification
      if (mentionedUser && mentionedUser._id.toString() !== userId) {
        await Notification.create({
          user: mentionedUser._id,
          message: `You were mentioned in: ${contentPreview}`,
          link,
          isRead: false
        });
      }
    }
  } catch (err) {
    console.error('Error processing mentions:', err);
  }
};
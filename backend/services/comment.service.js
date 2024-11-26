const Comment = require("../models/comment.model");

/**
 * Create a new comment
 * @param {Object} commentData - Data for the comment
 * @returns {Promise<Object>} - The created comment
 */
const createComment = async (commentData) => {
  const newComment = new Comment(commentData);
  return await newComment.save();
};

/**
 * Get all comments for a specific forum post
 * @param {String} forumId - The ID of the forum post
 * @returns {Promise<Array>} - List of comments
 */
const getCommentsByForumId = async (forumId) => {
  return await Comment.find({ forum_id: forumId })
    .populate("author_id", "name email")
    .sort({ created_at: 1 });
};

module.exports = { createComment, getCommentsByForumId };

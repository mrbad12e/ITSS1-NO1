const Forum = require("../models/forum.model");

/**
 * Create a new forum post
 * @param {Object} postData - Data for the new post
 * @returns {Promise<Object>} - The created post
 */
const createPost = async (postData) => {
  const newPost = new Forum(postData);
  return await newPost.save();
};

/**
 * Get all forum posts
 * @returns {Promise<Array>} - List of all posts
 */
const getAllPosts = async () => {
  return await Forum.find()
    .populate("author_id", "name email")
    .sort({ created_at: -1 });
};

/**
 * Get a forum post by ID
 * @param {String} postId - The ID of the post
 * @returns {Promise<Object>} - The post if found
 */
const getPostById = async (postId) => {
  return await Forum.findById(postId).populate("author_id", "name email");
};

module.exports = { createPost, getAllPosts, getPostById };

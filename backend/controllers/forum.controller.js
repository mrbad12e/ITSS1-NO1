const forumService = require("../services/forum.service");

/**
 * Controller to create a new forum post
 */
const createPost = async (req, res) => {
  try {
    const { title, content, author_id } = req.body;
    if (!title || !content || !author_id) {
      return res
        .status(400)
        .json({ error: "Title, content, and author_id are required" });
    }

    const newPost = await forumService.createPost({
      title,
      content,
      author_id,
    });
    res.status(201).json(newPost);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create post", details: err.message });
  }
};

/**
 * Controller to get all forum posts
 */
const getAllPosts = async (req, res) => {
  try {
    const posts = await forumService.getAllPosts();
    res.status(200).json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch posts", details: err.message });
  }
};

/**
 * Controller to get a forum post by ID
 */
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await forumService.getPostById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch post", details: err.message });
  }
};

module.exports = { createPost, getAllPosts, getPostById };

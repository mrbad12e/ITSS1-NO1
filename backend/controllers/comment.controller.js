const commentService = require("../services/comment.service");

/**
 * Controller to create a new comment
 */
const createComment = async (req, res) => {
  try {
    const { forum_id, author_id, content } = req.body;

    if (!forum_id || !author_id || !content) {
      return res
        .status(400)
        .json({ error: "forum_id, author_id, and content are required" });
    }

    const newComment = await commentService.createComment({
      forum_id,
      author_id,
      content,
    });
    res.status(201).json(newComment);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create comment", details: err.message });
  }
};

/**
 * Controller to get all comments for a specific forum post
 */
const getCommentsByForumId = async (req, res) => {
  try {
    const { forumId } = req.params;

    const comments = await commentService.getCommentsByForumId(forumId);
    res.status(200).json(comments);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch comments", details: err.message });
  }
};

module.exports = { createComment, getCommentsByForumId };

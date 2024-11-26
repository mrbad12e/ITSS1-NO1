const express = require("express");
const commentController = require("../controllers/comment.controller");

const router = express.Router();

// Route to create a new comment
router.post("/", commentController.createComment);

// Route to get all comments for a specific forum post
router.get("/:forumId", commentController.getCommentsByForumId);

module.exports = router;

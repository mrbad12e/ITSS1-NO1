const express = require("express");
const forumController = require("../controllers/forum.controller");

const router = express.Router();

// Route to create a new forum post
router.post("/", forumController.createPost);

// Route to get all forum posts
router.get("/", forumController.getAllPosts);

// Route to get a specific forum post by ID
router.get("/:id", forumController.getPostById);

module.exports = router;

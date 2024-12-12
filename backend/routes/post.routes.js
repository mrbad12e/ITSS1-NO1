const express = require("express");
const postController = require("../controllers/post.controller");

const router = express.Router();

router.post("/create", postController.createPost);

router.post("/forum-post", postController.getPostsByForumId);

module.exports = router;

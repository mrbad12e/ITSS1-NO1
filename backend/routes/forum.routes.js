const express = require("express");
const forumController = require("../controllers/forum.controller");

const router = express.Router();

router.post("/", forumController.createForum);

router.post("/my-forums", forumController.getForumsByUser);

router.post("/join-forum", forumController.joinForum);

module.exports = router;

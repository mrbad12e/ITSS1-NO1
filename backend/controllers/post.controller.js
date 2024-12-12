const { default: mongoose } = require("mongoose");
const postModel = require("../models/post.model");
const moment = require("moment-timezone");
const userModel = require("../models/user.model");

const createPost = async (req, res) => {
  const { userId, forumId, title, content } = req.body;
  if (!userId || !forumId || !title || !content) {
    return res.status(400).json({ error: "Missing information" });
  }
  await postModel.create({
    forum_id: forumId,
    title,
    content,
    created_by: userId,
  });
  return res.status(201).json({ message: "Created!" });
};

const getPostsByForumId = async (req, res) => {
  const { forumId } = req.body;

  if (!forumId) {
    return res.status(400).json({ error: "Forum ID is required" });
  }

  try {
    const posts = await postModel
      .find({ forum_id: new mongoose.Types.ObjectId(forumId) })
      .populate("created_by", "name")
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map((post) => ({
      title: post.title,
      content: post.content,
      senderName: post.created_by.name,
      createdAt: post.created_at
        ? moment(post.created_at)
            .tz("Asia/Ho_Chi_Minh")
            .format("YYYY/MM/DD HH:mm")
        : "Unknown date",
    }));

    return res.status(200).json(formattedPosts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
};

module.exports = {
  createPost,
  getPostsByForumId,
};

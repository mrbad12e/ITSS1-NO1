const postModel = require("../models/post.model");

const createPost = async (req, res) => {
  const { userId, forumId, title, content } = req.body;
  if (!userId || !forumId || !title || content) {
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

module.exports = {
  createPost,
};

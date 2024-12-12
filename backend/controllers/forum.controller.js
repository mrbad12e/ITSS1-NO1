const forumModel = require("../models/forum.model");

const createForum = async (req, res) => {
  try {
    const { name, userId, description } = req.body;
    if (!name || !userId) {
      return res.status(400).json({ error: "Missing information" });
    }

    const newPost = await forumModel.create({
      name,
      created_by: userId,
      description,
      members: [userId],
    });
    res.status(201).json(newPost);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create forum", details: err.message });
  }
};

const getForumsByUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const forums = await forumModel.find({ members: userId });

    res.status(200).json(forums);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch forums", details: err.message });
  }
};

const joinForum = async (req, res) => {
  try {
    const { userId, forumId } = req.body;

    if (!userId || !forumId) {
      return res.status(400).json({ error: "Missing userId or forumId" });
    }

    const forum = await Forum.findOneAndUpdate(
      { _id: forumId },
      { $addToSet: { members: userId } },
      { new: true }
    );

    if (!forum) {
      return res.status(404).json({ error: "No forum found!" });
    }

    res.status(200).json({ message: "Joined forum successfully", forum });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to join forum", details: err.message });
  }
};

const getForumById = async (req, res) => {
  try {
    const { forumId } = req.body;
    if (!forumId) {
      return res.status(400).json({ error: "Missing info" });
    }
    const forum = await forumModel.findById(forumId);
    if (!forum) {
      return res.status(404).json({ error: "Can not find forum" });
    }
    return res.status(200).json(forum);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createForum, getForumsByUser, joinForum, getForumById };

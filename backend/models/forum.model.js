const mongoose = require("mongoose");

const forumSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Forum", forumSchema);

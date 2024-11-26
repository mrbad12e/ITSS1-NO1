const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  schedule_time: { type: Date, required: true },
  duration_minutes: { type: Number, required: true },
  host_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recording_url: String,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Meeting", meetingSchema);

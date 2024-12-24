import mongoose from 'mongoose';
const meetingSchema = new mongoose.Schema({
    forum_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Forum',
        required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    status: {
        type: String,
        enum: ['scheduled', 'active', 'ended', 'cancelled'],
        default: 'scheduled',
    },
    room_id: { type: String, unique: true }, // For WebRTC
    type: {
        type: String,
        enum: ['forum', 'direct'],
        required: true,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    created_at: { type: Date, default: Date.now },
});

const Meeting = mongoose.model('Meeting', meetingSchema);
export default Meeting;
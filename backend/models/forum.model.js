import mongoose from 'mongoose';
const forumSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active',
    },
    settings: {
        can_members_create_events: { type: Boolean, default: false },
        can_members_create_meetings: { type: Boolean, default: false },
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    created_at: { type: Date, default: Date.now },
});

const Forum = mongoose.model('Forum', forumSchema);
export default Forum;
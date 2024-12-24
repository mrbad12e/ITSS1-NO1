import mongoose from 'mongoose';
const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    location: String,
    organizer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Add fields for:
    forum_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Forum',
        required: true,
    },
    participants: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'declined'],
                default: 'pending',
            },
        },
    ],
    status: {
        type: String,
        enum: ['scheduled', 'cancelled', 'completed'],
        default: 'scheduled',
    },
    created_at: { type: Date, default: Date.now },
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
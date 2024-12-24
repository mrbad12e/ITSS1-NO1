import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    chat_id: { type: String }, // Group messages between two users
    file_attachments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resource',
        },
    ],
    deleted_at: { type: Date },
    content: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    sent_at: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
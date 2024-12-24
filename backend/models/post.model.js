import mongoose from 'mongoose';
const postSchema = new mongoose.Schema({
    forum_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Forum',
        required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    resources: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resource',
        },
    ],
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    created_at: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);
export default Post;
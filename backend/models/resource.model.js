import mongoose from "mongoose";
const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    file_url: { type: String, required: true },
    tags: [String],
    forum_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Forum',
    },
    uploaded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    mime_type: { type: String, required: true },
    size: { type: Number, required: true },
    drive_file_id: { type: String }, // For Google Drive integration
    related_type: {
        type: String,
        enum: ['post', 'message'],
        required: true,
    },
    related_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // This could reference either Post or Message
        refPath: 'related_type',
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
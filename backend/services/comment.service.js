import Comment from '../models/comment.model';
import Post from '../models/post.model';
import Forum from '../models/forum.model';

const commentService = {
    async createComment(userId, commentData) {
        // Verify post exists and user has access
        const post = await Post.findById(commentData.post_id);
        if (!post || post.is_deleted) {
            throw new Error('Post not found');
        }

        // Check if user is member of the forum
        const forum = await Forum.findById(post.forum_id);
        if (!forum || !forum.members.includes(userId)) {
            throw new Error('Access denied');
        }

        const comment = new Comment({
            post_id: commentData.post_id,
            author_id: userId,
            content: commentData.content
        });

        return await comment.save();
    },

    async updateComment(commentId, userId, updateData) {
        const comment = await Comment.findOne({
            _id: commentId,
            author_id: userId
        });

        if (!comment) {
            throw new Error('Comment not found or unauthorized');
        }

        comment.content = updateData.content;
        return await comment.save();
    },

    async deleteComment(commentId, userId) {
        const comment = await Comment.findOne({
            _id: commentId,
            author_id: userId
        });

        if (!comment) {
            throw new Error('Comment not found or unauthorized');
        }

        await comment.deleteOne();
        return { message: 'Comment deleted successfully' };
    },

    async getPostComments(postId, userId) {
        // Verify post exists and user has access
        const post = await Post.findById(postId);
        if (!post || post.is_deleted) {
            throw new Error('Post not found');
        }

        // Check if user is member of the forum
        const forum = await Forum.findById(post.forum_id);
        if (!forum || !forum.members.includes(userId)) {
            throw new Error('Access denied');
        }

        return await Comment.find({ post_id: postId })
            .populate('author_id', 'name email profile_image')
            .sort({ created_at: -1 });
    }
};

export default commentService;
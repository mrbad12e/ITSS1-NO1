// src/actions/commentActions.js
import axios from '@/services/api';

class CommentActions {
    async createComment(commentData) {
        const response = await axios.post('/comment', commentData);
        return response.data;
    }

    async updateComment(commentId, content) {
        const response = await axios.put(`/comment/${commentId}`, { content });
        return response.data;
    }

    async deleteComment(commentId) {
        await axios.delete(`/comment/${commentId}`);
    }

    async getPostComments(postId) {
        const response = await axios.get(`/comment/post/${postId}`);
        return response.data;
    }
}

const commentActions = new CommentActions();
export default commentActions;

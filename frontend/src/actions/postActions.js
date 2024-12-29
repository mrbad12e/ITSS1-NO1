// src/actions/postActions.js
import axios from '@/services/api';

class PostActions {
    async createPost(postData) {
        const formData = new FormData();
        formData.append('title', postData.title);
        formData.append('content', postData.content);
        formData.append('forum_id', postData.forum_id);

        if (postData.files) {
            postData.files.forEach((file) => formData.append('files', file));
        }

        const response = await axios.post('/post', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    async getPost(postId) {
        const response = await axios.get(`/post/${postId}`);
        return response.data;
    }

    async getPosts(forumId) {        
        const response = await axios.get(`/post/forum/${forumId}`);
        return response.data;
    }

    async updatePost(postId, updateData) {
        const formData = new FormData();
        formData.append('title', updateData.title);
        formData.append('content', updateData.content);

        if (updateData.files) {
            updateData.files.forEach((file) => formData.append('files', file));
        }

        const response = await axios.put(`/post/${postId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    async deletePost(postId) {
        await axios.delete(`/post/${postId}`);
    }

    async getForumPosts(forumId) {
        const response = await axios.get(`/post/forum/${forumId}`);
        return response.data;
    }
}

const postActions = new PostActions();
export default postActions;

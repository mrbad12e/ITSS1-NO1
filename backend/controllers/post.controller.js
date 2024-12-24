import { validationResult } from 'express-validator';
import postService from '../services/post.service';

const PostController = {
    async createPost(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const files = req.uploadedFiles || [];
            const post = await postService.createPost(req.user.userId, req.body, files);
            res.status(201).json(post);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getPost(req, res) {
        try {
            const post = await postService.getPost(req.params.postId, req.user.userId);
            res.status(200).json(post);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    async updatePost(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const files = req.uploadedFiles || [];
            const post = await postService.updatePost(
                req.params.postId,
                req.user.userId,
                req.body,
                files
            );
            res.status(200).json(post);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async deletePost(req, res) {
        try {
            await postService.deletePost(req.params.postId, req.user.userId);
            res.status(200).json({ message: 'Post deleted successfully' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getForumPosts(req, res) {
        try {
            const posts = await postService.getForumPosts(req.params.forumId, req.user.userId);
            res.status(200).json(posts);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
};

export default PostController;
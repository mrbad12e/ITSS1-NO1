import { validationResult } from 'express-validator';
import commentService from '../services/comment.service';

const CommentController = {
    async createComment(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const comment = await commentService.createComment(req.user.userId, req.body);
            res.status(201).json(comment);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async updateComment(req, res) {
        try {
            const comment = await commentService.updateComment(
                req.params.commentId,
                req.user.userId,
                req.body
            );
            res.status(200).json(comment);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async deleteComment(req, res) {
        try {
            const result = await commentService.deleteComment(req.params.commentId, req.user.userId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getPostComments(req, res) {
        try {
            const comments = await commentService.getPostComments(req.params.postId, req.user.userId);
            res.status(200).json(comments);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
};

export default CommentController;
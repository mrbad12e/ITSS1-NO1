import express from 'express';
import CommentController from '../controllers/comment.controller';
import { commentValidation } from '../middleware/validators/forumValidator';

const router = express.Router();

// Create a comment
router.post('/', commentValidation, CommentController.createComment);

// Update a comment
router.put('/:commentId', commentValidation, CommentController.updateComment);

// Delete a comment
router.delete('/:commentId', CommentController.deleteComment);

// Get all comments for a post
router.get('/post/:postId', CommentController.getPostComments);

export default router;
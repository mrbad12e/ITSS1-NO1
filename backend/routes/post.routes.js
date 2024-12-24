import express from 'express';
import PostController from '../controllers/post.controller.js';
import { uploadMiddleware } from '../middleware/upload/fileUpload.js';
import { postValidation } from '../middleware/validators/forumValidator.js';

const router = express.Router();

// Create post with files
router.post('/',
    uploadMiddleware.multiple, // This will now properly handle multipart/form-data
    uploadMiddleware.handleMultiple,
    postValidation.createPostValidation,
    PostController.createPost
);

// Get post by id
router.get('/:postId', PostController.getPost);

// Update post
router.put('/:postId',
    uploadMiddleware.multiple,
    uploadMiddleware.handleMultiple,
    postValidation.updatePostValidation,
    PostController.updatePost
);

// Delete post
router.delete('/:postId', PostController.deletePost);

// Get all posts in a forum
router.get('/forum/:forumId', PostController.getForumPosts);

export default router;
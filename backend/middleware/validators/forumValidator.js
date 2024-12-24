// middleware/validators/forumValidator.js
import { body } from 'express-validator';

export const forumValidation = [body('name').trim().isLength({ min: 3 }), body('description').optional().trim()];

export const postValidation = {
    createPostValidation: [
        body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
        body('content').trim().notEmpty().withMessage('Content cannot be empty'),
        body('forum_id').isMongoId().withMessage('Invalid forum ID'),
    ],

    updatePostValidation: [
        body('title')
            .optional()
            .trim()
            .isLength({ min: 3, max: 200 })
            .withMessage('Title must be between 3 and 200 characters'),
        body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
    ],
};

export const commentValidation = [body('content').trim().notEmpty(), body('post_id').isMongoId()];

export const eventValidation = [
    body('title').trim().isLength({ min: 3 }),
    body('description').optional().trim(),
    body('date').isISO8601().toDate(),
    body('location').optional().trim(),
    body('forum_id').isMongoId(),
];

export const meetingValidation = [
    body('title').trim().isLength({ min: 3 }),
    body('description').optional().trim(),
    body('start_time').isISO8601().toDate(),
    body('end_time').isISO8601().toDate(),
    body('forum_id').isMongoId(),
];

export const messageValidation = [body('content').trim().notEmpty(), body('receiver_id').isMongoId()];


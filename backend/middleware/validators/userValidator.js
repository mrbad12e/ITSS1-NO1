// middleware/validators/userValidator.js
import { body } from 'express-validator';
export const loginValidation = [body('email').isEmail().normalizeEmail(), body('password').notEmpty().trim()];

export const updateUserValidation = [
    body('name').optional().trim().isLength({ min: 2 }),
    body('specialization').optional().trim(),
    body('experience_years').optional().isInt({ min: 0 }),
    body('skills').optional().isArray(),
];


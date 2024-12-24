import express from 'express';
import UserController from '../controllers/user.controller';
import verifyToken from '../middleware/auth/verifyToken';
import { loginValidation, updateUserValidation } from '../middleware/validators/userValidator';
import { uploadMiddleware } from '../middleware/upload/fileUpload';
const router = express.Router();

router.post('/login', loginValidation, UserController.login);
router.put('/profile',
    verifyToken,
    uploadMiddleware.single,
    uploadMiddleware.handleSingle,
    updateUserValidation,
    UserController.updateProfile
);

router.get('/search', verifyToken, UserController.searchUsers);
router.get('/forums/search', verifyToken, UserController.searchForums);
router.get('/forums/available', verifyToken, UserController.getAvailableForums);
router.get('/forums', verifyToken, UserController.getUserForums);
router.post('/forums/:forumId/join', verifyToken, UserController.joinForum);

export default router;
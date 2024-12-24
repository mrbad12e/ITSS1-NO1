// routes/index.js

import express from 'express';
import forumRoutes from '../routes/forum.routes';
import commentRoutes from '../routes/comment.routes';
import postRoutes from '../routes/post.routes';
import userRoutes from '../routes/user.routes';
import messageRoutes from '../routes/message.routes';
import meetingRoutes from '../routes/meeting.routes';
import verifyToken from '../middleware/auth/verifyToken';
import { sanitizers } from '../middleware/validators/sanitizers';
const router = express.Router();

// Apply sanitization to all routes
router.use(sanitizers.sanitizeBody);

router.use('/user', userRoutes);
router.use('/forums', verifyToken, forumRoutes);
router.use('/comment', verifyToken, commentRoutes);
router.use('/post', verifyToken, postRoutes);
router.use('/message', verifyToken, messageRoutes);
router.use('/meeting', verifyToken, meetingRoutes);

export default router;
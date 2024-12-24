import express from 'express';
import MessageController from '../controllers/message.controller';
import { messageValidation } from '../middleware/validators/forumValidator';

const router = express.Router();

router.post('/', messageValidation, MessageController.sendMessage);
router.get('/user/:userId', MessageController.getMessages);
router.delete('/:messageId', MessageController.deleteMessage);
router.put('/:messageId/read', MessageController.markAsRead);
router.get('/unread', MessageController.getUnreadMessages);
router.get('/chats', MessageController.getUserChats);

export default router;
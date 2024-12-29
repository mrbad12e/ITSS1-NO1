import { validationResult } from 'express-validator';
import messageService from '../services/message.service';

const MessageController = {
    async sendMessage(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const message = await messageService.sendMessage(req.user.userId, req.body);
            res.status(201).json(message);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getMessages(req, res) {
        try {
            const messages = await messageService.getMessages(req.user.userId, req.params.userId);
            res.status(200).json(messages);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    async deleteMessage(req, res) {
        try {
            const message = await messageService.deleteMessage(req.params.messageId, req.user.userId);
            res.status(200).json(message);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async markAsRead(req, res) {
        try {
            const message = await messageService.markAsRead(req.params.messageId, req.user.userId);
            res.status(200).json(message);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getUnreadMessages(req, res) {
        try {
            const messages = await messageService.getUnreadMessages(req.user.userId);
            res.status(200).json(messages);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    async getUserChats(req, res) {
        try {
            const chats = await messageService.getUserChats(req.user.userId);
            res.status(200).json(chats);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    async searchChats(req, res) {
        try {
            const results = await messageService.searchChats(req.user.userId, req.query.query);
            
            res.status(200).json(results);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

export default MessageController;
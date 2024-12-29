import Message from '../models/message.model';
import User from '../models/user.model';
import mongoose from 'mongoose';

const messageService = {
    async sendMessage(userId, messageData) {
        // Verify receiver exists
        const receiver = await User.findById(messageData.receiver_id);
        if (!receiver) {
            throw new Error('Receiver not found');
        }

        // Create a chat_id that's consistent for both users
        const chatId = [userId, messageData.receiver_id].sort().join('_');

        const message = new Message({
            sender_id: userId,
            receiver_id: messageData.receiver_id,
            content: messageData.content,
            chat_id: chatId
        });

        return await message.save();
    },

    async getMessages(userId, otherUserId) {
        // Create consistent chat_id
        const chatId = [userId, otherUserId].sort().join('_');

        return await Message.find({
            chat_id: chatId,
            deleted_at: null
        })
        .populate('sender_id', 'name email profile_image')
        .populate('receiver_id', 'name email profile_image')
        .sort({ sent_at: 1 });
    },

    async deleteMessage(messageId, userId) {
        const message = await Message.findOne({
            _id: messageId,
            sender_id: userId,
            deleted_at: null
        });

        if (!message) {
            throw new Error('Message not found or unauthorized');
        }

        message.deleted_at = new Date();
        return await message.save();
    },

    async markAsRead(messageId, userId) {
        const message = await Message.findOne({
            _id: messageId,
            receiver_id: userId,
            deleted_at: null
        });

        if (!message) {
            throw new Error('Message not found or unauthorized');
        }

        message.is_read = true;
        return await message.save();
    },

    async getUnreadMessages(userId) {
        return await Message.find({
            receiver_id: userId,
            is_read: false,
            deleted_at: null
        })
        .populate('sender_id', 'name email profile_image')
        .sort({ sent_at: -1 });
    },

    async getUserChats(userId) {
        // First get all distinct chat_ids where user is involved
        const distinctChatIds = await Message.distinct('chat_id', {
            $or: [{ sender_id: userId }, { receiver_id: userId }],
            deleted_at: null
        });
    
        // Get all chats information
        const chatsPromises = distinctChatIds.map(async (chatId) => {
            // Get the latest message for this chat
            const lastMessage = await Message.findOne({
                chat_id: chatId,
                deleted_at: null
            })
            .sort({ sent_at: -1 })
            .populate('sender_id', 'name email profile_image')
            .populate('receiver_id', 'name email profile_image');
    
            // Count unread messages
            const unreadCount = await Message.countDocuments({
                chat_id: chatId,
                receiver_id: userId,
                is_read: false,
                deleted_at: null
            });
    
            // Determine the other user
            const otherUser = lastMessage.sender_id._id.toString() === userId 
                ? lastMessage.receiver_id 
                : lastMessage.sender_id;
    
            return {
                chat_id: chatId,
                other_user: {
                    _id: otherUser._id,
                    name: otherUser.name,
                    email: otherUser.email,
                    profile_image: otherUser.profile_image
                },
                last_message: {
                    _id: lastMessage._id,
                    content: lastMessage.content,
                    sent_at: lastMessage.sent_at,
                    is_read: lastMessage.is_read,
                    sender_id: lastMessage.sender_id._id
                },
                unread_count: unreadCount
            };
        });
    
        const chats = await Promise.all(chatsPromises);
        
        // Sort by latest message
        return chats.sort((a, b) => b.last_message.sent_at - a.last_message.sent_at);
    },

    async searchChats(userId, query) {
        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { specialization: { $regex: query, $options: 'i' } }
            ]
        }).select('name email profile_image specialization');

        const chatHistory = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender_id: new mongoose.Types.ObjectId(userId) },
                        { receiver_id: new mongoose.Types.ObjectId(userId) }
                    ],
                    deleted_at: null
                }
            },
            {
                $group: {
                    _id: '$chat_id',
                    lastMessage: { $last: '$$ROOT' }
                }
            }
        ]);

        const chatMap = new Map(chatHistory.map(chat => [chat._id, chat]));

        return users.map(user => {
            const chatId = [userId, user._id.toString()].sort().join('_');
            const chatInfo = chatMap.get(chatId);
            return {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profile_image: user.profile_image,
                    specialization: user.specialization
                };
        });
    }
};

export default messageService;
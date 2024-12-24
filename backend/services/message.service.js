import Message from '../models/message.model';
import User from '../models/user.model';

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
        const messages = await Message.find({
            $or: [{ sender_id: userId }, { receiver_id: userId }],
            deleted_at: null
        })
        .populate('sender_id', 'name email profile_image')
        .populate('receiver_id', 'name email profile_image')
        .sort({ sent_at: -1 });

        // Group messages by chat_id and get latest message
        const chats = messages.reduce((acc, message) => {
            if (!acc[message.chat_id]) {
                const otherUser = message.sender_id._id.toString() === userId 
                    ? message.receiver_id 
                    : message.sender_id;
                
                acc[message.chat_id] = {
                    chat_id: message.chat_id,
                    other_user: otherUser,
                    last_message: message,
                    unread_count: message.receiver_id._id.toString() === userId && !message.is_read ? 1 : 0
                };
            } else if (message.receiver_id._id.toString() === userId && !message.is_read) {
                acc[message.chat_id].unread_count += 1;
            }
            return acc;
        }, {});

        return Object.values(chats);
    }
};

export default messageService;
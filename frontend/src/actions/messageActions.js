// src/actions/messageActions.js
import axios from '@/services/api';
import socketService from '@/services/socketService';

class MessageActions {
    constructor() {
        this.messageListeners = new Set();
        this.chatListeners = new Set();
        this.setupSocketListeners();
    }

    setupSocketListeners() {
        socketService.onMessage((type, data) => {
            switch (type) {
                case 'newMessage':
                    this.handleNewMessage(data);
                    break;
                case 'messagesRead':
                    this.handleMessagesRead(data);
                    break;
                case 'messageSent':
                    this.handleMessageSent(data);
                    break;
                case 'messageError':
                    console.error('Message error:', data);
                    break;
            }
        });
    }

    // Fetch initial chats
    async fetchChats() {
        try {
            const response = await axios.get('/message/chats');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch chats:', error);
            throw error;
        }
    }

    // Fetch messages for a specific user
    async fetchMessages(userId) {
        try {
            const response = await axios.get(`/message/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            throw error;
        }
    }

    // Send a message
    async sendMessage(receiverId, content, tempId = Date.now().toString()) {
        try {
            // Notify listeners of temporary message
            const profile = JSON.parse(localStorage.getItem('profile') || '{}');
            const tempMessage = {
                _id: tempId,
                content: content.trim(),
                sender_id: {
                    _id: profile._id,
                    name: profile.name,
                    profile_image: profile.profile_image
                },
                receiver_id: receiverId,
                sent_at: new Date().toISOString(),
                is_read: false,
                isTemp: true
            };

            // Notify message listeners of temporary message
            this.messageListeners.forEach(listener => {
                listener('newMessage', { message: tempMessage });
            });

            // Send message through socket
            const response = await socketService.sendMessage(receiverId, content.trim());
            
            // Update the temporary message with the real one
            this.messageListeners.forEach(listener => {
                listener('messageConfirmed', { 
                    tempId,
                    confirmedMessage: response.message 
                });
            });

            return response;
        } catch (error) {
            // Remove temporary message on error
            this.messageListeners.forEach(listener => {
                listener('messageError', { tempId, error });
            });
            throw error;
        }
    }

    // Mark messages as read
    async markMessagesAsRead(senderId) {
        try {
            await socketService.markMessagesAsRead(senderId);
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
            throw error;
        }
    }

    // Handle new message from socket
    handleNewMessage(data) {
        const profile = JSON.parse(localStorage.getItem('profile') || '{}');
        const { message, sender } = data;

        // Update message listeners
        this.messageListeners.forEach(listener => {
            listener('newMessage', {
                message: {
                    ...message,
                    sender_id: message.sender_id === profile._id ? {
                        _id: profile._id,
                        name: profile.name,
                        profile_image: profile.profile_image
                    } : {
                        _id: sender._id,
                        name: sender.name,
                        profile_image: sender.profile_image
                    }
                }
            });
        });

        // Update chat listeners
        this.chatListeners.forEach(listener => {
            listener('updateChat', { message, sender });
        });
    }

    // Handle messages read event
    handleMessagesRead(data) {
        this.chatListeners.forEach(listener => {
            listener('messagesRead', data);
        });
    }

    // Handle message sent confirmation
    handleMessageSent(data) {
        this.messageListeners.forEach(listener => {
            listener('messageSent', data);
        });
    }

    // Subscribe to message updates
    onMessage(callback) {
        this.messageListeners.add(callback);
        return () => this.messageListeners.delete(callback);
    }

    // Subscribe to chat updates
    onChatUpdate(callback) {
        this.chatListeners.add(callback);
        return () => this.chatListeners.delete(callback);
    }

    // Initialize socket connection
    async connect() {
        try {
            await socketService.connect();
        } catch (error) {
            console.error('Failed to connect to socket:', error);
            throw error;
        }
    }

    // Cleanup
    cleanup() {
        this.messageListeners.clear();
        this.chatListeners.clear();
    }
}

// Create a singleton instance
const messageActions = new MessageActions();
export default messageActions;
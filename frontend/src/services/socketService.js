// src/services/socketService.js
import { io } from 'socket.io-client';
import { API_URL } from '@/utils/constants';
import axios from '@/services/api';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.messageCallbacks = new Set();
        this.connectionCallbacks = new Set();
        this.connecting = false;
    }

    async getSocketToken() {
        try {
            // Make a request to get a socket token
            const response = await axios.get('/user/socket');            
            return response.data.token;
        } catch (error) {
            console.error('Failed to get socket token:', error);
            throw error;
        }
    }

    async connect() {
        // Prevent multiple simultaneous connection attempts
        if (this.connecting) return;
        if (this.socket?.connected) return;
    
        try {
            this.connecting = true;
            const token = await this.getSocketToken();
    
            // Disconnect existing socket if any
            if (this.socket) {
                this.socket.disconnect();
            }
            
            this.socket = io(API_URL, {
                auth: { token },
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });
    
            this.setupConnectionHandlers();
            this.setupMessageHandlers();
    
            // Add automatic reconnection on connection lost
            this.socket.on('disconnect', () => {
                console.log('Socket disconnected, attempting to reconnect...');
                setTimeout(() => {
                    if (!this.socket.connected) {
                        this.connect();
                    }
                }, 2000);
            });
    
        } catch (error) {
            console.error('Socket connection error:', error);
            this.connectionCallbacks.forEach(callback => 
                callback(false, error)
            );
        } finally {
            this.connecting = false;
        }
    }

    setupConnectionHandlers() {
        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.connectionCallbacks.forEach(callback => callback(true));
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.connectionCallbacks.forEach(callback => callback(false, error));
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.connectionCallbacks.forEach(callback => callback(false));
        });
    }

    setupMessageHandlers() {
        if (!this.socket) return;
    
        this.socket.on('newMessage', (data) => {
            console.log('New message received in socket service:', data);
            this.messageCallbacks.forEach(callback => callback('newMessage', data));
        });
    
        this.socket.on('messagesRead', (data) => {
            console.log('Messages read:', data);
            this.messageCallbacks.forEach(callback => callback('messagesRead', data));
        });
    
        this.socket.on('messageSent', (data) => {
            console.log('Message sent confirmation:', data);
            this.messageCallbacks.forEach(callback => callback('messageSent', data));
        });
    
        this.socket.on('messageError', (error) => {
            console.error('Message error:', error);
            this.messageCallbacks.forEach(callback => callback('messageError', error));
        });
    }

    // Send a message
    async sendMessage(receiverId, content) {
        if (!this.socket?.connected) {
            await this.connect();
        }
    
        return new Promise((resolve, reject) => {
            const messageData = {
                receiver_id: receiverId,
                content: content.trim()
            };
    
            const onMessageSent = (response) => {
                console.log('Message sent response:', response);
                this.socket.off('messageSent', onMessageSent);
                this.socket.off('messageError', onMessageError);
                resolve(response);
            };
    
            const onMessageError = (error) => {
                console.error('Error sending message:', error);
                this.socket.off('messageSent', onMessageSent);
                this.socket.off('messageError', onMessageError);
                reject(error);
            };
    
            this.socket.once('messageSent', onMessageSent);
            this.socket.once('messageError', onMessageError);
    
            console.log('Sending message:', messageData);
            this.socket.emit('sendMessage', messageData);
        });
    }

    // Mark messages as read
    async markMessagesAsRead(senderId) {
        if (!this.socket?.connected) {
            await this.connect();
        }
        
        if (senderId) {
            this.socket.emit('markMessagesRead', { sender_id: senderId });
        }
    }

    onMessage(callback) {
        this.messageCallbacks.add(callback);
        return () => this.messageCallbacks.delete(callback);
    }

    onConnectionChange(callback) {
        this.connectionCallbacks.add(callback);
        return () => this.connectionCallbacks.delete(callback);
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        return () => this.listeners.get(event)?.delete(callback);
    }

    emit(event, data) {
        if (!this.socket?.connected) {
            throw new Error('Socket not connected');
        }
        this.socket.emit(event, data);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.messageCallbacks.clear();
        this.connectionCallbacks.clear();
        this.listeners.clear();
    }
}

const socketService = new SocketService();
export default socketService;
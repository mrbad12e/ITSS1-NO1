// services/socket.service.js
/* This is the backend service that handles socket connections and messaging between users. 
It uses the Socket.IO library to create a WebSocket server that allows real-time communication between clients. 
The service also handles video calls by creating rooms for participants to join and exchange signals.
DO NOT MODIFY THIS FILE
*/
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/message.model';
import Meeting from '../models/meeting.model';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

class SocketService {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: true,
                methods: ["GET", "POST"],
                credentials: true,
                transports: ['websocket', 'polling']
            }
        });
        
        this.rooms = new Map(); // room_id -> { peers }
        this.userSocketMap = new Map(); // userId -> socket.id
        this.activeChannels = new Map(); // channelName -> { users, startTime }

        this.init();
    }

    init() {
        // Set up authentication middleware
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    throw new Error('Authentication token required');
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.user = { id: decoded.userId, email: decoded.email };
                next();
            } catch (error) {
                next(new Error('Authentication failed'));
            }
        });

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Socket connected:', socket.id);
            
            // Store socket reference for user
            this.userSocketMap.set(socket.user.id, socket.id);
            console.log('User socket mapped:', socket.user.id, '->', socket.id);

            // Handle video call events
            socket.on('requestVideoCall', async (data) => {
                console.log('Video call requested:', data);
                try {
                    const { receiverId } = data;
                    const channelName = this.generateChannelName(socket.user.id, receiverId);
                    console.log('Generated channel name:', channelName);
                    
                    // Generate token
                    const token = this.generateAgoraToken(channelName, socket.user.id);
                    console.log('Generated token for caller');

                    // Store channel information
                    this.activeChannels.set(channelName, {
                        users: [socket.user.id, receiverId],
                        startTime: Date.now()
                    });
                    console.log('Channel info stored');

                    // Notify the receiver
                    const receiverSocketId = this.userSocketMap.get(receiverId);
                    console.log('Receiver socket ID:', receiverSocketId);
                    
                    if (receiverSocketId) {
                        console.log('Emitting incomingCall to receiver');
                        this.io.to(receiverSocketId).emit('incomingCall', {
                            callerId: socket.user.id,
                            channelName,
                            token
                        });
                    } else {
                        console.log('Receiver not found or offline');
                        socket.emit('callError', { 
                            error: 'Receiver is offline' 
                        });
                        return;
                    }

                    // Send token to caller
                    console.log('Emitting token to caller');
                    socket.emit('callTokenGenerated', {
                        channelName,
                        token
                    });

                } catch (error) {
                    console.error('Error in requestVideoCall:', error);
                    socket.emit('callError', { error: error.message });
                }
            });

            // Test event handler
            socket.on('test', (data) => {
                console.log('Test event received:', data);
                socket.emit('testResponse', { received: true });
            });

            socket.on('acceptVideoCall', async (data) => {
                try {
                    const { channelName, callerId } = data;
                    const token = this.generateAgoraToken(channelName, socket.user.id);

                    // Notify the caller
                    const callerSocketId = this.userSocketMap.get(callerId);
                    if (callerSocketId) {
                        this.io.to(callerSocketId).emit('callAccepted', {
                            channelName,
                            accepterId: socket.user.id
                        });
                    }

                    // Send token to accepter
                    socket.emit('callTokenGenerated', {
                        channelName,
                        token
                    });

                } catch (error) {
                    socket.emit('callError', { error: error.message });
                }
            });

            socket.on('endVideoCall', (data) => {
                const { channelName } = data;
                const channel = this.activeChannels.get(channelName);
                
                if (channel) {
                    // Notify all users in the channel
                    channel.users.forEach(userId => {
                        const userSocketId = this.userSocketMap.get(userId);
                        if (userSocketId) {
                            this.io.to(userSocketId).emit('callEnded', { channelName });
                        }
                    });

                    // Clean up channel
                    this.activeChannels.delete(channelName);
                }
            });

            // Handle messaging (your existing message handling code)
            this.setupMessageHandlers(socket);

            // Handle disconnection
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    generateChannelName(userId1, userId2) {
        // Create a consistent channel name regardless of user order
        return [userId1, userId2].sort().join('_');
    }

    generateAgoraToken(channelName, uid) {
        const appID = process.env.AGORA_APP_ID;
        const appCertificate = process.env.AGORA_APP_CERTIFICATE;
        const role = RtcRole.PUBLISHER;
        
        const expirationTimeInSeconds = 3600; // 1 hour
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
        
        const token = RtcTokenBuilder.buildTokenWithUid(
            appID,
            appCertificate,
            channelName,
            uid,
            role,
            privilegeExpiredTs
        );

        return token;
    }

    setupMessageHandlers(socket) {
        // Send a message
        socket.on('sendMessage', async (data) => {
            try {
                const message = new Message({
                    sender_id: socket.user.id,
                    receiver_id: data.receiver_id,
                    content: data.content,
                    chat_id: [socket.user.id, data.receiver_id].sort().join('_'),
                    sent_at: new Date(),
                    is_read: false
                });
        
                await message.save();
                
                // Populate sender details
                await message.populate('sender_id', 'name email profile_image specialization');
                
                const messageData = {
                    message: {
                        _id: message._id,
                        content: message.content,
                        sender_id: message.sender_id._id, // Just send the ID
                        receiver_id: message.receiver_id,
                        chat_id: message.chat_id,
                        sent_at: message.sent_at,
                        is_read: message.is_read
                    },
                    sender: {
                        _id: message.sender_id._id,
                        name: message.sender_id.name,
                        email: message.sender_id.email,
                        profile_image: message.sender_id.profile_image,
                        specialization: message.sender_id.specialization
                    }
                };
        
                // Send to receiver if online
                const receiverSocketId = this.userSocketMap.get(data.receiver_id);
                if (receiverSocketId) {
                    this.io.to(receiverSocketId).emit('newMessage', messageData);
                }
        
                // Send confirmation back to sender
                socket.emit('messageSent', messageData);
        
            } catch (error) {
                socket.emit('messageError', { error: error.message });
            }
        });
    
        // Mark messages as read
        socket.on('markMessagesRead', async (data) => {
            try {
                const chatId = [socket.user.id, data.sender_id].sort().join('_');
                await Message.updateMany(
                    {
                        chat_id: chatId,
                        receiver_id: socket.user.id,
                        is_read: false
                    },
                    { is_read: true }
                );
    
                // Notify the sender that their messages were read
                const senderSocketId = this.userSocketMap.get(data.sender_id);
                if (senderSocketId) {
                    this.io.to(senderSocketId).emit('messagesRead', {
                        reader_id: socket.user.id,
                        chat_id: chatId
                    });
                }
            } catch (error) {
                socket.emit('messageError', { error: error.message });
            }
        });
    }

    setupVideoCallHandlers(socket) {
        // Handle call initiation
        socket.on('startCall', async (data) => {
            try {
                const { receiverId } = data;
                const callId = `${socket.user.id}_${receiverId}_${Date.now()}`;
                
                // Check if receiver is already in a call
                if (this.userCallMap.has(receiverId)) {
                    throw new Error('User is already in a call');
                }

                // Create new call entry
                this.calls.set(callId, {
                    caller: socket.user.id,
                    receiver: receiverId,
                    status: 'ringing',
                    startTime: Date.now()
                });

                // Map users to call
                this.userCallMap.set(socket.user.id, callId);
                this.userCallMap.set(receiverId, callId);

                // Notify receiver
                const receiverSocketId = this.userSocketMap.get(receiverId);
                if (receiverSocketId) {
                    this.io.to(receiverSocketId).emit('incomingCall', {
                        callId,
                        caller: socket.user
                    });
                } else {
                    throw new Error('Receiver is offline');
                }

                socket.emit('callStarted', { callId });

            } catch (error) {
                socket.emit('callError', { error: error.message });
            }
        });

        // Handle call acceptance
        socket.on('acceptCall', async (data) => {
            try {
                const { callId } = data;
                const call = this.calls.get(callId);

                if (!call || call.status !== 'ringing') {
                    throw new Error('Invalid call or call status');
                }

                // Update call status
                call.status = 'connected';
                this.calls.set(callId, call);

                // Notify caller
                const callerSocketId = this.userSocketMap.get(call.caller);
                if (callerSocketId) {
                    this.io.to(callerSocketId).emit('callAccepted', { callId });
                }

            } catch (error) {
                socket.emit('callError', { error: error.message });
            }
        });

        // Handle call rejection/end
        socket.on('endCall', async (data) => {
            try {
                const { callId } = data;
                const call = this.calls.get(callId);

                if (!call) {
                    throw new Error('Call not found');
                }

                // Clean up call data
                this.calls.delete(callId);
                this.userCallMap.delete(call.caller);
                this.userCallMap.delete(call.receiver);

                // Notify both parties
                const callerSocketId = this.userSocketMap.get(call.caller);
                const receiverSocketId = this.userSocketMap.get(call.receiver);

                if (callerSocketId) {
                    this.io.to(callerSocketId).emit('callEnded', { callId });
                }
                if (receiverSocketId) {
                    this.io.to(receiverSocketId).emit('callEnded', { callId });
                }

            } catch (error) {
                socket.emit('callError', { error: error.message });
            }
        });

        // Handle WebRTC signaling
        socket.on('signal', async (data) => {
            try {
                const { callId, signal } = data;
                const call = this.calls.get(callId);

                if (!call) {
                    throw new Error('Call not found');
                }

                // Determine the recipient
                const recipientId = call.caller === socket.user.id ? call.receiver : call.caller;
                const recipientSocketId = this.userSocketMap.get(recipientId);

                if (recipientSocketId) {
                    this.io.to(recipientSocketId).emit('signal', {
                        callId,
                        signal,
                        from: socket.user.id
                    });
                }

            } catch (error) {
                socket.emit('callError', { error: error.message });
            }
        });
    
    }

    handlePeerLeave(socket, roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.peers.delete(socket.id);
            socket.leave(roomId);

            socket.to(roomId).emit('peerLeft', {
                peerId: socket.id,
                userId: socket.user.id
            });

            if (room.peers.size === 0) {
                this.rooms.delete(roomId);
            }
        }
    }

    handleDisconnect(socket) {
        // Clean up other socket data
        this.userSocketMap.delete(socket.user.id);
    }
}

export default SocketService;
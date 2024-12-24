// services/socket.service.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/message.model';
import Meeting from '../models/meeting.model';
import mediasoup from 'mediasoup';

class SocketService {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: true,
                credentials: true
            }
        });
        
        this.workers = [];
        this.rooms = new Map(); // room_id -> { router, peers }
        this.peers = new Map(); // socket.id -> { socket, user, transports, producers, consumers }
        this.userSocketMap = new Map(); // userId -> socket.id

        this.init();
    }

    async init() {
        // Initialize mediasoup workers (one per CPU core)
        const numWorkers = Object.keys(require('os').cpus()).length;
        for (let i = 0; i < numWorkers; i++) {
            const worker = await mediasoup.createWorker({
                logLevel: 'warn',
                rtcMinPort: 10000 + (i * 100),
                rtcMaxPort: 10099 + (i * 100),
            });
            this.workers.push(worker);
        }

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
            console.log(`User connected: ${socket.user.id}`);
            
            // Store socket reference for user
            this.userSocketMap.set(socket.user.id, socket.id);

            // Initialize peer data structure
            this.peers.set(socket.id, {
                socket,
                user: socket.user,
                transports: new Map(),
                producers: new Map(),
                consumers: new Map()
            });

            // Handle messaging
            this.setupMessageHandlers(socket);
            
            // Handle video calls
            this.setupVideoCallHandlers(socket);

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.user.id}`);
                this.handleDisconnect(socket);
            });
        });
    }

    setupMessageHandlers(socket) {
        // Send a message
        socket.on('sendMessage', async (data) => {
            try {
                const message = new Message({
                    sender_id: socket.user.id,
                    receiver_id: data.receiver_id,
                    content: data.content,
                    chat_id: [socket.user.id, data.receiver_id].sort().join('_')
                });

                await message.save();

                // Send to receiver if online
                const receiverSocketId = this.userSocketMap.get(data.receiver_id);
                if (receiverSocketId) {
                    this.io.to(receiverSocketId).emit('newMessage', {
                        message,
                        sender: socket.user
                    });
                }

                // Confirm to sender
                socket.emit('messageSent', { message });
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

                // Notify the sender that messages were read
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
        socket.on('joinRoom', async (data, callback) => {
            try {
                const meeting = await Meeting.findOne({
                    _id: data.meeting_id,
                    status: 'active',
                    participants: socket.user.id
                });

                if (!meeting) {
                    throw new Error('Meeting not found or not authorized');
                }

                // Create room if it doesn't exist
                if (!this.rooms.has(meeting.room_id)) {
                    const router = await this.createRouter();
                    this.rooms.set(meeting.room_id, {
                        router,
                        peers: new Set()
                    });
                }

                const room = this.rooms.get(meeting.room_id);
                room.peers.add(socket.id);

                // Join socket.io room
                socket.join(meeting.room_id);

                // Get Router RTP Capabilities
                const rtpCapabilities = room.router.rtpCapabilities;

                callback({ rtpCapabilities });

                // Notify others in the room
                socket.to(meeting.room_id).emit('peerJoined', {
                    peerId: socket.id,
                    userId: socket.user.id
                });
            } catch (error) {
                callback({ error: error.message });
            }
        });

        socket.on('createWebRtcTransport', async (data, callback) => {
            try {
                const room = this.rooms.get(data.room_id);
                if (!room) {
                    throw new Error('Room not found');
                }

                const transport = await room.router.createWebRtcTransport({
                    listenIps: [
                        {
                            ip: process.env.MEDIASOUP_LISTEN_IP || '127.0.0.1',
                            announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP
                        }
                    ],
                    enableUdp: true,
                    enableTcp: true,
                    preferUdp: true,
                });

                this.peers.get(socket.id).transports.set(transport.id, transport);

                callback({
                    id: transport.id,
                    iceParameters: transport.iceParameters,
                    iceCandidates: transport.iceCandidates,
                    dtlsParameters: transport.dtlsParameters,
                });
            } catch (error) {
                callback({ error: error.message });
            }
        });

        socket.on('connectWebRtcTransport', async (data, callback) => {
            const { transportId, dtlsParameters } = data;
            const transport = peer.transports.get(transportId);

            if (!transport) {
                return callback({ error: 'transport not found' });
            }

            try {
                await transport.connect({ dtlsParameters });
                callback({ connected: true });
            } catch (error) {
                callback({ error: error.message });
            }
        });

        socket.on('produce', async (data, callback) => {
            const { room_id, transportId, kind, rtpParameters } = data;
            const transport = peer.transports.get(transportId);

            if (!transport) {
                return callback({ error: 'transport not found' });
            }

            try {
                const producer = await transport.produce({
                    kind,
                    rtpParameters
                });

                peer.producers.set(producer.id, producer);

                // Inform other peers in the room about new producer
                socket.to(room_id).emit('newProducer', {
                    producerId: producer.id,
                    peerId: socket.id,
                    kind
                });

                callback({ id: producer.id });
            } catch (error) {
                callback({ error: error.message });
            }
        });

        socket.on('consume', async (data, callback) => {
            const { room_id, transportId, producerId, rtpCapabilities } = data;
            const room = this.rooms.get(room_id);
            const transport = peer.transports.get(transportId);

            if (!transport) {
                return callback({ error: 'transport not found' });
            }

            try {
                const consumer = await transport.consume({
                    producerId,
                    rtpCapabilities,
                    paused: true // Begin paused, resume after callback
                });

                peer.consumers.set(consumer.id, consumer);

                callback({
                    id: consumer.id,
                    producerId,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters
                });

                await consumer.resume();
            } catch (error) {
                callback({ error: error.message });
            }
        });

        socket.on('leaveRoom', async (data) => {
            const { room_id } = data;
            this.handlePeerLeave(socket.id, room_id);
        });

        socket.on('disconnect', () => {
            // Clean up all rooms this peer was in
            for (const room_id of peer.rooms) {
                this.handlePeerLeave(socket.id, room_id);
            }
            this.peers.delete(socket.id);
        });
    }

    async createRouter() {
        const worker = this.workers[Math.floor(Math.random() * this.workers.length)];
        const mediaCodecs = [
            {
                kind: 'audio',
                mimeType: 'audio/opus',
                clockRate: 48000,
                channels: 2
            },
            {
                kind: 'video',
                mimeType: 'video/VP8',
                clockRate: 90000,
                parameters: {
                    'x-google-start-bitrate': 1000
                }
            },
            {
                kind: 'video',
                mimeType: 'video/H264',
                clockRate: 90000,
                parameters: {
                    'packetization-mode': 1,
                    'profile-level-id': '42e01f',
                    'level-asymmetry-allowed': 1
                }
            }
        ];

        return await worker.createRouter({ mediaCodecs });
    }

    handleDisconnect(socket) {
        // Clean up user mapping
        this.userSocketMap.delete(socket.user.id);

        // Clean up peer data
        const peer = this.peers.get(socket.id);
        if (peer) {
            // Close all transports (which also closes producers and consumers)
            for (const [, transport] of peer.transports) {
                transport.close();
            }
            this.peers.delete(socket.id);
        }

        // Clean up rooms
        for (const [roomId, room] of this.rooms) {
            if (room.peers.has(socket.id)) {
                room.peers.delete(socket.id);
                
                // Notify others in the room
                socket.to(roomId).emit('peerLeft', {
                    peerId: socket.id,
                    userId: socket.user.id
                });

                // If room is empty, close and delete it
                if (room.peers.size === 0) {
                    room.router.close();
                    this.rooms.delete(roomId);
                }
            }
        }
    }
}

export default SocketService;
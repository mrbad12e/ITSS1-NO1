// src/services/videoCallService.js
import AgoraRTC from 'agora-rtc-sdk-ng';
import socketService from './socketService';
import { AGORA_APP_ID } from '@/utils/constants';

class VideoCallService {
    constructor() {
        this.client = AgoraRTC.createClient({ 
            mode: 'rtc', 
            codec: 'vp8'
        });
        
        this.localAudioTrack = null;
        this.localVideoTrack = null;
        this.remoteUsers = new Map();
        this.listeners = new Set();
        this.currentChannel = null;

        // Initialize socket listeners
        this.setupSocketListeners();
        
        // Initialize Agora event listeners
        this.setupClientEvents();
    }

    setupSocketListeners() {
        // Direct socket access
        const socket = socketService.socket;
        if (!socket) {
            console.error('❌ No socket connection available');
            return;
        }

        // Remove existing listeners
        socket.off('incomingCall');
        socket.off('callTokenGenerated');
        socket.off('callAccepted');
        socket.off('callEnded');
        socket.off('callError');

        // Set up new listeners
        socket.on('incomingCall', (data) => {
            console.log('👋 Incoming call received:', data);
            this.notifyListeners('incomingCall', data);
        });

        socket.on('callTokenGenerated', async (data) => {
            console.log('🎟 Call token received:', data);
            const { channelName, token } = data;
            
            if (!channelName || !token) {
                console.error('❌ Invalid token data received:', data);
                return;
            }

            try {
                // Join the channel with the received token
                const profile = JSON.parse(localStorage.getItem('profile') || '{}');
                const uid = profile._id;

                console.log('🔑 Joining with token:', { channelName, token, uid });
                
                await this.client.join(AGORA_APP_ID, channelName, token, uid);
                console.log('✅ Joined channel successfully');

                // Publish local tracks if they exist
                if (this.localAudioTrack && this.localVideoTrack) {
                    await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
                    console.log('✅ Published local tracks');
                } else {
                    console.error('❌ No local tracks available');
                }

                this.currentChannel = channelName;
            } catch (error) {
                console.error('❌ Error joining channel:', error);
                this.notifyListeners('error', error);
            }
        });

        socket.on('callAccepted', (data) => {
            console.log('✅ Call accepted:', data);
            this.notifyListeners('callAccepted', data);
        });

        socket.on('callError', (data) => {
            console.error('⚠️ Call error:', data);
            this.notifyListeners('error', data);
        });

        console.log('🎧 Socket listeners initialized on socket:', socket.id);
    }

    setupClientEvents() {
        this.client.on('connection-state-change', (curState, prevState) => {
            console.log('🔄 Connection state:', prevState, '->', curState);
        });

        this.client.on('user-published', async (user, mediaType) => {
            console.log('📡 Remote user published:', user.uid, mediaType);
            try {
                await this.client.subscribe(user, mediaType);
                console.log('✅ Subscribed to remote user:', mediaType);

                if (mediaType === 'video') {
                    this.remoteUsers.set(user.uid, user);
                    this.notifyListeners('remoteStream', user.videoTrack);
                }
                if (mediaType === 'audio') {
                    user.audioTrack?.play();
                }
            } catch (error) {
                console.error('❌ Error subscribing to remote user:', error);
            }
        });

        this.client.on('user-unpublished', (user, mediaType) => {
            console.log('🔌 User unpublished:', user.uid, mediaType);
            if (mediaType === 'video') {
                this.remoteUsers.delete(user.uid);
                this.notifyListeners('remoteStreamRemoved', user.uid);
            }
        });
    }

    async startCall(receiverId) {
        try {
            console.log('📞 Starting call to:', receiverId);
            // Initialize tracks first
            await this.initializeLocalTracks();
            // Then request the call
            socketService.socket?.emit('requestVideoCall', { receiverId });
        } catch (error) {
            console.error('❌ Error starting call:', error);
            this.notifyListeners('error', error);
        }
    }

    async initializeLocalTracks() {
        try {
            console.log('🎥 Initializing local tracks...');
            const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
            this.localAudioTrack = audioTrack;
            this.localVideoTrack = videoTrack;
            console.log('✅ Local tracks initialized');
            this.notifyListeners('localStream', videoTrack);
            return [audioTrack, videoTrack];
        } catch (error) {
            console.error('❌ Error initializing tracks:', error);
            throw error;
        }
    }

    async joinChannel(channelName, token) {
        console.log('🔗 Joining channel:', channelName);
        try {
            const profile = JSON.parse(localStorage.getItem('profile') || '{}');
            const uid = profile._id;

            await this.client.join(AGORA_APP_ID, channelName, token, uid);
            console.log('✅ Joined channel successfully');

            if (!this.localAudioTrack || !this.localVideoTrack) {
                await this.initializeLocalTracks();
            }

            await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
            console.log('✅ Published local tracks');

            this.currentChannel = channelName;
        } catch (error) {
            console.error('Error joining channel:', error);
            this.notifyListeners('error', {
                message: 'Failed to join video call',
                details: error.message
            });
            throw error;
        }
    }

    async endCall() {
        console.log('📞 Ending call');
        try {
            if (this.currentChannel) {
                socketService.socket?.emit('endVideoCall', { channelName: this.currentChannel });
            }

            if (this.localAudioTrack) {
                this.localAudioTrack.close();
                this.localAudioTrack = null;
            }
            if (this.localVideoTrack) {
                this.localVideoTrack.close();
                this.localVideoTrack = null;
            }

            await this.client?.leave();
            this.remoteUsers.clear();
            this.currentChannel = null;
            
            this.notifyListeners('callEnded');
            console.log('✅ Call ended successfully');
        } catch (error) {
            console.error('Error ending call:', error);
            this.notifyListeners('error', error);
        }
    }

    toggleAudio() {
        if (this.localAudioTrack) {
            this.localAudioTrack.setEnabled(!this.localAudioTrack.enabled);
            return this.localAudioTrack.enabled;
        }
        return false;
    }

    toggleVideo() {
        if (this.localVideoTrack) {
            this.localVideoTrack.setEnabled(!this.localVideoTrack.enabled);
            return this.localVideoTrack.enabled;
        }
        return false;
    }

    onCallEvent(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notifyListeners(event, data) {
        this.listeners.forEach(listener => listener(event, data));
    }
}

export default new VideoCallService();
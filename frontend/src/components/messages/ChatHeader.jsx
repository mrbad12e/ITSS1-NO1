// src/components/message/ChatHeader.jsx
import React, { useState, useEffect } from "react";
import ProfileImage from "../common/ProfileImage";
import VideoCallButton from "../common/VideoCallButton";
import VideoCallInterface from "../common/VideoCallInterface";
import videoCallService from "@/services/videoCallService";
import { toast } from '@/hooks/use-toast';

const ChatHeader = ({ chat }) => {
    const [isInCall, setIsInCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callerId, setCallerId] = useState(null);
    const [channelName, setChannelName] = useState(null);

    useEffect(() => {
        console.log('🎧 Setting up call event listeners');
        const unsubscribe = videoCallService.onCallEvent((event, data) => {
            console.log('📱 Call event received:', event, data);
            
            switch (event) {
                case 'incomingCall':
                    console.log('📞 Incoming call from:', data.callerId);
                    setIncomingCall(true);
                    setCallerId(data.callerId);
                    setChannelName(data.channelName);
                    break;
                    
                case 'localStream':
                    console.log('🎥 Local stream ready');
                    setLocalStream(data);
                    setIsInCall(true);
                    break;
                    
                case 'remoteStream':
                    console.log('📡 Remote stream connected');
                    setRemoteStream(data);
                    break;
                    
                case 'remoteStreamRemoved':
                    console.log('🔌 Remote stream removed');
                    setRemoteStream(null);
                    break;

                case 'callEnded':
                    console.log('❌ Call ended');
                    handleCallEnded();
                    break;
                    
                case 'error':
                    console.error('⚠️ Call error:', data);
                    handleCallError(data);
                    break;
            }
        });

        return () => {
            console.log('🧹 Cleaning up call event listeners');
            unsubscribe();
            if (isInCall) {
                videoCallService.endCall();
            }
        };
    }, [isInCall]);

    const handleStartCall = async () => {
        console.log('📞 Starting call to:', chat.other_user._id);
        try {
            toast({
                title: "Starting call",
                description: "Initializing video connection..."
            });
            await videoCallService.startCall(chat.other_user._id);
        } catch (error) {
            handleCallError(error);
        }
    };

    const handleAcceptCall = async () => {
        console.log('✅ Accepting call from:', callerId);
        try {
            toast({
                title: "Accepting call",
                description: "Connecting to video call..."
            });
            await videoCallService.acceptCall(callerId, channelName);
            setIncomingCall(false);
        } catch (error) {
            handleCallError(error);
        }
    };

    const handleRejectCall = () => {
        console.log('❌ Rejecting call');
        videoCallService.endCall();
        setIncomingCall(false);
        setCallerId(null);
        setChannelName(null);
        toast({
            title: "Call rejected",
            description: "You rejected the video call"
        });
    };

    const handleEndCall = () => {
        console.log('📞 Ending call');
        videoCallService.endCall();
        handleCallEnded();
        toast({
            title: "Call ended",
            description: "Video call has ended"
        });
    };

    const handleCallEnded = () => {
        console.log('🧹 Cleaning up call state');
        setIsInCall(false);
        setIncomingCall(false);
        setLocalStream(null);
        setRemoteStream(null);
        setCallerId(null);
        setChannelName(null);
    };

    const handleCallError = (error) => {
        console.error('⚠️ Call error:', error);
        toast({
            variant: "destructive",
            title: "Call Error",
            description: error.message || "Something went wrong with the call"
        });
        handleCallEnded();
    };

    if (!chat) return null;

    return (
        <>
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ProfileImage 
                        src={chat.other_user.profile_image} 
                        alt={chat.other_user.name} 
                        size="md" 
                    />
                    <div>
                        <h2 className="font-medium">{chat.other_user.name}</h2>
                        <p className="text-sm text-muted-foreground">
                            {chat.other_user.specialization}
                        </p>
                    </div>
                </div>

                <VideoCallButton
                    isInCall={isInCall}
                    incomingCall={incomingCall}
                    onStartCall={handleStartCall}
                    onEndCall={handleEndCall}
                    onAcceptCall={handleAcceptCall}
                    onRejectCall={handleRejectCall}
                    receiverName={chat.other_user.name}
                />
            </div>

            {isInCall && (
                <VideoCallInterface
                    localStream={localStream}
                    remoteStream={remoteStream}
                    onEndCall={handleEndCall}
                    onToggleAudio={() => videoCallService.toggleAudio()}
                    onToggleVideo={() => videoCallService.toggleVideo()}
                />
            )}
        </>
    );
};

export default ChatHeader;
// src/components/common/VideoCallInterface.jsx
import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Camera, CameraOff, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";

const VideoCallInterface = ({ 
    localStream, 
    remoteStream, 
    onToggleAudio, 
    onToggleVideo,
    onEndCall 
}) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // Handle local video track
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            console.log('Playing local track');
            localStream.play(localVideoRef.current);
        }
        return () => {
            // Clean up local track
            if (localStream) {
                localStream.stop();
            }
        };
    }, [localStream]);

    // Handle remote video track
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            console.log('Playing remote track');
            remoteStream.play(remoteVideoRef.current);
        }
        return () => {
            // Clean up remote track
            if (remoteStream) {
                remoteStream.stop();
            }
        };
    }, [remoteStream]);

    // Track enablement status directly from tracks
    const isAudioEnabled = localStream?.enabled ?? true;
    const isVideoEnabled = localStream?.enabled ?? true;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
            <div className="container h-full max-w-6xl mx-auto p-4 flex flex-col">
                {/* Video Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Local Video */}
                    <div className="relative bg-muted rounded-lg overflow-hidden">
                        <div 
                            ref={localVideoRef} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-sm">
                            Your Video
                        </div>
                    </div>

                    {/* Remote Video */}
                    <div className="relative bg-muted rounded-lg overflow-hidden">
                        {remoteStream ? (
                            <>
                                <div 
                                    ref={remoteVideoRef}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-sm">
                                    Remote Video
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-muted-foreground">Connecting to remote video...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="mt-4 flex justify-center gap-4">
                    <Button
                        variant={isAudioEnabled ? "outline" : "destructive"}
                        size="icon"
                        onClick={onToggleAudio}
                        className="rounded-full h-12 w-12"
                    >
                        {isAudioEnabled ? (
                            <Mic className="h-5 w-5" />
                        ) : (
                            <MicOff className="h-5 w-5" />
                        )}
                    </Button>

                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={onEndCall}
                        className="rounded-full h-12 w-12"
                    >
                        <Phone className="h-5 w-5 rotate-135" />
                    </Button>

                    <Button
                        variant={isVideoEnabled ? "outline" : "destructive"}
                        size="icon"
                        onClick={onToggleVideo}
                        className="rounded-full h-12 w-12"
                    >
                        {isVideoEnabled ? (
                            <Camera className="h-5 w-5" />
                        ) : (
                            <CameraOff className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default VideoCallInterface;
// src/components/common/VideoCallButton.jsx
import React from 'react';
import { Video, VideoOff, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const VideoCallButton = ({ 
    onStartCall, 
    onEndCall, 
    isInCall = false,
    incomingCall = false,
    onAcceptCall,
    onRejectCall,
    receiverName
}) => {
    if (incomingCall) {
        return (
            <Dialog open={true}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Incoming Call</DialogTitle>
                        <DialogDescription>
                            {receiverName} is calling you
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button onClick={onRejectCall} variant="destructive">
                            <Phone className="h-4 w-4 rotate-135" />
                        </Button>
                        <Button onClick={onAcceptCall} variant="default">
                            <Phone className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Button
            variant={isInCall ? "destructive" : "ghost"}
            size="icon"
            onClick={isInCall ? onEndCall : onStartCall}
            className="rounded-full"
        >
            {isInCall ? (
                <VideoOff className="h-5 w-5" />
            ) : (
                <Video className="h-5 w-5" />
            )}
        </Button>
    );
};

export default VideoCallButton;
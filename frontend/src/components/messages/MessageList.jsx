// src/components/messages/MessageList.jsx
import React, { useState, useEffect, useRef } from 'react';
import ProfileImage from "../common/ProfileImage";
import messageActions from '@/actions/messageActions';

const MessageList = ({ currentUserId, otherUserId }) => {
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (otherUserId) {
            fetchMessages();
        }

        const unsubscribe = messageActions.onMessage((type, data) => {
            switch (type) {
                case 'newMessage':
                    handleNewMessage(data);
                    break;
                case 'messageConfirmed':
                    handleMessageConfirmed(data);
                    break;
                case 'messageError':
                    handleMessageError(data);
                    break;
            }
        });

        return () => unsubscribe();
    }, [otherUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const fetchedMessages = await messageActions.fetchMessages(otherUserId);
            setMessages(fetchedMessages);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const handleNewMessage = (data) => {
        const { message } = data;
        // Check if the message belongs to the current conversation
        const isRelevantMessage = 
            (message.sender_id._id === otherUserId && message.receiver_id === currentUserId) ||
            (message.sender_id._id === currentUserId && message.receiver_id === otherUserId);

        if (isRelevantMessage) {
            setMessages(prev => [...prev, message]);
        }
    };

    const handleMessageConfirmed = (data) => {
        const { tempId, confirmedMessage } = data;
        setMessages(prev => prev.map(msg => 
            msg._id === tempId ? {
                ...confirmedMessage,
                sender_id: {
                    ...confirmedMessage.sender_id,
                    _id: currentUserId // Ensure correct sender ID for alignment
                }
            } : msg
        ));
    };

    const handleMessageError = (data) => {
        const { tempId } = data;
        setMessages(prev => prev.filter(msg => msg._id !== tempId));
    };

    const messageGroups = messages.reduce((groups, message) => {
        const date = new Date(message.sent_at).toLocaleDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {Object.entries(messageGroups).map(([date, groupMessages]) => (
                <div key={date}>
                    <div className="flex justify-center mb-4">
                        <span className="px-3 py-1 bg-secondary rounded-full text-xs text-muted-foreground">
                            {date}
                        </span>
                    </div>
                    <div className="space-y-4">
                        {groupMessages.map((message) => {
                            const sentByMe = message.sender_id._id === currentUserId;
                            const senderInfo = message.sender_id;
                            
                            return (
                                <div
                                    key={message._id}
                                    className={`flex items-end gap-2 ${
                                        sentByMe ? 'flex-row-reverse' : ''
                                    }`}
                                >
                                    {!sentByMe && (
                                        <div className="flex-shrink-0">
                                            <ProfileImage
                                                src={senderInfo.profile_image}
                                                alt={senderInfo.name}
                                                size="sm"
                                            />
                                        </div>
                                    )}
                                    
                                    <div
                                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                            sentByMe 
                                                ? 'bg-primary text-primary-foreground rounded-br-none' 
                                                : 'bg-secondary rounded-bl-none'
                                        } ${message.isTemp ? 'opacity-70' : ''}`}
                                    >
                                        <p className="break-words">{message.content}</p>
                                        <span className={`text-xs ${
                                            sentByMe 
                                                ? 'text-primary-foreground/70' 
                                                : 'text-muted-foreground'
                                        }`}>
                                            {new Date(message.sent_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
            
            {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                    No messages in this conversation
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
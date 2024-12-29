// src/pages/Messages/MessagesPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import ChatList from '@/components/messages/ChatList';
import ChatHeader from '@/components/messages/ChatHeader';
import MessageList from '@/components/messages/MessageList';
import MessageInput from '@/components/messages/MessageInput';
import axios from '@/services/api';
import messageActions from '@/actions/messageActions';

const MessagesPage = () => {
    const [activeChat, setActiveChat] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const initialUserId = searchParams.get('userId');
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');

    // Initialize messaging
    useEffect(() => {
        messageActions.connect();
    }, []);

    // Handle initial user ID from URL
    useEffect(() => {
        const initializeChat = async () => {
            if (!initialUserId) return;

            try {
                const userResponse = await axios.get(`/user/profile/${initialUserId}`);
                const newChat = {
                    other_user: {
                        _id: userResponse.data._id,
                        name: userResponse.data.name,
                        profile_image: userResponse.data.profile_image,
                        specialization: userResponse.data.specialization
                    }
                };
                
                setActiveChat(newChat);
            } catch (err) {
                console.error('Failed to fetch user details:', err);
            }
        };

        initializeChat();
    }, [initialUserId]);

    const handleChatSelect = (chat) => {
        setActiveChat(chat);
        navigate(`/messages?userId=${chat.other_user._id}`, { replace: true });
        messageActions.markMessagesAsRead(chat.other_user._id);
    };

    return (
        <div className="container mx-auto p-6">
            <Card className="flex h-[calc(100vh-theme(space.32))]">
                <ChatList 
                    activeChat={activeChat} 
                    onChatSelect={handleChatSelect} 
                />

                {activeChat ? (
                    <div className="flex-1 flex flex-col">
                        <ChatHeader chat={activeChat} />
                        <MessageList 
                            currentUserId={profile._id}
                            otherUserId={activeChat.other_user._id}
                        />
                        <MessageInput 
                            receiverId={activeChat.other_user._id}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select a conversation to start messaging
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MessagesPage;
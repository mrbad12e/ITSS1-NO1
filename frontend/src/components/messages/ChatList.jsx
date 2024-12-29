// src/components/messages/ChatList.jsx
import React, { useState, useEffect } from 'react';
import ProfileImage from '@/components/common/ProfileImage';
import messageActions from '@/actions/messageActions';

const ChatList = ({ activeChat, onChatSelect }) => {    
    const [chats, setChats] = useState([]);
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');

    useEffect(() => {
        fetchChats();

        const unsubscribe = messageActions.onChatUpdate((type, data) => {
            switch (type) {
                case 'updateChat':
                    handleChatUpdate(data);
                    break;
                case 'messagesRead':
                    handleMessagesRead(data);
                    break;
            }
        });

        return () => unsubscribe();
    }, []);

    // Update unread count when active chat changes
    useEffect(() => {
        if (activeChat) {
            setChats(prev => 
                prev.map(chat => 
                    chat.other_user._id === activeChat.other_user._id
                        ? { ...chat, unread_count: 0 }
                        : chat
                )
            );
        }
    }, [activeChat]);

    const fetchChats = async () => {
        try {
            const fetchedChats = await messageActions.fetchChats();
            setChats(fetchedChats);
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        }
    };

    const handleChatUpdate = (data) => {
        const { message, sender } = data;
        setChats(prev => {
            const otherUserId = message.sender_id === profile._id ? message.receiver_id : message.sender_id;
            const existingChatIndex = prev.findIndex(chat => chat.other_user._id === otherUserId);

            if (existingChatIndex === -1) {
                // Create new chat
                const newChat = {
                    other_user: {
                        _id: sender._id,
                        name: sender.name,
                        profile_image: sender.profile_image,
                        specialization: sender.specialization
                    },
                    last_message: message,
                    unread_count: message.sender_id !== profile._id ? 1 : 0
                };
                return [newChat, ...prev];
            }

            // Update existing chat
            const updatedChats = [...prev];
            const chatToUpdate = {
                ...prev[existingChatIndex],
                last_message: message,
                unread_count: message.sender_id !== profile._id && 
                             (!activeChat || activeChat.other_user._id !== message.sender_id)
                             ? (prev[existingChatIndex].unread_count || 0) + 1 
                             : 0
            };

            updatedChats.splice(existingChatIndex, 1);
            return [chatToUpdate, ...updatedChats];
        });
    };

    const handleMessagesRead = (data) => {
        const { reader_id, chat_id } = data;
        setChats(prev =>
            prev.map(chat => {
                if (chat.other_user._id === reader_id) {
                    return { ...chat, unread_count: 0 };
                }
                return chat;
            })
        );
    };

    return (
        <div className="h-full w-80 border-r overflow-y-auto">
            {chats.map((chat) => (
                <button
                    key={chat.other_user._id}
                    onClick={() => onChatSelect(chat)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-secondary/50 ${
                        activeChat?.other_user._id === chat.other_user._id ? 'bg-secondary' : ''
                    }`}
                >
                    <ProfileImage src={chat.other_user.profile_image} alt={chat.other_user.name} size="md" />
                    <div className="flex-1 text-left">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-medium">{chat.other_user.name}</h3>
                            {chat.last_message?.sent_at && (
                                <span className="text-xs text-muted-foreground">
                                    {new Date(chat.last_message.sent_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        {chat.last_message && (
                            <p className="text-sm text-muted-foreground truncate">
                                {chat.last_message.content}
                            </p>
                        )}
                        {chat.unread_count > 0 && (
                            <div className="mt-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs w-fit">
                                {chat.unread_count}
                            </div>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
};

export default ChatList;
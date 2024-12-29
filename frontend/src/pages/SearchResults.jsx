import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, MessageSquare, Send, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SearchForumCard from '@/components/forum/SearchForumCard';
import ProfileImage from '@/components/common/ProfileImage';
import axios from '@/services/api';
import socketService from '@/services/socketService';

const SearchResults = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [results, setResults] = useState({
        users: [],
        forums: [],
        messages: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [activeMessageCard, setActiveMessageCard] = useState(null);

    // Get search query from URL
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('q') || '';

    useEffect(() => {
        socketService.connect();

        const messageUnsubscribe = socketService.onMessage((type, data) => {
            if (type === 'messageSent') {
                setMessageInput('');
                setActiveMessageCard(null);
                navigate(`/messages?userId=${data.message.receiver_id}`);
            } else if (type === 'messageError') {
                setError(data.error || 'Failed to send message');
            }
        });

        const connectionUnsubscribe = socketService.onConnectionChange((connected, error) => {
            if (!connected && error) {
                setError('Connection error: ' + error.message);
            }
        });

        return () => {
            messageUnsubscribe();
            connectionUnsubscribe();
        };
    }, []);

    useEffect(() => {
        if (query) {
            searchContent(query);
        }
    }, [query]);

    const searchContent = async (searchQuery) => {
        setLoading(true);
        try {
            const [usersRes, forumsRes, messagesRes] = await Promise.all([
                axios.get(`/user/search?query=${searchQuery}`),
                axios.get(`/user/forums/search?query=${searchQuery}`),
                axios.get(`/message/search?query=${searchQuery}`),
            ]);

            setResults({
                users: usersRes.data,
                forums: forumsRes.data,
                messages: messagesRes.data,
            });
        } catch (err) {
            setError('Failed to fetch search results');
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = (userId) => {
        navigate(`/messages?userId=${userId}`);
    };

    const handleToggleMessage = (userId) => {
        setActiveMessageCard(activeMessageCard === userId ? null : userId);
        setMessageInput('');
    };

    const handleSendMessage = async (userId) => {
        if (!messageInput.trim()) {
            setError('Please enter a message');
            return;
        }

        try {
            await socketService.sendMessage(userId, messageInput.trim());
        } catch (err) {
            setError('Failed to send message');
        }
    };

    const UserCard = ({ user }) => (
        <Card className="p-4">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary overflow-hidden">
                    {user.profile_image ? (
                        <ProfileImage src={user.profile_image} alt={user.name} size="md" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted">
                            <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">{user.specialization}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{user.experience_years} years exp.</span>
                            <Button
                                variant={activeMessageCard === user._id ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleMessage(user._id);
                                }}
                            >
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-1">
                        {user.skills?.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-0.5 bg-secondary rounded-full text-xs">
                                {skill}
                            </span>
                        ))}
                        {user.skills?.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{user.skills.length - 3} more</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Inline Message Input */}
            {activeMessageCard === user._id && (
                <div className="mt-4 space-y-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 rounded-lg bg-secondary px-4 py-2 text-sm"
                            autoFocus
                        />
                        <Button size="icon" onClick={() => handleSendMessage(user._id)} disabled={!messageInput.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleToggleMessage(user._id)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );

    const MessageCard = ({ message }) => (
        <Card className="p-4 hover:bg-secondary/50 cursor-pointer" onClick={() => handleStartChat(message.sender_id)}>
            <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-secondary overflow-hidden">
                    {message.profile_image ? (
                        <img src={message.profile_image} alt={message.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted">
                            <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="font-medium">{message.name}</h4>
                </div>
            </div>
            <p className="text-sm">{message.content}</p>
        </Card>
    );

    const tabs = [
        { id: 'users', label: 'Users', icon: User },
        { id: 'forums', label: 'Forums', icon: Users },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Search Results for "{query}"</h2>
                <div className="flex gap-2">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                activeTab === id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                            <span className="bg-secondary text-secondary-foreground px-2 rounded-full text-sm">
                                {results[id].length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {loading && <p className="text-muted-foreground">Loading...</p>}

            {error && <p className="text-destructive">{error}</p>}

            {!loading && !error && results[activeTab].length === 0 && (
                <p className="text-muted-foreground">No {activeTab} found</p>
            )}

            <div className="space-y-2">
                {activeTab === 'users' && results.users.map((user) => <UserCard key={user._id} user={user} />)}

                {activeTab === 'forums' &&
                    results.forums.map((forum) => (
                        <SearchForumCard key={forum._id} forum={forum} />
                    ))}

                {activeTab === 'messages' &&
                    results.messages.map((message) => <MessageCard key={message._id} message={message} />)}
            </div>
        </div>
    );
};

export default SearchResults;

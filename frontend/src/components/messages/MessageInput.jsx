// src/components/messages/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import messageActions from '@/actions/messageActions';

const MessageInput = ({ receiverId }) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading || !receiverId) return;
        
        setIsLoading(true);
        try {
            await messageActions.sendMessage(receiverId, message);
            setMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full bg-secondary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    disabled={isLoading || !receiverId}
                />
                <button
                    type="submit"
                    disabled={!message.trim() || isLoading || !receiverId}
                    className="rounded-full bg-primary p-2 text-primary-foreground disabled:opacity-50 transition-opacity hover:opacity-90"
                >
                    <Send className="h-5 w-5" />
                </button>
            </div>
        </form>
    );
};

export default MessageInput;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageCircle, Calendar, Plus } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import forumActions from '@/actions/forumActions';

const SearchForumCard = ({ forum }) => {
    const navigate = useNavigate();
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState('');

    const handleJoin = async (e) => {
        e.stopPropagation();
        setIsJoining(true);
        setError('');

        try {
            await forumActions.joinForum(forum._id);
            navigate(`/forums/${forum._id}`);
        } catch (err) {
            setError(err?.message || 'Failed to join forum');
            console.error('Join forum error:', err);
        } finally {
            setIsJoining(false);
        }
    };

    const handleClick = () => {
        if (forum.is_member) {
            navigate(`/forums/${forum._id}`);
        }
    };

    return (
        <Card
            className={`flex flex-col transition-all ${
                forum.is_member ? 'hover:scale-[1.02] hover:shadow-lg cursor-pointer' : ''
            }`}
            onClick={handleClick}
        >
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>{forum.name}</CardTitle>
                        <CardDescription>{forum.description}</CardDescription>
                    </div>

                    {!forum.is_member && (
                        <button
                            onClick={handleJoin}
                            disabled={isJoining}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4" />
                            {isJoining ? 'Joining...' : 'Join'}
                        </button>
                    )}
                </div>
                {error && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{forum.memberCount || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{forum.postCount || 0} posts</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{forum.eventCount || 0} events</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SearchForumCard;
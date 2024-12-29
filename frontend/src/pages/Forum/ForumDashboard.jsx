import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/services/api';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ForumCard from '@/components/forum/ForumCard';

const ForumsDashboard = () => {
    const navigate = useNavigate();
    const [joinedForums, setJoinedForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchJoinedForums();
    }, []);

    const fetchJoinedForums = async () => {
        try {
            const response = await axios.get('/user/forums');
            setJoinedForums(response.data || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch forums');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteForum = async (forumId) => {
        try {
            await axios.delete(`/forums/${forumId}`);
            setJoinedForums(prev => prev.filter(forum => forum._id !== forumId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete forum');
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-lg text-muted-foreground">Loading forums...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Forums</h1>
                    <p className="text-muted-foreground">Browse and manage your forums</p>
                </div>
                <button 
                    onClick={() => navigate('/forums/create')}
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Create Forum
                </button>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <h2 className="mb-4 text-xl font-semibold">Your Forums</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {joinedForums.map((forum) => (
                    <ForumCard 
                        key={forum._id} 
                        forum={forum} 
                        onDelete={handleDeleteForum}
                    />
                ))}
            </div>

            {joinedForums.length === 0 && !error && (
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                    <div className="text-center">
                        <p className="text-lg font-medium">You haven't joined any forums yet</p>
                        <p className="text-sm text-muted-foreground">Search for forums to join or create a new one</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForumsDashboard;
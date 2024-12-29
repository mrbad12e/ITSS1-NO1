// src/components/forum/GeneralTab.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PostCard from './PostCard';
import postActions from '@/actions/postActions';

const GeneralTab = () => {
    const { forumId } = useParams();
    const [error, setError] = useState('');
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        files: []
    });
    
    const fetchPosts = async () => {
        try {
            const fetchedPosts = await postActions.getPosts(forumId);
            setPosts(fetchedPosts);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch posts');
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [forumId]);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.title || !newPost.content) return;

        try {
            const createdPost = await postActions.createPost({
                ...newPost,
                forum_id: forumId
            });
            setPosts(prevPosts => [createdPost, ...prevPosts]);
            setNewPost({ title: '', content: '', files: [] });
        } catch (err) {
            setError('Failed to create post');
        }
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts(prevPosts => 
            prevPosts.map(post => 
                post._id === updatedPost._id ? updatedPost : post
            )
        );
    };

    const handlePostDelete = (postId) => {
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    };

    const handleCommentUpdate = (postId) => {
        fetchPosts(); // Refresh all posts to get updated comment counts
    };

    return (
        <>
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="mb-6">
                <CardContent className="pt-6">
                    <form onSubmit={handleCreatePost}>
                        <input
                            type="text"
                            value={newPost.title}
                            onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Post title"
                            className="mb-3 w-full rounded-lg bg-secondary px-4 py-2"
                        />
                        <textarea
                            value={newPost.content}
                            onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="What's on your mind?"
                            className="mb-3 w-full rounded-lg bg-secondary px-4 py-2"
                            rows={3}
                        />
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setNewPost(prev => ({
                                ...prev,
                                files: Array.from(e.target.files)
                            }))}
                            className="mb-3"
                        />
                        <button
                            type="submit"
                            disabled={!newPost.title || !newPost.content}
                            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
                        >
                            Create Post
                        </button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {posts.map((post) => (
                    <PostCard 
                        key={post._id} 
                        post={post}
                        onUpdate={handlePostUpdate}
                        onDelete={handlePostDelete}
                        onCommentUpdate={handleCommentUpdate}
                    />
                ))}
            </div>

            {posts.length === 0 && (
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                    <div className="text-center">
                        <p className="text-lg font-medium">No posts yet</p>
                        <p className="text-sm text-muted-foreground">Be the first to start a discussion</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default GeneralTab;
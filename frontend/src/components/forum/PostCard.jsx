// src/components/forum/PostCard.jsx
import React, { useState, useEffect } from 'react';
import postActions from '@/actions/postActions';
import commentActions from '@/actions/commentActions';
import { User, Paperclip, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProfileImage from '@/components/common/ProfileImage';
import CommentSection from './CommentSection';
import DeleteConfirmationDialog from '../common/DeleteConfirmationDialog';

const PostCard = ({ post, onUpdate, onDelete, onCommentUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [comments, setComments] = useState([]);
    const [editData, setEditData] = useState({ title: post.title, content: post.content });
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');

    useEffect(() => {
        fetchComments();
    }, [post._id]);

    const handleUpdateSubmit = async (e) => {
        try {
            e.preventDefault();
            const updatedPost = await postActions.updatePost(post._id, editData);            
            onUpdate?.(updatedPost);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        try {
            await postActions.deletePost(post._id);
            onDelete?.(post._id);
        } catch (err) {
            console.error(err);
        }
    };

    const startEditing = () => {
        setEditData({ title: post.title, content: post.content });
        setIsEditing(true);
    };

    const fetchComments = async () => {
        try {
            const fetchedComments = await commentActions.getPostComments(post._id);
            setComments(fetchedComments);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCommentUpdate = () => {
        fetchComments();
        onCommentUpdate?.(post._id);
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden">
                            {post.created_by?.profile_image ? (
                                <ProfileImage
                                    src={post.created_by?.profile_image}
                                    alt={post.created_by?.name}
                                    size="md"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <User className="h-6 w-6 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.title}
                                    onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
                                    className="w-full rounded bg-secondary px-3 py-1 font-medium"
                                />
                            ) : (
                                <h3 className="font-medium">{post.title}</h3>
                            )}
                            <p className="text-sm text-muted-foreground">
                                by {post.created_by?.name} • {new Date(post.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    {post.created_by?._id === profile._id && !isEditing && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 hover:bg-secondary rounded-full">
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={startEditing}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Post
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Post
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <form onSubmit={handleUpdateSubmit}>
                        <textarea
                            value={editData.content}
                            onChange={(e) => setEditData((prev) => ({ ...prev, content: e.target.value }))}
                            className="mb-3 w-full rounded bg-secondary p-3"
                            rows={4}
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!editData.title.trim() || !editData.content.trim()}>
                                Save Changes
                            </Button>
                        </div>
                    </form>
                ) : (
                    <>
                        <p className="whitespace-pre-wrap">{post.content}</p>
                        {post.resources?.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {post.resources.map((file, index) => (
                                    <a
                                        key={index}
                                        href={file.file_url}
                                        className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Paperclip className="h-4 w-4" />
                                        {file.title}
                                    </a>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
            <CardFooter>
                <CommentSection
                    postId={post._id}
                    comments={comments}
                    onCommentUpdate={handleCommentUpdate}
                />
            </CardFooter>

            <DeleteConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Delete Post"
                description="Are you sure you want to delete this post? This action cannot be undone."
                onConfirm={() => {
                    handleDelete();
                    setShowDeleteDialog(false);
                }}
            />
        </Card>
    );
};

export default PostCard;
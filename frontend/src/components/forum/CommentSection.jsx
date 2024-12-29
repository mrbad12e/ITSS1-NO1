// src/components/forum/CommentSection.jsx
import React, { useState } from 'react';
import { User, Send, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileImage from '@/components/common/ProfileImage';
import commentActions from '@/actions/commentActions';
import DeleteConfirmationDialog from '../common/DeleteConfirmationDialog';

const CommentSection = ({ postId, comments = [], onCommentUpdate }) => {
    const [commentText, setCommentText] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            await commentActions.createComment({ post_id: postId, content: commentText });
            setCommentText('');
            onCommentUpdate?.();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateSubmit = async (commentId) => {
        if (!editText.trim()) return;
        try {
            await commentActions.updateComment(commentId, editText);
            setEditingComment(null);
            setEditText('');
            onCommentUpdate?.();
        } catch (err) {
            console.error(err);
        }
    };

    const onDeleteComment = async (commentId) => {
        try {
            await commentActions.deleteComment(commentId);
            onCommentUpdate?.();
        } catch (err) {
            console.error(err);
        }
    };

    const startEditing = (comment) => {
        setEditingComment(comment._id);
        setEditText(comment.content);
    };

    const cancelEditing = () => {
        setEditingComment(null);
        setEditText('');
    };

    const formatDate = (date) => {
        const today = new Date();
        const commentDate = new Date(date);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (commentDate.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (commentDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return new Intl.DateTimeFormat('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: commentDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
            }).format(commentDate);
        }
    };

    const sortedComments = [...comments].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
    );

    const commentGroups = sortedComments.reduce((groups, comment) => {
        const date = formatDate(comment.created_at);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(comment);
        return groups;
    }, {});

    const CommentItem = ({ comment }) => (
        <div className="mb-3 flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                {comment.author_id?.profile_image ? (
                    <ProfileImage
                        src={comment.author_id?.profile_image}
                        alt={comment.author_id?.name}
                        size="sm"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                )}
            </div>
            <div className="flex-1">
                <div className="rounded-lg bg-secondary p-3">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-medium">{comment.author_id?.name}</p>
                        {comment.author_id?._id === profile._id && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => startEditing(comment)}
                                    className="p-1 hover:bg-background rounded-full text-muted-foreground"
                                >
                                    <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(comment._id)}
                                    className="p-1 hover:bg-background rounded-full text-muted-foreground"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                    </div>
                    {editingComment === comment._id ? (
                        <div className="mt-2">
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full rounded bg-background p-2 text-sm"
                                rows={2}
                            />
                            <div className="mt-2 flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={cancelEditing}>
                                    <X className="h-4 w-4" />
                                </Button>
                                <Button size="sm" onClick={() => handleUpdateSubmit(comment._id)}>
                                    <Check className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm">{comment.content}</p>
                    )}
                </div>
                <div className="mt-1 ml-3">
                    <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full">
            <div className="mb-4 w-full space-y-6">
                {Object.entries(commentGroups).map(([date, dateComments]) => (
                    <div key={date}>
                        <div className="mb-3 flex items-center gap-2">
                            <div className="h-px flex-grow bg-border"></div>
                            <span className="text-xs font-medium text-muted-foreground">{date}</span>
                            <div className="h-px flex-grow bg-border"></div>
                        </div>
                        <div className="space-y-3">
                            {dateComments.map(comment => (
                                <CommentItem key={comment._id} comment={comment} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 rounded-full bg-secondary px-4 py-2"
                />
                <Button
                    type="submit"
                    disabled={!commentText.trim()}
                    variant="primary"
                    size="icon"
                    className="rounded-full"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </form>

            <DeleteConfirmationDialog
                open={!!deleteConfirm}
                onOpenChange={() => setDeleteConfirm(null)}
                title="Delete Comment"
                description="Are you sure you want to delete this comment? This action cannot be undone."
                onConfirm={() => {
                    onDeleteComment(deleteConfirm);
                    setDeleteConfirm(null);
                }}
            />
        </div>
    );
};

export default CommentSection;
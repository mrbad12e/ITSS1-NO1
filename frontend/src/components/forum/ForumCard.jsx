import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageCircle, Calendar, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import forumActions from '@/actions/forumActions';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialog';

const ForumCard = ({ forum, onDelete }) => {
    const navigate = useNavigate();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowDeleteDialog(true);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setError('');

        try {
            await forumActions.deleteForum(forum._id);
            onDelete?.(forum._id);
        } catch (err) {
            setError('Failed to delete forum');
            console.error('Delete forum error:', err);
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <>
            <Card
                className="flex flex-col transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                onClick={() => navigate(`/forums/${forum._id}`)}
            >
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>{forum.name}</CardTitle>
                            <CardDescription>{forum.description}</CardDescription>
                        </div>

                        {forum.is_owner && (
                            <button
                                className="p-2 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                                onClick={handleDeleteClick}
                                disabled={isDeleting}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    {error && <p className="text-sm text-destructive mt-2">{error}</p>}
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

            <DeleteConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Delete Forum"
                description="Are you sure you want to delete this forum? All posts, comments, and files will be permanently deleted. This action cannot be undone."
                onConfirm={() => {
                    handleDelete();
                    setShowDeleteDialog(false);
                }}
            />
        </>
    );
};

export default ForumCard;

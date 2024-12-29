// src/components/forum/MembersTab.jsx
import React, { useState, useEffect } from 'react';
import forumActions from '@/actions/forumActions';
import { User, Shield, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProfileImage from '@/components/common/ProfileImage';

const MembersTab = ({ forumId }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    useEffect(() => {
        fetchMembers();
    }, [forumId]);

    const fetchMembers = async () => {
        try {
            const response = await forumActions.getForumMembers(forumId);
            setMembers(response.members);
            setIsOwner(response.is_caller_owner);
            setError('');
        } catch (err) {
            setError('Failed to fetch members');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        try {
            await forumActions.removeMember(forumId, memberId);
            setMembers(prev => prev.filter(member => member._id !== memberId));
        } catch (err) {
            setError('Failed to remove member');
        }
    };

    const MemberCard = ({ member }) => (
        <Card className="p-4 flex items-center justify-between hover:bg-secondary/50">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary overflow-hidden">
                    {member.profile_image ? (
                        <ProfileImage src={member.profile_image} alt={member.name} size="md" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium">{member.name}</h3>
                        {member.role === 'owner' && <Shield className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.specialization}</p>
                    <div className="flex gap-2 mt-1">
                        {member.skills?.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-0.5 bg-secondary rounded-full text-xs">
                                {skill}
                            </span>
                        ))}
                        {member.skills?.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{member.skills.length - 3} more</span>
                        )}
                    </div>
                </div>
            </div>
            {isOwner && member._id !== profile._id && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-secondary rounded-full">
                            <MoreVertical className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRemoveMember(member._id)} className="text-destructive">
                            Remove Member
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </Card>
    );

    if (loading) {
        return <div className="flex h-64 items-center justify-center">Loading members...</div>;
    }

    return (
        <div className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4">
                {members.map((member) => (
                    <MemberCard key={member._id} member={member} />
                ))}
            </div>

            {members.length === 0 && (
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                    <div className="text-center">
                        <p className="text-lg font-medium">No members yet</p>
                        <p className="text-sm text-muted-foreground">Invite members to join the forum</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembersTab;

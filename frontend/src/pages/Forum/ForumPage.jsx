import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from '@/services/api';
import forumActions from '@/actions/forumActions';
import GeneralTab from '@/components/forum/GeneralTab';
import EventsTab from '@/components/forum/EventsTab';
import MembersTab from '@/components/forum/MembersTab';
import FilesTab from '@/components/forum/FilesTab';

const ForumPage = () => {
    const { forumId } = useParams();
    const [activeTab, setActiveTab] = useState('general');
    const [error, setError] = useState('');
    const [forum, setForum] = useState(null);

    useEffect(() => {
        fetchForum();
    }, [forumId]);

    const fetchForum = async () => {
        try {
            const fetchedForum = await forumActions.getForum(forumId);
            setForum(fetchedForum);
        } catch (err) {
            setError('Failed to fetch forum');
        }
    };
    

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'events', label: 'Events' },
        { id: 'members', label: 'Members' },
        { id: 'files', label: 'Files' },
    ];

    return (
        <div className="container mx-auto max-w-4xl p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{forum?.name}</h1>
                <p className="text-muted-foreground">{forum?.description}</p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="mb-6 flex gap-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg ${
                            activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'general' && (
                <GeneralTab />
            )}

            {activeTab === 'events' && <EventsTab forumId={forumId} />}

            {activeTab === 'members' && <MembersTab forumId={forumId} />}

            {activeTab === 'files' && <FilesTab forumId={forumId} />}
        </div>
    );
};

export default ForumPage;

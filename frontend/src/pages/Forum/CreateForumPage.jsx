import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import axios from '@/services/api';

const CreateForumPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        settings: {
            can_members_create_events: true,
            can_members_create_meetings: true
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/forums', formData);
            navigate(`/forums/${response.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create forum');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Forum</CardTitle>
                    <CardDescription>
                        Create a new forum to collaborate with your team
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Forum Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                                className="w-full rounded-lg bg-secondary px-4 py-2"
                                placeholder="Enter forum name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    description: e.target.value
                                }))}
                                className="w-full rounded-lg bg-secondary px-4 py-2"
                                placeholder="Describe the purpose of this forum"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium">
                                Forum Settings
                            </label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="events"
                                        checked={formData.settings.can_members_create_events}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            settings: {
                                                ...prev.settings,
                                                can_members_create_events: e.target.checked
                                            }
                                        }))}
                                        className="rounded border-input"
                                    />
                                    <label htmlFor="events" className="text-sm">
                                        Allow members to create events
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="meetings"
                                        checked={formData.settings.can_members_create_meetings}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            settings: {
                                                ...prev.settings,
                                                can_members_create_meetings: e.target.checked
                                            }
                                        }))}
                                        className="rounded border-input"
                                    />
                                    <label htmlFor="meetings" className="text-sm">
                                        Allow members to create meetings
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="rounded-lg px-4 py-2 hover:bg-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.name || !formData.description}
                                className="rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Forum'}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateForumPage;
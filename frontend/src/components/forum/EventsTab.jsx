// src/components/forum/EventsTab.jsx
import React, { useState, useEffect } from 'react';
import forumActions from '@/actions/forumActions';
import { CheckCircle, XCircle, MoreVertical, Pencil, Trash2, Users, MapPin, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EventsTab = ({ forumId }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingEvent, setEditingEvent] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        location: ''
    });
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');

    useEffect(() => {
        fetchEvents();
    }, [forumId]);

    const fetchEvents = async () => {
        try {
            const fetchedEvents = await forumActions.getForumEvents(forumId);
            setEvents(fetchedEvents);
        } catch (err) {
            setError('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const response = await forumActions.createEvent({
                ...newEvent,
                forum_id: forumId
            });
            setEvents(prev => [response, ...prev]);
            setNewEvent({ title: '', description: '', date: '', location: '' });
        } catch (err) {
            setError('Failed to create event');
        }
    };

    const handleUpdateEvent = async (eventId) => {
        try {
            const response = await forumActions.updateEvent(eventId, editingEvent);
            setEvents(prev => prev.map(event => 
                event._id === eventId ? response : event
            ));
            setEditingEvent(null);
        } catch (err) {
            setError('Failed to update event');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await forumActions.deleteEvent(eventId);
            setEvents(prev => prev.filter(event => event._id !== eventId));
            setShowDeleteDialog(null);
        } catch (err) {
            setError('Failed to delete event');
        }
    };

    const handleEventParticipation = async (eventId, status) => {
        try {
            await forumActions.updateEventParticipation(eventId, status);
            const updatedEvents = events.map(event => 
                event._id === eventId 
                    ? { ...event, participation_status: status }
                    : event
            );
            setEvents(updatedEvents);
        } catch (err) {
            setError('Failed to update participation status');
        }
    };

    if (loading) return <div>Loading events...</div>;

    const EventCard = ({ event }) => {
        const isEditing = editingEvent?._id === event._id;
        const isCreator = event.created_by?._id === profile._id;
        const eventDate = new Date(event.date);

        const formatDateTime = (date) => {
            return new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
            }).format(date);
        };

        return (
            <Card className="mb-4">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editingEvent.title}
                                        onChange={(e) => setEditingEvent(prev => ({
                                            ...prev,
                                            title: e.target.value
                                        }))}
                                        className="w-full rounded-lg bg-secondary px-4 py-2"
                                        placeholder="Event title"
                                    />
                                    <textarea
                                        value={editingEvent.description}
                                        onChange={(e) => setEditingEvent(prev => ({
                                            ...prev,
                                            description: e.target.value
                                        }))}
                                        className="w-full rounded-lg bg-secondary px-4 py-2"
                                        rows={3}
                                        placeholder="Event description"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="datetime-local"
                                            value={editingEvent.date}
                                            onChange={(e) => setEditingEvent(prev => ({
                                                ...prev,
                                                date: e.target.value
                                            }))}
                                            className="rounded-lg bg-secondary px-4 py-2"
                                        />
                                        <input
                                            type="text"
                                            value={editingEvent.location}
                                            onChange={(e) => setEditingEvent(prev => ({
                                                ...prev,
                                                location: e.target.value
                                            }))}
                                            className="rounded-lg bg-secondary px-4 py-2"
                                            placeholder="Location"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setEditingEvent(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => handleUpdateEvent(event._id)}
                                            disabled={!editingEvent.title || !editingEvent.description || 
                                                    !editingEvent.date || !editingEvent.location}
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold">{event.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Created by {event.created_by?.name}
                                            </p>
                                        </div>
                                        {isCreator && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-2 hover:bg-secondary rounded-full">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem 
                                                        onClick={() => setEditingEvent(event)}
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit Event
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => setShowDeleteDialog(event._id)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Event
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>{formatDateTime(eventDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span>{event.participant_count || 0} people going</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {!isEditing && (
                        <>
                            <p className="mb-4">{event.description}</p>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {eventDate > new Date() ? 'Upcoming' : 'Past'} event
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleEventParticipation(event._id, 'accepted')}
                                        variant={event.participation_status === 'accepted' ? 'default' : 'outline'}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Going
                                    </Button>
                                    <Button
                                        onClick={() => handleEventParticipation(event._id, 'declined')}
                                        variant={event.participation_status === 'declined' ? 'destructive' : 'outline'}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Can't Go
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div>
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <form onSubmit={handleCreateEvent}>
                        <input
                            type="text"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Event title"
                            className="mb-3 w-full rounded-lg bg-secondary px-4 py-2"
                        />
                        <textarea
                            value={newEvent.description}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Event description"
                            className="mb-3 w-full rounded-lg bg-secondary px-4 py-2"
                            rows={3}
                        />
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <input
                                type="datetime-local"
                                value={newEvent.date}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                                className="rounded-lg bg-secondary px-4 py-2"
                            />
                            <input
                                type="text"
                                value={newEvent.location}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                                placeholder="Location"
                                className="rounded-lg bg-secondary px-4 py-2"
                            />
                        </div>
                        <Button 
                            type="submit"
                            disabled={!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.location}
                        >
                            Create Event
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {events.map(event => (
                    <EventCard key={event._id} event={event} />
                ))}
                {events.length === 0 && (
                    <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                        <div className="text-center">
                            <p className="text-lg font-medium">No events scheduled</p>
                            <p className="text-sm text-muted-foreground">Create an event to get started</p>
                        </div>
                    </div>
                )}
            </div>

            <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this event? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleDeleteEvent(showDeleteDialog)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default EventsTab;
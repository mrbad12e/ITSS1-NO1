// services/event.service.js
import Event from '../models/event.model';
import Forum from '../models/forum.model';

const eventService = {
    async createEvent(userId, eventData) {
        const forum = await Forum.findById(eventData.forum_id);
        if (!forum) {
            throw new Error('Forum not found');
        }

        const event = new Event({
            ...eventData,
            organizer_id: userId,
            participants: [{ user: userId, status: 'accepted' }]
        });

        return await event.save();
    },

    async updateEvent(eventId, userId, updateData) {
        const event = await Event.findById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }

        // Only organizer can update event
        if (event.organizer_id.toString() !== userId) {
            throw new Error('Not authorized to update this event');
        }

        const allowedUpdates = ['title', 'description', 'date', 'location', 'status'];
        const updates = {};
        Object.keys(updateData).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = updateData[key];
            }
        });

        return await Event.findByIdAndUpdate(
            eventId,
            { $set: updates },
            { new: true }
        ).populate('organizer_id', 'name email');
    },

    async deleteEvent(eventId, userId) {
        const event = await Event.findById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }

        // Only organizer can delete event
        if (event.organizer_id.toString() !== userId) {
            throw new Error('Not authorized to delete this event');
        }

        await Event.findByIdAndUpdate(eventId, { status: 'cancelled' });
        return { message: 'Event cancelled successfully' };
    },

    async getForumEvents(forumId, userId) {
        const forum = await Forum.findById(forumId);
        if (!forum || !forum.members.includes(userId)) {
            throw new Error('Forum not found or access denied');
        }

        return await Event.find({ 
            forum_id: forumId,
            status: { $ne: 'cancelled' }
        })
        .populate('organizer_id', 'name email')
        .populate('participants.user', 'name email')
        .sort({ date: 1 });
    },

    async getEvent(eventId, userId) {
        const event = await Event.findById(eventId)
            .populate('organizer_id', 'name email')
            .populate('participants.user', 'name email');

        if (!event) {
            throw new Error('Event not found');
        }

        const forum = await Forum.findById(event.forum_id);
        if (!forum || !forum.members.includes(userId)) {
            throw new Error('Access denied');
        }

        return event;
    },

    async updateParticipantStatus(eventId, userId, status) {
        const event = await Event.findById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }

        const forum = await Forum.findById(event.forum_id);
        if (!forum || !forum.members.includes(userId)) {
            throw new Error('Access denied');
        }

        const participantIndex = event.participants.findIndex(
            p => p.user.toString() === userId
        );

        if (participantIndex === -1) {
            event.participants.push({ user: userId, status });
        } else {
            event.participants[participantIndex].status = status;
        }

        await event.save();
        return event;
    }
};

export default eventService;
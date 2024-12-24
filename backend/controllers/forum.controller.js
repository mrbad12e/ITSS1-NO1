import { validationResult } from 'express-validator';
import forumService from '../services/forum.service';
import eventService from '../services/event.service';

const ForumController = {
    async createForum(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const forum = await forumService.createForum(req.user.userId, req.body);
            res.status(201).json(forum);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getForum(req, res) {
        try {
            const forum = await forumService.getForum(req.params.forumId, req.user.userId);
            res.status(200).json(forum);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    async updateForum(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const forum = await forumService.updateForum(
                req.params.forumId,
                req.user.userId,
                req.body
            );
            res.status(200).json(forum);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async deleteForum(req, res) {
        try {
            const result = await forumService.deleteForum(req.params.forumId, req.user.userId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getForumMembers(req, res) {
        try {
            const members = await forumService.getForumMembers(req.params.forumId, req.user.userId);
            res.status(200).json(members);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    async getForumResources(req, res) {
        try {
            const resources = await forumService.getForumResources(
                req.params.forumId,
                req.user.userId
            );
            res.status(200).json(resources);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    async removeMember(req, res) {
        try {
            const forum = await forumService.removeMember(
                req.params.forumId,
                req.user.userId,
                req.params.memberId
            );
            res.status(200).json(forum);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async createEvent(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
    
            const event = await eventService.createEvent(req.user.userId, req.body);
            res.status(201).json(event);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    
    async updateEvent(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
    
            const event = await eventService.updateEvent(
                req.params.eventId,
                req.user.userId,
                req.body
            );
            res.status(200).json(event);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    
    async deleteEvent(req, res) {
        try {
            const result = await eventService.deleteEvent(req.params.eventId, req.user.userId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    
    async getForumEvents(req, res) {
        try {
            const events = await eventService.getForumEvents(req.params.forumId, req.user.userId);
            res.status(200).json(events);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },
    
    async getEvent(req, res) {
        try {
            const event = await eventService.getEvent(req.params.eventId, req.user.userId);
            res.status(200).json(event);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },
    
    async updateEventParticipation(req, res) {
        try {
            const event = await eventService.updateParticipantStatus(
                req.params.eventId,
                req.user.userId,
                req.body.status
            );
            res.status(200).json(event);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

export default ForumController;
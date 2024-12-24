// controllers/meeting.controller.js
import { validationResult } from 'express-validator';
import meetingService from '../services/meeting.service';

const MeetingController = {
    async createDirectMeeting(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const meeting = await meetingService.createDirectMeeting(
                req.user.userId,
                req.body.receiver_id,
                req.body
            );
            res.status(201).json(meeting);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async createForumMeeting(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const meeting = await meetingService.createForumMeeting(req.user.userId, req.body);
            res.status(201).json(meeting);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async updateMeeting(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const meeting = await meetingService.updateMeeting(
                req.params.meetingId,
                req.user.userId,
                req.body
            );
            res.status(200).json(meeting);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async deleteMeeting(req, res) {
        try {
            const result = await meetingService.deleteMeeting(
                req.params.meetingId,
                req.user.userId
            );
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async joinMeeting(req, res) {
        try {
            const result = await meetingService.joinMeeting(
                req.params.meetingId,
                req.user.userId
            );
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async leaveMeeting(req, res) {
        try {
            const result = await meetingService.leaveMeeting(
                req.params.meetingId,
                req.user.userId
            );
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getUserMeetings(req, res) {
        try {
            const meetings = await meetingService.getUserMeetings(req.user.userId);
            res.status(200).json(meetings);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    async getActiveMeeting(req, res) {
        try {
            const meeting = await meetingService.getActiveMeeting(
                req.params.meetingId,
                req.user.userId
            );
            res.status(200).json(meeting);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    async startMeeting(req, res) {
        try {
            const meeting = await meetingService.startMeeting(
                req.params.meetingId,
                req.user.userId
            );
            res.status(200).json(meeting);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async endMeeting(req, res) {
        try {
            const meeting = await meetingService.endMeeting(
                req.params.meetingId,
                req.user.userId
            );
            res.status(200).json(meeting);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

export default MeetingController;
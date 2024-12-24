// routes/meeting.routes.js
import express from 'express';
import MeetingController from '../controllers/meeting.controller';
import { meetingValidation } from '../middleware/validators/forumValidator';

const router = express.Router();

// Create meetings
router.post('/direct', meetingValidation, MeetingController.createDirectMeeting);
router.post('/forum', meetingValidation, MeetingController.createForumMeeting);

// Manage meetings
router.put('/:meetingId', meetingValidation, MeetingController.updateMeeting);
router.delete('/:meetingId', MeetingController.deleteMeeting);

// Meeting participation
router.post('/:meetingId/join', MeetingController.joinMeeting);
router.post('/:meetingId/leave', MeetingController.leaveMeeting);

// Meeting status
router.post('/:meetingId/start', MeetingController.startMeeting);
router.post('/:meetingId/end', MeetingController.endMeeting);

// Get meetings
router.get('/user', MeetingController.getUserMeetings);
router.get('/:meetingId', MeetingController.getActiveMeeting);

export default router;
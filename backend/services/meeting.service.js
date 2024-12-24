// services/meeting.service.js
import Meeting from '../models/meeting.model';
import Forum from '../models/forum.model';
import User from '../models/user.model';
import crypto from 'crypto';

const meetingService = {
    async createDirectMeeting(userId, receiverId, meetingData) {
        // Verify receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            throw new Error('Receiver not found');
        }

        // Generate unique room ID
        const roomId = crypto.randomBytes(16).toString('hex');

        const meeting = new Meeting({
            title: meetingData.title,
            description: meetingData.description,
            start_time: meetingData.start_time,
            end_time: meetingData.end_time,
            room_id: roomId,
            type: 'direct',
            created_by: userId,
            participants: [userId, receiverId]
        });

        return await meeting.save();
    },

    async createForumMeeting(userId, meetingData) {
        // Verify forum exists and user has access
        const forum = await Forum.findById(meetingData.forum_id);
        if (!forum) {
            throw new Error('Forum not found');
        }

        // Check if user can create meetings in this forum
        if (forum.created_by.toString() !== userId && 
            !forum.settings.can_members_create_meetings &&
            forum.members.includes(userId)) {
            throw new Error('Not authorized to create meetings in this forum');
        }

        // Generate unique room ID
        const roomId = crypto.randomBytes(16).toString('hex');

        const meeting = new Meeting({
            forum_id: meetingData.forum_id,
            title: meetingData.title,
            description: meetingData.description,
            start_time: meetingData.start_time,
            end_time: meetingData.end_time,
            room_id: roomId,
            type: 'forum',
            created_by: userId,
            participants: [userId] // Initially only creator
        });

        return await meeting.save();
    },

    async updateMeeting(meetingId, userId, updateData) {
        const meeting = await Meeting.findOne({
            _id: meetingId,
            created_by: userId,
            status: { $ne: 'ended' }
        });

        if (!meeting) {
            throw new Error('Meeting not found or unauthorized');
        }

        // Only allow updating certain fields
        const allowedUpdates = ['title', 'description', 'start_time', 'end_time'];
        const updates = {};
        Object.keys(updateData).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = updateData[key];
            }
        });

        return await Meeting.findByIdAndUpdate(
            meetingId,
            { $set: updates },
            { new: true }
        ).populate('participants', 'name email profile_image');
    },

    async deleteMeeting(meetingId, userId) {
        const meeting = await Meeting.findOne({
            _id: meetingId,
            created_by: userId,
            status: { $ne: 'ended' }
        });

        if (!meeting) {
            throw new Error('Meeting not found or unauthorized');
        }

        meeting.status = 'cancelled';
        return await meeting.save();
    },

    async joinMeeting(meetingId, userId) {
        const meeting = await Meeting.findOne({
            _id: meetingId,
            status: 'scheduled'
        });

        if (!meeting) {
            throw new Error('Meeting not found or already ended');
        }

        // Check access permissions
        if (meeting.type === 'forum') {
            const forum = await Forum.findById(meeting.forum_id);
            if (!forum || !forum.members.includes(userId)) {
                throw new Error('Access denied');
            }
        } else if (meeting.type === 'direct') {
            if (!meeting.participants.includes(userId)) {
                throw new Error('Access denied');
            }
        }

        // Add participant if not already added
        if (!meeting.participants.includes(userId)) {
            meeting.participants.push(userId);
            await meeting.save();
        }

        return {
            meeting,
            room_id: meeting.room_id
        };
    },

    async leaveMeeting(meetingId, userId) {
        const meeting = await Meeting.findOne({
            _id: meetingId,
            status: 'active',
            participants: userId
        });

        if (!meeting) {
            throw new Error('Meeting not found or not a participant');
        }

        // Remove participant
        meeting.participants = meeting.participants.filter(
            p => p.toString() !== userId
        );

        // If no participants left, end the meeting
        if (meeting.participants.length === 0) {
            meeting.status = 'ended';
        }

        return await meeting.save();
    },

    async getUserMeetings(userId) {
        // Get user's forums
        const forums = await Forum.find({ members: userId });
        const forumIds = forums.map(forum => forum._id);

        // Get all relevant meetings
        return await Meeting.find({
            $or: [
                { participants: userId }, // Direct meetings
                { forum_id: { $in: forumIds } } // Forum meetings
            ],
            status: { $ne: 'cancelled' }
        })
        .populate('created_by', 'name email profile_image')
        .populate('participants', 'name email profile_image')
        .populate('forum_id', 'name')
        .sort({ start_time: 1 });
    },

    async getActiveMeeting(meetingId, userId) {
        const meeting = await Meeting.findOne({
            _id: meetingId,
            status: 'active'
        })
        .populate('created_by', 'name email profile_image')
        .populate('participants', 'name email profile_image')
        .populate('forum_id', 'name');

        if (!meeting) {
            throw new Error('Active meeting not found');
        }

        // Check access permissions
        if (meeting.type === 'forum') {
            const forum = await Forum.findById(meeting.forum_id);
            if (!forum || !forum.members.includes(userId)) {
                throw new Error('Access denied');
            }
        } else if (meeting.type === 'direct') {
            if (!meeting.participants.includes(userId)) {
                throw new Error('Access denied');
            }
        }

        return meeting;
    },

    async startMeeting(meetingId, userId) {
        const meeting = await Meeting.findOne({
            _id: meetingId,
            created_by: userId,
            status: 'scheduled'
        });

        if (!meeting) {
            throw new Error('Meeting not found or unauthorized');
        }

        meeting.status = 'active';
        return await meeting.save();
    },

    async endMeeting(meetingId, userId) {
        const meeting = await Meeting.findOne({
            _id: meetingId,
            created_by: userId,
            status: 'active'
        });

        if (!meeting) {
            throw new Error('Meeting not found or unauthorized');
        }

        meeting.status = 'ended';
        return await meeting.save();
    }
};

export default meetingService;
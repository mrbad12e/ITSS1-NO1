// src/actions/forumActions.js
import axios from '@/services/api';

class ForumActions {
    // Forum CRUD operations
    async createForum(forumData) {
        const response = await axios.post('/forums', forumData);
        return response.data;
    }

    async getForum(forumId) {
        const response = await axios.get(`/forums/${forumId}`);
        return response.data;
    }

    async updateForum(forumId, updateData) {
        const response = await axios.put(`/forums/${forumId}`, updateData);
        return response.data;
    }

    async deleteForum(forumId) {
        await axios.delete(`/forums/${forumId}`);
    }

    // Forum member operations
    async joinForum(forumId) {
        const response = await axios.post(`/user/forums/${forumId}/join`);
        return response.data;
    }

    async leaveForum(forumId) {
        await axios.delete(`/forums/${forumId}/leave`);
    }

    async getForumMembers(forumId) {
        const response = await axios.get(`/forums/${forumId}/members`);
        return response.data;
    }

    async removeMember(forumId, memberId) {
        await axios.delete(`/forums/${forumId}/members/${memberId}`);
    }

    async getForumResources(forumId) {
        const response = await axios.get(`/forums/${forumId}/resources`);
        return response.data;
    }

    // Forum events operations
    async createEvent(eventData) {
        const response = await axios.post('/forums/events', eventData);
        return response.data;
    }

    async getForumEvents(forumId) {
        const response = await axios.get(`/forums/events/${forumId}`);
        return response.data;
    }

    async updateEvent(eventId, updateData) {
        const response = await axios.put(`/forums/event/${eventId}`, updateData);
        return response.data;
    }

    async deleteEvent(eventId) {
        await axios.delete(`/forums/event/${eventId}`);
    }

    async updateEventParticipation(eventId, status) {
        const response = await axios.post(`/forums/event/${eventId}/participate`, { status });
        return response.data;
    }
}

const forumActions = new ForumActions();
export default forumActions;

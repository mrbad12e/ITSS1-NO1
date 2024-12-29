// src/actions/userActions.js
import axios from '@/services/api';

class UserActions {
    async updateProfile(profileData) {
        const formData = new FormData();
        Object.keys(profileData).forEach((key) => {
            if (key === 'profile_image' && profileData[key] instanceof File) {
                formData.append('file', profileData[key]);
            } else if (key === 'skills' && Array.isArray(profileData[key])) {
                formData.append(key, JSON.stringify(profileData[key]));
            } else {
                formData.append(key, profileData[key]);
            }
        });

        const response = await axios.put('/user/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    async getUserProfile(userId) {
        const response = await axios.get(`/user/profile/${userId}`);
        return response.data;
    }

    async searchUsers(query) {
        const response = await axios.get(`/user/search?query=${query}`);
        return response.data;
    }

    async getUserForums() {
        const response = await axios.get('/user/forums');
        return response.data;
    }

    async validateSession() {
        const response = await axios.get('/user/validate-session');
        return response.data;
    }
}

const userActions = new UserActions();
export default userActions;

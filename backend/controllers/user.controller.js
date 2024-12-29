import { userService, userForumService } from '../services/user.service';
import { validationResult } from 'express-validator';

const UserController = {
    async login(req, res) {
        try {            
            const { email, password } = req.body;
            const { token, user } = await userService.login(email, password);
            
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000,
                path: '/'
            });

            res.status(200).json({ user });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async logout(req, res) {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out' });
    },

    async getSocketToken(req, res) {
        try {
            const token = await userService.getSocketToken(req.user.userId);
            res.status(200).json({ token });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async validateSession(req, res) {
        try {            
            const user = await userService.validateSession(req.user.userId);
            res.status(200).json({ user });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    },

    async getUserProfile(req, res) {
        try {
            const user = await userService.getUserProfile(req.params.userId);
            res.status(200).json(user);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    async updateProfile(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            
            // Get the uploaded file URL if it exists
            const profileImage = req.uploadedFile ? req.uploadedFile.file_url : undefined;
            
            // Merge file URL with other update data
            const updateData = {
                ...req.body,
                ...(profileImage && { profile_image: profileImage })
            };

            const updatedUser = await userService.updateProfile(req.user.userId, updateData);
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async searchUsers(req, res) {
        try {
            const users = await userService.searchUsers(req.query.query);
            res.status(200).json(users);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async searchForums(req, res) {
        try {
            const forums = await userForumService.searchForums(req.user.userId, req.query.query);
            res.status(200).json(forums);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getAvailableForums(req, res) {
        try {
            const forums = await userForumService.getAvailableForums(req.user.userId);
            res.status(200).json(forums);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getUserForums(req, res) {
        try {
            const forums = await userForumService.getUserForums(req.user.userId);
            res.status(200).json(forums);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async joinForum(req, res) {
        try {
            const result = await userForumService.joinForum(req.user.userId, req.params.forumId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

export default UserController;
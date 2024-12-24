import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Forum from '../models/forum.model.js';

const userService = {
    async login(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        const [salt, storedHash] = user.password.split(':');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

        if (storedHash !== hash) {
            throw new Error('Invalid password');
        }

        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        return {
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                specialization: user.specialization,
                experience_years: user.experience_years,
                skills: user.skills,
                profile_image: user.profile_image,
            },
            token,
        };
    },

    async updateProfile(userId, updateData) {
        const allowedUpdates = ['name', 'specialization', 'experience_years', 'skills', 'profile_image'];
        const updates = Object.fromEntries(
            Object.entries(updateData).filter(([key]) => allowedUpdates.includes(key))
        );
        updates.updated_at = new Date();

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, select: '-password -refreshToken' }
        );

        if (!user) throw new Error('User not found');
        return user;
    },

    async searchUsers(query) {        
        return await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { specialization: { $regex: query, $options: 'i' } },
                { skills: { $elemMatch: { $regex: query, $options: 'i' } } },
            ],
        }).select('-password -refreshToken').limit(20);
    }
};

const userForumService = {
    async searchForums(userId, query) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const forums = await Forum.find({
            status: 'active',
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        })
        .populate('created_by', 'name email')
        .select('name description created_by members created_at');

        return forums.map(forum => ({
            ...forum.toObject(),
            is_member: forum.members.includes(userId)
        }));
    },

    async getAvailableForums(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        return await Forum.find({
            _id: { $nin: user.forums || [] },
            status: 'active'
        }).select('name description created_by members created_at');
    },

    async getUserForums(userId) {
        return await Forum.find({
            members: userId,
            status: 'active'
        }).select('name description created_by members created_at');
    },

    async joinForum(userId, forumId) {
        const forum = await Forum.findById(forumId);
        if (!forum) throw new Error('Forum not found');
        if (forum.status !== 'active') throw new Error('Forum is not active');
        if (forum.members.includes(userId)) throw new Error('User is already a member');

        await Forum.findByIdAndUpdate(
            forumId,
            { $push: { members: userId } }
        );
        
        return { message: 'Successfully joined forum' };
    }
};

export { userService, userForumService };
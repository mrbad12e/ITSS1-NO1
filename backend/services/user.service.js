import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Forum from '../models/forum.model.js';

// Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/No1')
//     .then(() => console.log('MongoDB connected'))
//     .catch(err => console.error('MongoDB connection error:', err));

async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

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

    async register(userData) {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const hashedPassword = await hashPassword(userData.password);
        
        const user = new User({
            ...userData,
            password: hashedPassword,
        });

        return await user.save();
    },

    async getSocketToken(userId) {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return token;
    },

    async validateSession(userId) {
        const user = await User.findById(userId).select('-password -refreshToken');
        if (!user) throw new Error('User not found');
        
        return {
            _id: user._id,
            email: user.email,
            name: user.name,
            specialization: user.specialization,
            experience_years: user.experience_years,
            skills: user.skills,
            profile_image: user.profile_image,
        };
    },

    async getUserProfile(userId) {
        const user = await User.findById(userId)
            .select('-password -refreshToken');
        
        if (!user) throw new Error('User not found');
        return user;
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

        const forums = await Forum.aggregate([
            {
                $match: {
                    status: 'active',
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'forum_id',
                    pipeline: [{ $match: { is_deleted: false } }],
                    as: 'posts'
                }
            },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: 'forum_id',
                    pipeline: [{ $match: { status: { $ne: 'cancelled' } } }],
                    as: 'events'
                }
            },
            {
                $addFields: {
                    is_member: { 
                        $in: [new mongoose.Types.ObjectId(userId), '$members'] 
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    created_by: 1,
                    created_at: 1,
                    is_member: 1,
                    memberCount: { $size: '$members' },
                    postCount: { $size: '$posts' },
                    eventCount: { $size: '$events' }
                }
            }
        ]).exec();

        return forums;
    },

    async getAvailableForums(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        return await Forum.aggregate([
            {
                $match: {
                    members: { $nin: [new mongoose.Types.ObjectId(userId)] },
                    status: 'active'
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'forum_id',
                    pipeline: [{ $match: { is_deleted: false } }],
                    as: 'posts'
                }
            },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: 'forum_id',
                    pipeline: [{ $match: { status: { $ne: 'cancelled' } } }],
                    as: 'events'
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    created_by: 1,
                    created_at: 1,
                    memberCount: { $size: '$members' },
                    postCount: { $size: '$posts' },
                    eventCount: { $size: '$events' }
                }
            }
        ]).exec();
    },

    async getUserForums(userId) {
        const forums = await Forum.aggregate([
            {
                $match: {
                    members: { $in: [new mongoose.Types.ObjectId(userId)] },
                    status: 'active'
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'forum_id',
                    pipeline: [{ $match: { is_deleted: false } }],
                    as: 'posts'
                }
            },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: 'forum_id',
                    pipeline: [{ $match: { status: { $ne: 'cancelled' } } }],
                    as: 'events'
                }
            },
            {
                $addFields: {
                    is_owner: {
                        $eq: ['$created_by', new mongoose.Types.ObjectId(userId)]
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    created_by: 1,
                    created_at: 1,
                    is_owner: 1,
                    memberCount: { $size: '$members' },
                    postCount: { $size: '$posts' },
                    eventCount: { $size: '$events' }
                }
            }
        ]).exec();
    
        return forums;
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

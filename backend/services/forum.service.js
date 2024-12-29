import mongoose from 'mongoose';
import Forum from '../models/forum.model';
import Post from '../models/post.model';
import Resource from '../models/resource.model';

const forumService = {
    async createForum(userId, forumData) {
        const forum = new Forum({
            ...forumData,
            created_by: userId,
            members: [userId], // Creator is automatically a member
        });
        return await forum.save();
    },

    async getForum(forumId, userId) {
        const forum = await Forum.findById(forumId)
            .populate('created_by', 'name email')
            .populate('members', 'name email profile_image');

        if (!forum) {
            throw new Error('Forum not found');
        }

        if (!forum.members.some((member) => member._id.toString() === userId)) {
            throw new Error('Access denied');
        }

        return forum;
    },

    async updateForum(forumId, userId, updateData) {
        const forum = await Forum.findOne({ _id: forumId, created_by: userId });
        if (!forum) {
            throw new Error('Forum not found or unauthorized');
        }

        const allowedUpdates = ['name', 'description', 'settings'];
        const updates = {};
        Object.keys(updateData).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                updates[key] = updateData[key];
            }
        });

        return await Forum.findByIdAndUpdate(forumId, { $set: updates }, { new: true }).populate(
            'created_by',
            'name email'
        );
    },

    async deleteForum(forumId, userId) {
        // First verify forum exists and user is authorized
        const forum = await Forum.findOne({ _id: forumId, created_by: userId });
        if (!forum) {
            throw new Error('Forum not found or unauthorized');
        }

        try {
            // Archive forum
            await Forum.findByIdAndUpdate(forumId, { status: 'archived' });

            // Archive associated posts
            await Post.updateMany({ forum_id: forumId }, { is_deleted: true });

            return { message: 'Forum archived successfully' };
        } catch (error) {
            // If any operation fails, throw the error
            throw new Error('Failed to archive forum: ' + error.message);
        }
    },

    async getForumMembers(forumId, userId) {
        const forum = await Forum.findById(forumId).populate('members', 'name email profile_image specialization');

        if (!forum) {
            throw new Error('Forum not found');
        }

        if (!forum.members.some((member) => member._id.toString() === userId)) {
            throw new Error('Access denied');
        }

        // Transform members to include role and ownership information
        const membersWithRoles = forum.members.map((member) => ({
            ...member.toObject(),
            is_owner: forum.created_by.toString() === member._id.toString(),
            role: forum.created_by.toString() === member._id.toString() ? 'owner' : 'member',
        }));

        // Add a field to indicate if the caller is the owner
        return {
            members: membersWithRoles,
            is_caller_owner: forum.created_by.toString() === userId,
        };
    },

    async getForumResources(forumId, userId) {
        const forum = await Forum.findById(forumId);
        if (!forum) {
            throw new Error('Forum not found');
        }

        if (!forum.members.includes(userId)) {
            throw new Error('Access denied');
        }

        return await Resource.find({
            forum_id: forumId,
            related_type: 'post',
            related_id: {
                $in: (
                    await Post.find({
                        forum_id: forumId,
                        is_deleted: false,
                    }).select('_id')
                ).map((post) => post._id),
            },
        })
            .populate('uploaded_by', 'name email')
            .sort({ created_at: -1 });
    },

    async removeMember(forumId, userId, memberId) {
        const forum = await Forum.findById(forumId);
        if (!forum) {
            throw new Error('Forum not found');
        }

        if (forum.created_by.toString() !== userId) {
            throw new Error('Only forum owner can remove members');
        }

        if (forum.created_by.toString() === memberId) {
            throw new Error('Cannot remove forum owner');
        }

        return await Forum.findByIdAndUpdate(forumId, { $pull: { members: memberId } }, { new: true });
    },

    async leaveForum(forumId, userId) {
        const forum = await Forum.findById(forumId);
        if (!forum) {
            throw new Error('Forum not found');
        }

        // Check if user is actually a member
        if (!forum.members.includes(userId)) {
            throw new Error('User is not a member of this forum');
        }

        // Prevent owner from leaving
        if (forum.created_by.toString() === userId) {
            throw new Error('Forum owner cannot leave the forum');
        }

        // Remove user from forum members
        return await Forum.findByIdAndUpdate(forumId, { $pull: { members: userId } }, { new: true }).populate(
            'created_by',
            'name email'
        );
    },
};

export default forumService;

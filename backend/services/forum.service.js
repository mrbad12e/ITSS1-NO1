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

        if (!forum.members.some(member => member._id.toString() === userId)) {
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
        Object.keys(updateData).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = updateData[key];
            }
        });

        return await Forum.findByIdAndUpdate(
            forumId,
            { $set: updates },
            { new: true }
        ).populate('created_by', 'name email');
    },

    async deleteForum(forumId, userId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const forum = await Forum.findOne({ _id: forumId, created_by: userId });
            if (!forum) {
                throw new Error('Forum not found or unauthorized');
            }

            // Archive forum instead of deleting
            await Forum.findByIdAndUpdate(
                forumId,
                { status: 'archived' },
                { session }
            );

            // Archive associated posts
            await Post.updateMany(
                { forum_id: forumId },
                { is_deleted: true },
                { session }
            );

            await session.commitTransaction();
            return { message: 'Forum archived successfully' };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    },

    async getForumMembers(forumId, userId) {
        const forum = await Forum.findById(forumId)
            .populate('members', 'name email profile_image specialization');

        if (!forum) {
            throw new Error('Forum not found');
        }

        if (!forum.members.some(member => member._id.toString() === userId)) {
            throw new Error('Access denied');
        }

        return forum.members;
    },

    async getForumResources(forumId, userId) {
        const forum = await Forum.findById(forumId);
        if (!forum) {
            throw new Error('Forum not found');
        }

        if (!forum.members.includes(userId)) {
            throw new Error('Access denied');
        }

        return await Resource.find({ forum_id: forumId })
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

        return await Forum.findByIdAndUpdate(
            forumId,
            { $pull: { members: memberId } },
            { new: true }
        );
    }
}

export default forumService;
import Post from '../models/post.model';
import Forum from '../models/forum.model';
import Resource from '../models/resource.model';

const postService = {
    async createPost(userId, postData, files = []) {
        const forum = await Forum.findById(postData.forum_id);
        if (!forum || !forum.members.includes(userId)) {
            throw new Error('Forum not found or access denied');
        }

        const post = new Post({
            ...postData,
            created_by: userId,
        });

        const savedPost = await post.save();

        if (files.length > 0) {
            const resources = files.map(file => ({
                ...file,
                uploaded_by: userId,
                forum_id: postData.forum_id,
                related_type: 'post',
                related_id: savedPost._id
            }));

            const savedResources = await Resource.insertMany(resources);
            savedPost.resources = savedResources.map(r => r._id);
            await savedPost.save();
        }

        return savedPost;
    },

    async getPost(postId, userId) {
        const post = await Post.findOne({ _id: postId, is_deleted: false })
            .populate('created_by', 'name email')
            .populate('resources')
            .populate('forum_id');

        if (!post) throw new Error('Post not found');

        const forum = await Forum.findById(post.forum_id);
        if (!forum.members.includes(userId)) {
            throw new Error('Access denied');
        }

        return post;
    },

    async updatePost(postId, userId, updateData, files = []) {
        const post = await Post.findOne({ 
            _id: postId, 
            created_by: userId,
            is_deleted: false 
        });

        if (!post) throw new Error('Post not found or unauthorized');

        const allowedUpdates = ['title', 'content'];
        const updates = Object.fromEntries(
            Object.entries(updateData).filter(([key]) => allowedUpdates.includes(key))
        );
        updates.updated_at = new Date();

        if (files.length > 0) {
            const resources = files.map(file => ({
                ...file,
                uploaded_by: userId,
                forum_id: post.forum_id,
                related_type: 'post',
                related_id: post._id
            }));

            const savedResources = await Resource.insertMany(resources);
            updates.resources = [...post.resources, ...savedResources.map(r => r._id)];
        }

        return await Post.findByIdAndUpdate(
            postId,
            { $set: updates },
            { new: true }
        ).populate('resources').populate('created_by', 'name email profile_image');
    },

    async deletePost(postId, userId) {
        const post = await Post.findOne({ 
            _id: postId, 
            created_by: userId,
            is_deleted: false 
        });

        if (!post) throw new Error('Post not found or unauthorized');

        return await Post.findByIdAndUpdate(
            postId,
            { 
                is_deleted: true,
                updated_at: new Date()
            },
            { new: true }
        );
    },

    async getForumPosts(forumId, userId) {
        const forum = await Forum.findById(forumId);
        if (!forum || !forum.members.includes(userId)) {
            throw new Error('Forum not found or access denied');
        }
    
        return await Post.find({ 
            forum_id: forumId,
            is_deleted: false 
        })
        .populate('created_by', 'name email profile_image')
        .populate({
            path: 'resources',
            select: 'title file_url mime_type size'
        })
        .sort({ created_at: -1 })
        .lean();
    }
};

export default postService;
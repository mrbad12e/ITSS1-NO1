import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    specialization: String,
    experience_years: Number,
    skills: [String],
    profile_image: String,
    refreshToken: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

// Correct export syntax
const User = mongoose.model('User', userSchema);
export default User;
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../../models/user.model.js';
const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
};

const refreshToken = async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is required' });
    }

    try {
        // Verify refresh token from database
        const user = await User.findOne({ refreshToken });

        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // Generate new tokens
        const accessToken = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        const newRefreshToken = generateRefreshToken();

        // Update refresh token in database
        user.refreshToken = newRefreshToken;
        await user.save();

        res.json({
            accessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        next(error);
    }
};

export default refreshToken;
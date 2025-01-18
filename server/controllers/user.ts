import { Request, Response } from 'express';
import User, { IUser } from '../models/user';
import { OAuth2Client } from 'google-auth-library';
import { generateAccessToken,generateRefreshToken } from '../middleware/auth';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleSignin = async (req: Request, res: Response): Promise<void> => {
    const credential = req.body.credential;
    if (!credential) {
        res.status(400).json({ message: 'Missing credential' });
        return;
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.sub) {
            res.status(400).json({ message: 'Invalid token' });
            return;
        }

        const email = payload.email || '';
        const name = payload.name || 'Unknown User';
        const picture = payload.picture || '';
        const sub = payload.sub;

        let user = await User.findOne({ email });

        if (user) {
            if (user.provider !== 'google') {
                user.provider = 'google';
                user.providerId = sub;
                user.username = user.username || name;
                user.profilePicture = user.profilePicture || picture;
                await user.save();
            }
        } else {
            user = new User({
                username: name,
                email,
                profilePicture: picture,
                provider: 'google',
                providerId: sub,
            });
            await user.save();
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();
        user.refreshTokens.push({
            token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
            validUntil: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
        });

        await user.save();

        res.status(200).json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                profilePicture: user.profilePicture,
            },
        });
    } catch (err) {
        console.error('Error verifying ID token:', err);
        res.status(400).json({ message: 'Invalid token or server error' });
    }
};

// Create a new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // If the user exists, return a conflict error
            res.status(409).json({ message: 'User already exists. Please login instead.' });
            return;
        }

        // Create a new user
        const user = new User({
            username,
            email,
            password,
            provider: 'local', // Indicate manual signup
        });

        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();

        // Save the refresh token
        user.refreshTokens.push({
            token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
            validUntil: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
        });

        await user.save();

        res.status(201).json({
            message: 'User created successfully',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user by ID
export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

export const getAuthenticatedUser = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Access token is required' });
        return;
    }

    const accessToken = authHeader.split(' ')[1]; // Extract the access token
    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as { id: string };
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        console.error('Access token verification error:', error);
        res.status(401).json({ message: 'Invalid or expired access token' });
    }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Missing email or password' });
        return;
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (!user.verifyPassword(password)) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();

        user.refreshTokens.push({
            token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
            validUntil: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
        });

        await user.save();

        res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        console.error('Sign-in error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(400).json({ message: 'Missing refresh token' });
        return;
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const user = await User.findOne({ 'refreshTokens.token': hashedToken });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        user.refreshTokens = user.refreshTokens.filter((t) => t.token !== hashedToken);
        await user.save();

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const user = await User.findOne({ 'refreshTokens.token': hashedToken });

        if (!user) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }

        const tokenIndex = user.refreshTokens.findIndex(
            (t) => t.token === hashedToken && t.validUntil > new Date()
        );

        if (tokenIndex === -1) {
            res.status(401).json({ message: 'Refresh token expired or invalid' });
            return;
        }

        // Rotate the refresh token
        const newRefreshToken = generateRefreshToken();
        user.refreshTokens[tokenIndex] = {
            token: crypto.createHash('sha256').update(newRefreshToken).digest('hex'),
            validUntil: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
        };

        await user.save();

        // Generate a new access token
        const accessToken = generateAccessToken(user);

        res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
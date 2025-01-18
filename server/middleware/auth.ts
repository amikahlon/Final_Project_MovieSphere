import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user';
import crypto from 'crypto';

// Constants for token expiration
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token

// Extend Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: { id: string; role: string };
        }
    }
}

// Middleware to check if a user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access token is missing' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { id: string; role: string };
        req.user = decoded; // Attach decoded user info to the request
        next();
    } catch (error) {
        console.error('Access token verification error:', error);
        res.status(401).json({ message: 'Invalid or expired access token' });
    }
};

// Middleware to check if a user is an admin
export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(403).json({ message: 'Access denied, no user information provided' });
            return;
        }
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            res.status(403).json({ message: 'Access denied, admin privileges required' });
            return;
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Generate Refresh Token
export const generateRefreshToken = (): string => {
    return crypto.randomBytes(64).toString('hex');
};

// Generate Access Token
export const generateAccessToken = (user: IUser): string => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role || 'user' },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

// Validate Access Token Middleware
export const validateAccessToken = (req: Request, res: Response, next: () => void): void => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access token is missing' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { id: string; role: string };
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired access token' });
    }
};

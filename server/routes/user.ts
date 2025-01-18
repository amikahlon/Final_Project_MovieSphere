import express from 'express';
import {
    googleSignin,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    getAuthenticatedUser,
    signin,
    logout,
    refreshToken
} from '../controllers/user';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = express.Router();

// Google signup/login
router.post('/google-signup', googleSignin);

// Google signin
router.post('/google-signin', googleSignin);

// Regular signup
router.post('/signup', createUser);

// Regular signin
router.post('/signin', signin);

// Regular logout
router.post('/logout', logout);

// Regular refresh-token
router.post('/refresh-token', refreshToken);

// Get authenticated user
router.get('/me', isAuthenticated, getAuthenticatedUser);

// Get user by ID
router.get('/:id', isAuthenticated, getUser);

// Update user
router.put('/:id', isAuthenticated, updateUser);

// Delete user
router.delete('/:id', isAuthenticated, isAdmin, deleteUser);

export default router;


import express from 'express';
import userRoutes from './user';

const router = express.Router();

// Use '/api/users' for user-related routes
router.use('/users', userRoutes);

export default router;

import express from "express";
import userRoutes from "./user";
import chatRoutes from "./chatgpt";
import postRoutes from "./post";

const router = express.Router();

// Use '/api/users' for user-related routes
router.use("/users", userRoutes);

// Use '/api/chatgpt' for ChatGPT-related routes
router.use("/post", postRoutes);

// Use '/api/chatgpt' for ChatGPT-related routes
router.use("/chatgpt", chatRoutes);

export default router;

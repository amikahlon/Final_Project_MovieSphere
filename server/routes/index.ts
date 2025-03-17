import express from "express";
import userRoutes from "./user";
import chatRoutes from "./chatgpt";
import postRoutes from "./post";
import commentRoutes from "./comment";

const router = express.Router();

// Use '/api/users' for user-related routes
router.use("/users", userRoutes);

// Use '/api/post' for post-related routes
router.use("/post", postRoutes);

// Use '/api/chatgpt' for ChatGPT-related routes
router.use("/chatgpt", chatRoutes);

// Use '/api/chatgpt' for ChatGPT-related routes
router.use("/comment", commentRoutes);

export default router;

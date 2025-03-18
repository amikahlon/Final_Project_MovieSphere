import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByUserId,
  updatePost,
  updatePostWithImages, // Add the new controller
  deletePost,
  likePost,
  unlikePost,
  getPopularPosts,
  searchPosts,
  deletePostsByUserId,
  getPostsInRange,
  getCurrentUserPosts,
  getPostsByRatingRange,
} from "../controllers/post";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/createPost", isAuthenticated, createPost);
router.get("/getAllPosts", isAuthenticated, getAllPosts);
router.get("/range", isAuthenticated, getPostsInRange);
router.get("/byRating", isAuthenticated, getPostsByRatingRange);
router.get("/myposts", isAuthenticated, getCurrentUserPosts);
router.get("/user/:userId", isAuthenticated, getPostsByUserId);
router.get("/:id", isAuthenticated, getPostById);
router.put("/:id", isAuthenticated, updatePost);
router.put("/:id/withImages", isAuthenticated, updatePostWithImages); // Add the new route
router.delete("/:id", isAuthenticated, deletePost);
router.post("/:id/like", isAuthenticated, likePost);
router.post("/:id/unlike", isAuthenticated, unlikePost);
router.get("/popular", isAuthenticated, getPopularPosts);
router.get("/search", isAuthenticated, searchPosts);
router.delete("/user/:userId", isAuthenticated, deletePostsByUserId);

export default router;

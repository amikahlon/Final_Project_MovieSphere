import express from "express";
import {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
} from "../controllers/comment";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/", isAuthenticated, createComment);
router.get("/:postId", isAuthenticated, getCommentsByPostId);
router.put("/:id", isAuthenticated, updateComment);
router.delete("/:id", isAuthenticated, deleteComment);

export default router;

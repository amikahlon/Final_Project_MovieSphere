import { Request, Response } from "express";
import Comment from "../models/comment";
import Post from "../models/Post";
import { Types } from "mongoose";

// Create a new comment
export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId, content } = req.body;
    const userId = req.user?.id;

    if (!postId || !content) {
      res.status(400).json({ message: "Post ID and content are required" });
      return;
    }

    // Ensure the post exists
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const comment = new Comment({
      postId,
      userId,
      content,
    });

    await comment.save();

    // Increment comments count in post
    post.commentsCount += 1;
    await post.save();

    res.status(201).json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get comments by Post ID
export const getCommentsByPostId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId }).populate("userId", "username email profilePicture");

    res.status(200).json(comments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update a comment
export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    if (comment.userId.toString() !== userId) {
      res.status(403).json({ message: "Unauthorized to edit this comment" });
      return;
    }

    comment.content = content;
    comment.updatedAt = new Date();
    await comment.save();

    res.status(200).json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    if (comment.userId.toString() !== userId) {
      res.status(403).json({ message: "Unauthorized to delete this comment" });
      return;
    }

    await Comment.findByIdAndDelete(id);

    // Decrement comments count in post
    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

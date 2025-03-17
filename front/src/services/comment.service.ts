import axios from "axios";
import axiosInstance from "./axios.service";

const COMMENT_API_URL = "/comment";

interface Comment {
  _id: string;
  postId: string;
  userId: { _id: string; username: string; profilePicture?: string };
  content: string;
  createdAt: string;
}

// Fetch all comments for a given post
const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  try {
    const response = await axiosInstance.get(`${COMMENT_API_URL}/${postId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to fetch comments";
      throw new Error(message);
    }
    throw new Error("An unknown error occurred");
  }
};

// Add a new comment
const addComment = async (postId: string, content: string): Promise<Comment> => {
  try {
    const response = await axiosInstance.post(COMMENT_API_URL, { postId, content });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to add comment";
      throw new Error(message);
    }
    throw new Error("An unknown error occurred");
  }
};

// Edit an existing comment
const editComment = async (commentId: string, content: string): Promise<Comment> => {
  try {
    const response = await axiosInstance.put(`${COMMENT_API_URL}/${commentId}`, { content });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to edit comment";
      throw new Error(message);
    }
    throw new Error("An unknown error occurred");
  }
};

// Delete a comment
const deleteComment = async (commentId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`${COMMENT_API_URL}/${commentId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to delete comment";
      throw new Error(message);
    }
    throw new Error("An unknown error occurred");
  }
};

// Export all the services
const commentService = {
  getCommentsByPostId,
  addComment,
  editComment,
  deleteComment,
};

export default commentService;

import axios from 'axios';
import axiosInstance from './axios.service';
import { IPost, Post } from 'interfaces/post.intefaces';

const POST_API_URL = '/post';

// Create a new post
const createPost = async (postData: FormData): Promise<IPost> => {
  try {
    const response = await axiosInstance.post(`${POST_API_URL}/createPost`, postData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Override Content-Type for this request
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to create the post';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

// Get all posts
const getAllPosts = async (): Promise<Post[]> => {
  try {
    const response = await axiosInstance.get(`${POST_API_URL}/getAllPosts`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to fetch posts';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

// Get posts by user ID
const getPostsByUserId = async (userId: string): Promise<Post[]> => {
  try {
    const response = await axiosInstance.get(`${POST_API_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to fetch user posts';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

// Get a post by ID
const getPostById = async (postId: string): Promise<Post> => {
  try {
    const response = await axiosInstance.get(`${POST_API_URL}/${postId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to fetch the post';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

// Update a post by ID
const updatePost = async (postId: string, postData: Partial<IPost>): Promise<Post> => {
  try {
    const response = await axiosInstance.put(`${POST_API_URL}/${postId}`, postData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to update the post';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

// Update a post with images
const updatePostWithImages = async (postId: string, formData: FormData): Promise<Post> => {
  try {
    const response = await axiosInstance.put(`${POST_API_URL}/${postId}/withImages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Override Content-Type for this request
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to update the post';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

// Delete a post by ID
const deletePost = async (postId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`${POST_API_URL}/${postId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to delete the post';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

// Like a post
const likePost = async (postId: string): Promise<void> => {
  try {
    await axiosInstance.post(`${POST_API_URL}/${postId}/like`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to like the post';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

// Unlike a post
const unlikePost = async (postId: string): Promise<void> => {
  try {
    await axiosInstance.post(`${POST_API_URL}/${postId}/unlike`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to unlike the post';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

// Get popular posts
const getPopularPosts = async (): Promise<Post[]> => {
  try {
    const response = await axiosInstance.get(`${POST_API_URL}/popular`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to fetch popular posts';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

// Search posts by query
const searchPosts = async (query: string): Promise<Post[]> => {
  try {
    const response = await axiosInstance.get(`${POST_API_URL}/search`, {
      params: { query },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to search posts';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

// Delete posts by user ID (admin)
const deletePostsByUserId = async (userId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`${POST_API_URL}/user/${userId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to delete user posts';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

// Get posts by range (startIndex to endIndex)
const getPostsInRange = async (
  startIndex: number,
  endIndex: number,
): Promise<{ posts: Post[]; totalPosts: number }> => {
  try {
    const response = await axiosInstance.get(`${POST_API_URL}/range`, {
      params: { startIndex, endIndex },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to fetch posts by range';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

// Get current user's posts
const getCurrentUserPosts = async (): Promise<Post[]> => {
  try {
    const response = await axiosInstance.get(`${POST_API_URL}/myposts`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to fetch current user posts';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

// Get posts filtered by rating range
const getPostsByRatingRange = async (
  minRating: number,
  maxRating: number,
  startIndex: number,
  endIndex: number,
): Promise<{ posts: Post[]; totalPosts: number }> => {
  try {
    const response = await axiosInstance.get(`${POST_API_URL}/byRating`, {
      params: { minRating, maxRating, startIndex, endIndex },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to fetch posts by rating range';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

// Export all the services
const postService = {
  createPost,
  getAllPosts,
  getPostsByUserId,
  getPostById,
  updatePost,
  updatePostWithImages, // Add the new service
  deletePost,
  likePost,
  unlikePost,
  getPopularPosts,
  searchPosts,
  deletePostsByUserId,
  getPostsInRange,
  getCurrentUserPosts,
  getPostsByRatingRange,
};

export default postService;

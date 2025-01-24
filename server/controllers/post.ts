import { Request, Response } from "express";
import Post from "../models/Post";
import {
  uploadImages,
} from "../middleware/filesupload";
import fs from 'fs';
import path from 'path';

// Create a new post
export const createPost = [
  // Middleware to handle image uploads (array of files)
  uploadImages.array("images", 10), // Allow up to 10 images with the field name "images"

  async (req: Request, res: Response): Promise<void> => {
    try {
      // Ensure `req.files` is defined
      const files = req.files as Express.Multer.File[];

      // Construct the `images` array with public URLs
      const imageUrls = files.map((file) => `/public/images/${file.filename}`);

      // Create the post with the uploaded image URLs
      const tempPost = {
        ...req.body,
        images: imageUrls,
        userId: req.user?.id,
      };

      const post = new Post(tempPost);
      const savedPost = await post.save();

      res.status(201).json(savedPost);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
];

// Get a post by ID
export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    res.status(200).json(post);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all posts
export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

// Update a post by ID
export const updatePost = [
  uploadImages.array('images', 10), // Middleware to handle new image uploads
  async (req: Request, res: Response): Promise<void> => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }

      // If new files are uploaded, replace the old images
      let updatedImages = post.images; // Keep existing images by default
      if (req.files && Array.isArray(req.files)) {
        const files = req.files as Express.Multer.File[];

        // Generate new image URLs
        updatedImages = files.map((file) => `/public/images/${file.filename}`);

        // Delete old images from the file system
        post.images.forEach((imagePath) => {
          const filePath = path.join(__dirname, `..${imagePath}`);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }

      // Update the post with the new data
      const updatedData = {
        ...req.body,
        images: updatedImages,
      };

      const updatedPost = await Post.findByIdAndUpdate(req.params.id, updatedData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json(updatedPost);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
];

// Delete a post by ID
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Delete associated images from the file system
    post.images.forEach((imagePath) => {
      const filePath = path.join(__dirname, `..${imagePath}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Delete the post from the database
    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get posts by user ID
export const getPostsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId });
    if (posts.length === 0) {
      res.status(404).json({ message: "No posts found for this user" });
      return;
    }
    res.status(200).json(posts);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

// Like a post
export const likePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Post ID
    const { userId } = req.body; // User ID

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // Check if the user already liked the post
    if (post.likes.includes(userId)) {
      res.status(400).json({ message: "You already liked this post" });
      return;
    }

    post.likes.push(userId); // Add the user to the likes array
    await post.save();

    res.status(200).json({ message: "Post liked successfully", likes: post.likes });
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

// Unlike a post
export const unlikePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Post ID
    const { userId } = req.body; // User ID

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // Check if the user has liked the post
    if (!post.likes.includes(userId)) {
      res.status(400).json({ message: "You haven't liked this post" });
      return;
    }

    post.likes = post.likes.filter((like) => like.toString() !== userId); // Remove the user from likes
    await post.save();

    res.status(200).json({ message: "Post unliked successfully", likes: post.likes });
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

// Get popular posts
export const getPopularPosts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Post.find().sort({ likes: -1 }); // Sort by likes in descending order
    res.status(200).json(posts);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

// Search posts
export const searchPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      res.status(400).json({ message: "Query parameter is required" });
      return;
    }

    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { review: { $regex: query, $options: "i" } },
      ],
    });

    if (posts.length === 0) {
      res.status(404).json({ message: "No posts found" });
      return;
    }

    res.status(200).json(posts);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

// Update comments count
export const updateCommentsCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Post ID
    const { commentsCount } = req.body; // New comments count

    const post = await Post.findByIdAndUpdate(
      id,
      { commentsCount },
      { new: true, runValidators: true }
    );

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(200).json(post);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete posts by user ID
export const deletePostsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ userId });

    if (posts.length === 0) {
      res.status(404).json({ message: 'No posts found for this user' });
      return;
    }

    // Delete associated images for all posts
    posts.forEach((post) => {
      post.images.forEach((imagePath) => {
        const filePath = path.join(__dirname, `..${imagePath}`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    });

    // Delete posts from the database
    await Post.deleteMany({ userId });

    res.status(200).json({ message: 'Posts deleted successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
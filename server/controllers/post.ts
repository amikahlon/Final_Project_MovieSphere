import { Request, Response } from "express";
import Post from "../models/post";
import { uploadImages } from "../middleware/filesupload";
import fs from "fs";
import path from "path";
import User from "../models/user";
import { Types } from "mongoose";

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
export const getPostById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Find the post by ID
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // Populate the user field
    const user = await User.findById(post.userId).select(
      "username email profilePicture"
    ); // Select specific fields to include in the response

    // Check if the requesting user has liked the post
    const userId = new Types.ObjectId(req.user?.id); // Convert req.user.id to ObjectId
    const hasLiked = post.likes.some((likeId) => likeId.equals(userId)); // Use equals() for ObjectId comparison

    res.status(200).json({
      ...post.toObject(), // Convert Mongoose document to plain object
      user, // Add the populated user data
      hasLiked, // Include the `hasLiked` status
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all posts
export const getAllPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update a post by ID
export const updatePost = [
  uploadImages.array("images", 10), // Middleware to handle new image uploads
  async (req: Request, res: Response): Promise<void> => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        res.status(404).json({ message: "Post not found" });
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

      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        updatedData,
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).json(updatedPost);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
];

// Update post with images
export const updatePostWithImages = [
  uploadImages.array("images", 10), // Middleware to handle new image uploads
  async (req: Request, res: Response): Promise<void> => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      // Verify post ownership
      if (post.userId.toString() !== req.user?.id) {
        res.status(403).json({ message: "Not authorized to edit this post" });
        return;
      }

      // Parse the update data from the request
      const updateData = JSON.parse(req.body.updateData || "{}");

      // Process existing images to keep
      const existingImages = updateData.existingImages || [];

      // Process images to delete
      const imagesToDelete = updateData.imagesToDelete || [];

      // Delete images from filesystem
      imagesToDelete.forEach((imagePath: string) => {
        const filePath = path.join(__dirname, `..${imagePath}`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      // Process new images from request
      const files = req.files as Express.Multer.File[];
      const newImageUrls = files.map(
        (file) => `/public/images/${file.filename}`
      );

      // Combine existing images with new images
      const updatedImages = [...existingImages, ...newImageUrls];

      // Remove updateData properties we've already processed
      delete updateData.existingImages;
      delete updateData.imagesToDelete;

      // Update the post with the new data
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        { ...updateData, images: updatedImages },
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).json(updatedPost);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
];

// Delete a post by ID
export const deletePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
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

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get posts by user ID
export const getPostsByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId });
    if (posts.length === 0) {
      res.status(404).json({ message: "No posts found for this user" });
      return;
    }
    res.status(200).json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Like a post
export const likePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Post ID
    const userId = req.user?.id; // User ID

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    if (!userId) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    const userObjectId = new Types.ObjectId(userId); // Convert userId to ObjectId

    // Check if the user already liked the post
    if (post.likes.includes(userObjectId)) {
      res.status(400).json({ message: "You already liked this post" });
      return;
    }

    post.likes.push(userObjectId); // Add the user to the likes array
    await post.save();

    res
      .status(200)
      .json({ message: "Post liked successfully", likes: post.likes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Unlike a post
export const unlikePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; // Post ID
    const userId = req.user?.id; // User ID

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    if (!userId) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    const userObjectId = new Types.ObjectId(userId); // Convert userId to ObjectId

    // Check if the user has liked the post
    if (!post.likes.includes(userObjectId)) {
      res.status(400).json({ message: "You haven't liked this post" });
      return;
    }

    post.likes = post.likes.filter((like) => like.toString() !== userId); // Remove the user from likes
    await post.save();

    res
      .status(200)
      .json({ message: "Post unliked successfully", likes: post.likes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get popular posts
export const getPopularPosts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const posts = await Post.find().sort({ likes: -1 }); // Sort by likes in descending order
    res.status(200).json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Search posts
export const searchPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update comments count
export const updateCommentsCount = async (
  req: Request,
  res: Response
): Promise<void> => {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete posts by user ID
export const deletePostsByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ userId });

    if (posts.length === 0) {
      res.status(404).json({ message: "No posts found for this user" });
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

    res.status(200).json({ message: "Posts deleted successfully" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getPostsInRange = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const startIndex = parseInt(req.query.startIndex as string, 10) || 0;
    const endIndex = parseInt(req.query.endIndex as string, 10) || 10;

    // Validate indices
    if (startIndex < 0 || endIndex <= startIndex) {
      res.status(400).json({ message: "Invalid range parameters" });
      return;
    }

    // Fetch the total number of posts
    const totalPosts = await Post.countDocuments();

    // Fetch the posts in the given range
    const posts = await Post.find()
      .skip(startIndex)
      .limit(endIndex - startIndex)
      .sort({ createdAt: -1 }); // Optional: Sort by latest posts

    // Return the posts and total count
    res.status(200).json({ posts, totalPosts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get posts for the currently authenticated user
export const getCurrentUserPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const posts = await Post.find({ userId }).sort({ createdAt: -1 });

    if (posts.length === 0) {
      res.status(200).json({ message: "No posts found", posts: [] });
      return;
    }

    res.status(200).json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get posts filtered by rating range
export const getPostsByRatingRange = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const minRating = parseFloat(req.query.minRating as string) || 0;
    const maxRating = parseFloat(req.query.maxRating as string) || 10;
    const startIndex = parseInt(req.query.startIndex as string, 10) || 0;
    const endIndex = parseInt(req.query.endIndex as string, 10) || 10;

    // Validate rating range
    if (minRating < 0 || maxRating > 10 || minRating > maxRating) {
      res.status(400).json({ message: "Invalid rating range parameters" });
      return;
    }

    // Validate indices
    if (startIndex < 0 || endIndex <= startIndex) {
      res.status(400).json({ message: "Invalid range parameters" });
      return;
    }

    // Count total posts matching the rating criteria
    const totalPosts = await Post.countDocuments({
      rating: { $gte: minRating, $lte: maxRating },
    });

    // If no posts match, return empty array with totalPosts = 0
    if (totalPosts === 0) {
      res.status(200).json({ posts: [], totalPosts: 0 });
      return;
    }

    // Fetch posts with rating in the specified range
    const posts = await Post.find({
      rating: { $gte: minRating, $lte: maxRating },
    })
      .skip(startIndex)
      .limit(endIndex - startIndex)
      .sort({ createdAt: -1 }); // Sort by newest first

    // Return the posts and total count
    res.status(200).json({ posts, totalPosts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

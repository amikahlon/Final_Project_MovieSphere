import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByUserId,
  updatePost,
  updatePostWithImages,
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

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - movieName
 *         - moviePosterURL
 *         - movieId
 *         - userId
 *         - title
 *         - review
 *         - rating
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the post
 *         movieName:
 *           type: string
 *           description: Name of the movie
 *         moviePosterURL:
 *           type: string
 *           description: URL to the movie poster
 *         movieId:
 *           type: string
 *           description: External movie ID reference
 *         userId:
 *           type: string
 *           description: ID of the user who created the post
 *         title:
 *           type: string
 *           description: Title of the post
 *         review:
 *           type: string
 *           description: Movie review content
 *         rating:
 *           type: number
 *           description: Movie rating (0-10)
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs to uploaded images
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of users who liked the post
 *         commentsCount:
 *           type: number
 *           description: Count of comments on the post
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /post/createPost:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               movieName:
 *                 type: string
 *               moviePosterURL:
 *                 type: string
 *               movieId:
 *                 type: string
 *               title:
 *                 type: string
 *               review:
 *                 type: string
 *               rating:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/createPost", isAuthenticated, createPost);

/**
 * @swagger
 * /post/getAllPosts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/getAllPosts", isAuthenticated, getAllPosts);

/**
 * @swagger
 * /post/range:
 *   get:
 *     summary: Get posts within a specified range
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startIndex
 *         schema:
 *           type: integer
 *         description: Starting index for pagination
 *       - in: query
 *         name: endIndex
 *         schema:
 *           type: integer
 *         description: Ending index for pagination
 *     responses:
 *       200:
 *         description: List of posts within range and total count
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
router.get("/range", isAuthenticated, getPostsInRange);

/**
 * @swagger
 * /post/byRating:
 *   get:
 *     summary: Get posts by rating range
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: Minimum rating (0-10)
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: number
 *         description: Maximum rating (0-10)
 *       - in: query
 *         name: startIndex
 *         schema:
 *           type: integer
 *         description: Starting index for pagination
 *       - in: query
 *         name: endIndex
 *         schema:
 *           type: integer
 *         description: Ending index for pagination
 *     responses:
 *       200:
 *         description: List of posts within rating range
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
router.get("/byRating", isAuthenticated, getPostsByRatingRange);

/**
 * @swagger
 * /post/myposts:
 *   get:
 *     summary: Get current user's posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the current user's posts
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/myposts", isAuthenticated, getCurrentUserPosts);

/**
 * @swagger
 * /post/user/{userId}:
 *   get:
 *     summary: Get posts by user ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of user's posts
 *       404:
 *         description: No posts found or user not found
 *       500:
 *         description: Server error
 */
router.get("/user/:userId", isAuthenticated, getPostsByUserId);

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get("/:id", isAuthenticated, getPostById);

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               review:
 *                 type: string
 *               rating:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put("/:id", isAuthenticated, updatePost);

/**
 * @swagger
 * /post/{id}/withImages:
 *   put:
 *     summary: Update a post with images management
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               updateData:
 *                 type: string
 *                 description: JSON string containing update data including existingImages and imagesToDelete
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       403:
 *         description: Not authorized to edit this post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put("/:id/withImages", isAuthenticated, updatePostWithImages);

/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", isAuthenticated, deletePost);

/**
 * @swagger
 * /post/{id}/like:
 *   post:
 *     summary: Like a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post liked successfully
 *       400:
 *         description: Already liked this post
 *       404:
 *         description: Post or user not found
 *       500:
 *         description: Server error
 */
router.post("/:id/like", isAuthenticated, likePost);

/**
 * @swagger
 * /post/{id}/unlike:
 *   post:
 *     summary: Unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post unliked successfully
 *       400:
 *         description: Haven't liked this post
 *       404:
 *         description: Post or user not found
 *       500:
 *         description: Server error
 */
router.post("/:id/unlike", isAuthenticated, unlikePost);

/**
 * @swagger
 * /post/popular:
 *   get:
 *     summary: Get popular posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of popular posts
 *       500:
 *         description: Server error
 */
router.get("/popular", isAuthenticated, getPopularPosts);

/**
 * @swagger
 * /post/search:
 *   get:
 *     summary: Search posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Query parameter is required
 *       404:
 *         description: No posts found
 *       500:
 *         description: Server error
 */
router.get("/search", isAuthenticated, searchPosts);

/**
 * @swagger
 * /post/user/{userId}:
 *   delete:
 *     summary: Delete all posts by user ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: Posts deleted successfully
 *       404:
 *         description: No posts found for this user
 *       500:
 *         description: Server error
 */
router.delete("/user/:userId", isAuthenticated, deletePostsByUserId);

export default router;

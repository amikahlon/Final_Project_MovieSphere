import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../server";
import Comment from "../models/comment";
import User, { IUser } from "../models/user";
import Post, { IPost } from "../models/post";
import jwt from "jsonwebtoken";
import {
  describe,
  afterAll,
  beforeEach,
  it,
  expect,
  beforeAll,
  jest,
} from "@jest/globals";

describe("Comment API Tests", () => {
  let mongoServer: MongoMemoryServer;
  let testUser: IUser;
  let testPost: IPost & { _id: mongoose.Types.ObjectId };
  let accessToken: string;

  beforeAll(async () => {
    // הקמת MongoDB למבחנים
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // התחברות ל-MongoDB
    await mongoose.connect(mongoUri);

    // קביעת סוד הטוקן לטסטים
    process.env.ACCESS_TOKEN_SECRET = "test-secret-key";
  });

  afterAll(async () => {
    // ניקוי בסיס הנתונים וסגירת החיבור
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // ניקוי נתונים מהקולקציות לפני כל טסט
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});

    // יצירת משתמש לטסטים
    testUser = await User.create({
      username: "commenttester",
      email: "commenttest@example.com",
      password: "password123",
      role: "user",
    });

    // שינוי בהגדרת משתנה testPost - אנחנו יוצרים את הפוסט ואז מבצעים המרה מפורשת של הטיפוס
    const createdPost = await Post.create({
      movieName: "Test Movie",
      moviePosterURL: "http://example.com/poster.jpg",
      movieId: "tt1234567",
      userId: testUser._id,
      title: "Great Movie Review",
      review: "This is an amazing movie!",
      rating: 9,
      images: [],
    });

    testPost = createdPost.toObject() as unknown as IPost & {
      _id: mongoose.Types.ObjectId;
    };

    // יצירת טוקן גישה לטסטים
    accessToken = jwt.sign(
      { id: testUser._id.toString(), role: "user" },
      process.env.ACCESS_TOKEN_SECRET || "test-secret-key"
    );
  });

  describe("POST /api/comment", () => {
    it("should create a new comment", async () => {
      const commentData = {
        postId: testPost._id.toString(),
        content: "This is a test comment",
      };

      const response = await request(app)
        .post("/api/comment")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(commentData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("postId", testPost._id.toString());
      expect(response.body).toHaveProperty("userId", testUser._id.toString());
      expect(response.body).toHaveProperty("content", "This is a test comment");

      // בדיקה שהתגובה נוספה למסד הנתונים
      const comments = await Comment.find();
      expect(comments).toHaveLength(1);

      // בדיקה שמספר התגובות בפוסט התעדכן
      const updatedPost = await Post.findById(testPost._id);
      expect(updatedPost?.commentsCount).toBe(1);
    });

    it("should return 400 when postId is missing", async () => {
      const commentData = {
        content: "This is a test comment",
      };

      const response = await request(app)
        .post("/api/comment")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(commentData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Post ID and content are required"
      );
    });

    it("should return 400 when content is missing", async () => {
      const commentData = {
        postId: testPost._id.toString(),
      };

      const response = await request(app)
        .post("/api/comment")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(commentData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Post ID and content are required"
      );
    });

    it("should return 404 when post does not exist", async () => {
      const nonExistentPostId = new mongoose.Types.ObjectId().toString();
      const commentData = {
        postId: nonExistentPostId,
        content: "This is a test comment",
      };

      const response = await request(app)
        .post("/api/comment")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(commentData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Post not found");
    });
  });

  describe("GET /api/comment/:postId", () => {
    it("should get all comments for a post", async () => {
      // יצירת מספר תגובות לבדיקה
      await Comment.create({
        postId: testPost._id,
        userId: testUser._id,
        content: "First comment",
      });

      await Comment.create({
        postId: testPost._id,
        userId: testUser._id,
        content: "Second comment",
      });

      const response = await request(app)
        .get(`/api/comment/${testPost._id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("content", "First comment");
      expect(response.body[1]).toHaveProperty("content", "Second comment");
    });

    it("should return empty array when no comments exist for post", async () => {
      const response = await request(app)
        .get(`/api/comment/${testPost._id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe("PUT /api/comment/:id", () => {
    it("should update a comment when user is the owner", async () => {
      // יצירת תגובה לעדכון
      const comment = await Comment.create({
        postId: testPost._id,
        userId: testUser._id,
        content: "Original comment",
      });

      const updateData = {
        content: "Updated comment",
      };

      const response = await request(app)
        .put(`/api/comment/${comment._id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("content", "Updated comment");

      // וידוא שהתגובה התעדכנה במסד הנתונים
      const updatedComment = await Comment.findById(comment._id);
      expect(updatedComment?.content).toBe("Updated comment");
    });

    it("should return 403 when user is not the comment owner", async () => {
      // יצירת משתמש אחר
      const anotherUser = await User.create({
        username: "anotheruser",
        email: "another@example.com",
        password: "password123",
        role: "user",
      });

      // יצירת תגובה של המשתמש האחר
      const comment = await Comment.create({
        postId: testPost._id,
        userId: anotherUser._id,
        content: "Another user's comment",
      });

      const updateData = {
        content: "Trying to update someone else's comment",
      };

      const response = await request(app)
        .put(`/api/comment/${comment._id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        "message",
        "Unauthorized to edit this comment"
      );
    });

    it("should return 404 when comment does not exist", async () => {
      const nonExistentCommentId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        content: "Updated content",
      };

      const response = await request(app)
        .put(`/api/comment/${nonExistentCommentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Comment not found");
    });
  });

  describe("DELETE /api/comment/:id", () => {
    it("should delete a comment when user is the owner", async () => {
      // יצירת תגובה למחיקה
      const comment = await Comment.create({
        postId: testPost._id,
        userId: testUser._id,
        content: "Comment to delete",
      });

      // עדכון מספר התגובות בפוסט
      await Post.findByIdAndUpdate(testPost._id, {
        $inc: { commentsCount: 1 },
      });

      const response = await request(app)
        .delete(`/api/comment/${comment._id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Comment deleted successfully"
      );

      // וידוא שהתגובה נמחקה ממסד הנתונים
      const deletedComment = await Comment.findById(comment._id);
      expect(deletedComment).toBeNull();

      // וידוא שמספר התגובות בפוסט התעדכן
      const updatedPost = await Post.findById(testPost._id);
      expect(updatedPost?.commentsCount).toBe(0);
    });

    it("should return 403 when user is not the comment owner", async () => {
      // יצירת משתמש אחר
      const anotherUser = await User.create({
        username: "anotheruser",
        email: "another@example.com",
        password: "password123",
        role: "user",
      });

      // יצירת תגובה של המשתמש האחר
      const comment = await Comment.create({
        postId: testPost._id,
        userId: anotherUser._id,
        content: "Another user's comment",
      });

      const response = await request(app)
        .delete(`/api/comment/${comment._id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        "message",
        "Unauthorized to delete this comment"
      );
    });

    it("should return 404 when comment does not exist", async () => {
      const nonExistentCommentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .delete(`/api/comment/${nonExistentCommentId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Comment not found");
    });
  });
});

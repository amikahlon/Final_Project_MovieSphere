import request from "supertest";
import mongoose from "mongoose";
import { app } from "../server";
import User, { IUser } from "../models/user";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  describe,
  afterAll,
  beforeEach,
  it,
  expect,
  beforeAll,
  jest,
} from "@jest/globals";
import jwt from "jsonwebtoken";
import { generateRefreshToken } from "../middleware/auth";
import crypto from "crypto";
import { AuthErrorCode } from "../middleware/auth";

describe("User Authentication Tests", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // הפעלת MongoDB Mock
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // התחברות ל-MongoDB Mock
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase(); // מחיקת מסד הנתונים בזיכרון
    await mongoose.connection.close(); // סגירת החיבור
    await mongoServer.stop(); // עצירת MongoDB Mock
  });

  beforeEach(async () => {
    // ניקוי מסמכים ממסד הנתונים לפני כל בדיקה
    await User.deleteMany({});
  });

  describe("POST /api/users/signup", () => {
    it("should create a new user and return only access token", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "Test123!",
      };

      const response = await request(app)
        .post("/api/users/signup")
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).not.toHaveProperty("refreshToken"); // Verify no refresh token is returned
      expect(response.body.user).toHaveProperty("email", userData.email);

      // Verify refresh token was saved in database
      const user = await User.findOne({ email: userData.email });
      expect(user?.refreshTokens.length).toBeGreaterThan(0);
    });

    it("should not create user with existing email", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "Test123!",
      };

      await request(app).post("/api/users/signup").send(userData);

      const response = await request(app)
        .post("/api/users/signup")
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty(
        "message",
        "User already exists. Please login instead."
      );
    });

    it("should not create user with missing required fields", async () => {
      const incompleteUserData = {
        username: "testuser",
      };

      const response = await request(app)
        .post("/api/users/signup")
        .send(incompleteUserData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Missing required fields"
      );
    });
  });

  describe("POST /api/users/signin", () => {
    let testUser: IUser;

    beforeEach(async () => {
      // Create a test user
      testUser = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
        role: "user",
      });
    });

    it("should sign in successfully and return only access token", async () => {
      const credentials = {
        email: "test@example.com",
        password: "Password123!",
      };

      const response = await request(app)
        .post("/api/users/signin")
        .send(credentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).not.toHaveProperty("refreshToken"); // Verify no refresh token is returned
      expect(response.body.user).toBeDefined();
    });

    it("should return 400 when email is missing", async () => {
      const credentials = {
        password: "Password123!",
      };

      const response = await request(app)
        .post("/api/users/signin")
        .send(credentials);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Missing email or password"
      );
    });

    it("should return 400 when password is missing", async () => {
      const credentials = {
        email: "test@example.com",
      };

      const response = await request(app)
        .post("/api/users/signin")
        .send(credentials);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Missing email or password"
      );
    });

    it("should return 404 when user is not found", async () => {
      const credentials = {
        email: "nonexistent@example.com",
        password: "Password123!",
      };

      const response = await request(app)
        .post("/api/users/signin")
        .send(credentials);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "User not found");
    });

    it("should return 401 when password is incorrect", async () => {
      const credentials = {
        email: "test@example.com",
        password: "WrongPassword123!",
      };

      const response = await request(app)
        .post("/api/users/signin")
        .send(credentials);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid email or password"
      );
    });

    it("should handle server errors appropriately", async () => {
      // Mock User.findOne to throw an error
      jest.spyOn(User, "findOne").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const credentials = {
        email: "test@example.com",
        password: "Password123!",
      };

      const response = await request(app)
        .post("/api/users/signin")
        .send(credentials);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Server error");
    });
  });

  describe("POST /api/users/logout", () => {
    let testUser: IUser;
    let validRefreshToken: string;

    beforeEach(async () => {
      // Create a test user
      testUser = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      // Generate a valid refresh token
      validRefreshToken = generateRefreshToken();
      const hashedToken = crypto
        .createHash("sha256")
        .update(validRefreshToken)
        .digest("hex");

      // Add refresh token to user
      testUser.refreshTokens.push({
        token: hashedToken,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      await testUser.save();
    });

    it("should log out successfully with valid refresh token", async () => {
      const response = await request(app)
        .post("/api/users/logout")
        .send({ refreshToken: validRefreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Logged out successfully"
      );

      // Verify token was removed
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.refreshTokens).toHaveLength(0);
    });

    it("should return 400 when refresh token is missing", async () => {
      const response = await request(app).post("/api/users/logout").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Missing refresh token");
    });

    it("should return 404 when user with refresh token is not found", async () => {
      const nonExistentToken = generateRefreshToken();
      const response = await request(app)
        .post("/api/users/logout")
        .send({ refreshToken: nonExistentToken });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "User not found");
    });

    it("should handle server errors appropriately", async () => {
      // Mock User.findOne to throw an error
      jest.spyOn(User, "findOne").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const response = await request(app)
        .post("/api/users/logout")
        .send({ refreshToken: validRefreshToken });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Server error");
    });
  });

  describe("DELETE /api/users/:id", () => {
    let testUser: IUser;
    let adminUser: IUser;
    let adminToken: string;
    let userToken: string;

    beforeEach(async () => {
      // Create an admin user
      adminUser = await User.create({
        username: "adminuser",
        email: "admin@example.com",
        password: "Admin123!",
        role: "admin",
      });

      // Create a regular test user
      testUser = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      // Generate tokens
      adminToken = jwt.sign(
        { id: adminUser._id, role: "admin" },
        process.env.ACCESS_TOKEN_SECRET || "test-secret-key"
      );

      userToken = jwt.sign(
        { id: testUser._id, role: "user" },
        process.env.ACCESS_TOKEN_SECRET || "test-secret-key"
      );
    });

    it("should delete user successfully with valid ID and admin rights", async () => {
      const response = await request(app)
        .delete(`/api/users/${testUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "User deleted successfully"
      );

      // Verify user was actually deleted
      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser).toBeNull();
    });

    it("should return 400 for invalid user ID format", async () => {
      const response = await request(app)
        .delete("/api/users/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: AuthErrorCode.INVALID_REQUEST,
        message: "Invalid user ID",
        error: "invalid_id",
      });
    });

    it("should return 404 for non-existent user", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/users/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        code: AuthErrorCode.NO_USER,
        message: "User not found",
        error: "user_not_found",
      });
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).delete(`/api/users/${testUser._id}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Access token is required"
      );
    });

    it("should handle server errors appropriately", async () => {
      // Mock User.findByIdAndDelete to throw an error
      jest.spyOn(User, "findByIdAndDelete").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const response = await request(app)
        .delete(`/api/users/${testUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Server error");
    });

    it("should not allow non-admin users to delete other users", async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUser._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        "message",
        "Access denied, admin privileges required"
      );
    });
  });

  describe("GET /api/users/:id", () => {
    let testUser: IUser;
    let accessToken: string;

    beforeEach(async () => {
      // Create a test user
      testUser = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      // Generate access token for authentication
      accessToken = jwt.sign(
        { id: testUser._id, role: "user" },
        process.env.ACCESS_TOKEN_SECRET || "test-secret-key"
      );
    });

    it("should get user by valid ID", async () => {
      const response = await request(app)
        .get(`/api/users/${testUser._id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("email", testUser.email);
      expect(response.body).toHaveProperty("username", testUser.username);
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .get("/api/users/invalid-id-format")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: AuthErrorCode.INVALID_REQUEST,
        message: "Invalid user ID",
        error: "invalid_id",
      });
    });

    it("should return 404 for non-existent user", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        code: AuthErrorCode.NO_USER,
        message: "User not found",
        error: "user_not_found",
      });
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get(`/api/users/${testUser._id}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Access token is required"
      );
    });

    it("should handle server errors appropriately", async () => {
      // Mock User.findById to throw an error
      jest.spyOn(User, "findById").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const response = await request(app)
        .get(`/api/users/${testUser._id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Internal server error");
    });
  });

  describe("UPDATE /api/users/:id", () => {
    let testUser: IUser;
    let accessToken: string;

    beforeEach(async () => {
      // Create a test user
      testUser = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      // Generate access token for authentication
      accessToken = jwt.sign(
        { id: testUser._id, role: "user" },
        process.env.ACCESS_TOKEN_SECRET || "test-secret-key"
      );
    });

    it("should update user successfully with valid data", async () => {
      const updateData = {
        username: "updateduser",
        email: "updated@example.com",
      };

      const response = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "User updated successfully"
      );
      expect(response.body.user).toHaveProperty("username", "updateduser");
      expect(response.body.user).toHaveProperty("email", "updated@example.com");
    });

    it("should return 400 for invalid user ID format", async () => {
      const response = await request(app)
        .put("/api/users/invalid-id")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ username: "newname" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid user ID");
    });

    it("should return 404 for non-existent user", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/users/${nonExistentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ username: "newname" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "User not found");
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .put(`/api/users/${testUser._id}`)
        .send({ username: "newname" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Access token is required"
      );
    });

    it("should handle server errors appropriately", async () => {
      // Mock findByIdAndUpdate to throw an error
      jest.spyOn(User, "findByIdAndUpdate").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const response = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ username: "newname" });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Server error");
    });
  });

  describe("POST /api/users/refresh-access-token", () => {
    let testUser: IUser;
    let expiredToken: string;
    let validRefreshToken: string;

    beforeEach(async () => {
      // Create a test user
      testUser = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      // Generate expired token
      expiredToken = jwt.sign(
        { id: testUser._id },
        process.env.ACCESS_TOKEN_SECRET || "test-secret-key",
        { expiresIn: "-1s" }
      );

      // Generate valid refresh token and add to user
      validRefreshToken = generateRefreshToken();
      const hashedToken = crypto
        .createHash("sha256")
        .update(validRefreshToken)
        .digest("hex");

      testUser.refreshTokens.push({
        token: hashedToken,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      await testUser.save();
    });

    it("should return successful response when token is still valid", async () => {
      const validToken = jwt.sign(
        { id: testUser._id },
        process.env.ACCESS_TOKEN_SECRET || "test-secret-key",
        { expiresIn: "1h" }
      );

      const response = await request(app)
        .post("/api/users/refresh-access-token")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).not.toHaveProperty("refreshToken");
    });

    it("should return 401 when no token provided", async () => {
      const response = await request(app).post(
        "/api/users/refresh-access-token"
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        code: AuthErrorCode.NO_TOKEN,
        message: "Access token is required",
        error: "missing_token",
      });
    });

    it("should return 401 when user has no valid refresh tokens", async () => {
      // Remove all refresh tokens from user
      testUser.refreshTokens = [];
      await testUser.save();

      const response = await request(app)
        .post("/api/users/refresh-access-token")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        code: AuthErrorCode.TOKEN_EXPIRED,
        message: "No valid refresh token found",
        error: "refresh_token_expired",
      });
    });

    it("should refresh token successfully with expired token and valid refresh token", async () => {
      const response = await request(app)
        .post("/api/users/refresh-access-token")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).not.toHaveProperty("refreshToken");

      // Verify the refresh token was updated in the database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.refreshTokens[0].token).not.toBe(
        crypto.createHash("sha256").update(validRefreshToken).digest("hex")
      );
    });

    it("should return 500 for invalid token format", async () => {
      const response = await request(app)
        .post("/api/users/refresh-access-token")
        .set("Authorization", "Bearer invalid.token.format");

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        code: AuthErrorCode.SERVER_ERROR,
        message: "Server error",
        error: "server_error",
      });
    });

    it("should return 500 for server errors", async () => {
      jest.spyOn(User, "findById").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const response = await request(app)
        .post("/api/users/refresh-access-token")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        code: AuthErrorCode.SERVER_ERROR,
        message: "Server error",
        error: "server_error",
      });
    });
  });

  describe("POST /api/users/refresh-token", () => {
    let testUser: IUser;
    let validRefreshToken: string;

    beforeEach(async () => {
      // Create a test user
      testUser = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      // Generate a valid refresh token
      validRefreshToken = generateRefreshToken();
      const hashedToken = crypto
        .createHash("sha256")
        .update(validRefreshToken)
        .digest("hex");

      // Add refresh token to user
      testUser.refreshTokens.push({
        token: hashedToken,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      await testUser.save();
    });

    it("should refresh tokens successfully with valid refresh token", async () => {
      const response = await request(app)
        .post("/api/users/refresh-token")
        .send({ refreshToken: validRefreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      // ביטול הבדיקה של refreshToken בתשובה
      expect(response.body).not.toHaveProperty("refreshToken");
    });

    it("should return 400 if refresh token is missing", async () => {
      const response = await request(app)
        .post("/api/users/refresh-token")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Refresh token is required"
      );
    });

    it("should return 401 for invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/users/refresh-token")
        .send({ refreshToken: "invalid-token" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid refresh token");
    });

    it("should return 401 for expired refresh token", async () => {
      // Create expired token
      const expiredToken = generateRefreshToken();
      const hashedExpiredToken = crypto
        .createHash("sha256")
        .update(expiredToken)
        .digest("hex");

      testUser.refreshTokens.push({
        token: hashedExpiredToken,
        validUntil: new Date(Date.now() - 1000), // Set to past date
      });
      await testUser.save();

      const response = await request(app)
        .post("/api/users/refresh-token")
        .send({ refreshToken: expiredToken });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Refresh token expired or invalid"
      );
    });

    it("should handle server errors appropriately", async () => {
      jest.spyOn(User, "findOne").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const response = await request(app)
        .post("/api/users/refresh-token")
        .send({ refreshToken: validRefreshToken });

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        code: AuthErrorCode.SERVER_ERROR,
        message: "Server error",
        error: "Server error",
      });
    });
  });

  describe("GET /api/users/me", () => {
    let testUser: IUser;
    let validAccessToken: string;

    beforeEach(async () => {
      // Create a test user
      testUser = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "user",
        profilePicture: "http://example.com/pic.jpg",
      });

      // Generate valid access token
      validAccessToken = jwt.sign(
        { id: testUser._id },
        process.env.ACCESS_TOKEN_SECRET || "test-secret-key"
      );
    });

    it("should return authenticated user details successfully", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        id: testUser._id.toString(),
        email: testUser.email,
        username: testUser.username,
        profilePicture: testUser.profilePicture,
      });
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return 401 when no authorization header is provided", async () => {
      const response = await request(app).get("/api/users/me");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Access token is required"
      );
    });

    it("should return 401 when authorization header is malformed", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", "InvalidFormat");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Access token is required"
      );
    });

    it("should return 401 when access token is invalid", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", "Bearer invalid.token.here");

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        code: AuthErrorCode.INVALID_TOKEN,
        message: "Invalid access token",
        error: "invalid_token",
      });
    });

    it("should return 404 when user no longer exists", async () => {
      // Delete the user after generating the token
      await User.findByIdAndDelete(testUser._id);

      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "User not found");
    });

    it("should handle server errors appropriately", async () => {
      // Mock User.findById to throw an error
      jest.spyOn(User, "findById").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        code: AuthErrorCode.INVALID_TOKEN,
        message: "Invalid access token",
        error: "invalid_token",
      });
    });

    it("should return 401 when token is missing", async () => {
      const response = await request(app).get("/api/users/me");

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        code: AuthErrorCode.NO_TOKEN,
        message: "Access token is required",
        error: "missing_token",
      });
    });

    it("should return 401 when token has expired", async () => {
      const expiredToken = jwt.sign(
        { id: testUser._id },
        process.env.ACCESS_TOKEN_SECRET || "test-secret-key",
        { expiresIn: "-1s" }
      );

      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        code: AuthErrorCode.TOKEN_EXPIRED,
        message: "Access token has expired",
        error: "token_expired",
      });
    });

    it("should return 401 for invalid token", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", "Bearer invalid.token");

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        code: AuthErrorCode.INVALID_TOKEN,
        message: "Invalid access token",
        error: "invalid_token",
      });
    });
  });
});

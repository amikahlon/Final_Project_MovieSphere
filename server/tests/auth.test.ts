import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import {
  isAuthenticated,
  isAdmin,
  validateAccessToken,
} from "../middleware/auth";
import User, { IUser } from "../models/user";
import {
  describe,
  afterAll,
  beforeEach,
  it,
  expect,
  beforeAll,
  jest,
} from "@jest/globals";

const app = express();
app.use(express.json());

// Route to test isAuthenticated
app.get("/protected", isAuthenticated, (req, res) => {
  res.status(200).json({ message: "You are authenticated!" });
});

// Route to test isAdmin
app.get("/admin", isAuthenticated, isAdmin, (req, res) => {
  res.status(200).json({ message: "You are an admin!" });
});

// Route to get a user by ID
app.get("/user/:id", isAuthenticated, async (req, res, next): Promise<void> => {
  try {
    const id = req.params.id;

    // Add ID validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    // Change error handling to return 400 for invalid IDs
    res.status(400).json({ error: "Invalid user ID" });
  }
});

// Route to update a user
app.put("/user/:id", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(400).json({ error: "An error occurred" });
  }
});

// Add a new test route for validateAccessToken
app.get("/validate-token", validateAccessToken, (req, res) => {
  res.status(200).json({
    message: "Token validated",
    user: req.user,
  });
});

jest.setTimeout(30000); // Increase test timeout

describe("Authentication Middleware Tests", () => {
  let userToken: string;
  let adminToken: string;
  let mongoServer: MongoMemoryServer;
  let adminUser: IUser;
  let regularUser: IUser;

  beforeAll(async () => {
    process.env.ACCESS_TOKEN_SECRET = "test-secret-key";

    // Set up in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany();

    // Create test users
    regularUser = await User.create({
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
      role: "user",
    });

    adminUser = await User.create({
      username: "adminuser",
      email: "adminuser@example.com",
      password: "password123",
      role: "admin",
    });

    // Generate tokens
    userToken = jwt.sign(
      {
        id: regularUser._id.toString(),
        email: regularUser.email,
        role: regularUser.role,
      },
      process.env.ACCESS_TOKEN_SECRET || "test-secret-key"
    );

    adminToken = jwt.sign(
      {
        id: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role,
      },
      process.env.ACCESS_TOKEN_SECRET || "test-secret-key"
    );
  });

  describe("GET /user/:id", () => {
    it("should return user by ID", async () => {
      const response = await request(app)
        .get(`/user/${regularUser._id.toString()}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("email", regularUser.email);
    });

    it("should return 404 if user not found", async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/user/${invalidId}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "User not found");
    });

    it("should return 400 if user ID is invalid", async () => {
      const response = await request(app)
        .get("/user/invalid-id")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid user ID");
    });
  });

  describe("PUT /user/:id", () => {
    it("should update user by ID", async () => {
      const updatedData = { username: "updateduser" };
      const response = await request(app)
        .put(`/user/${regularUser._id.toString()}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(updatedData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "User updated successfully"
      );
      expect(response.body.user).toHaveProperty("username", "updateduser");
    });

    it("should return 404 if user not found", async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/user/${invalidId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ username: "newuser" });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "User not found");
    });

    it("should return 400 if user ID is invalid", async () => {
      const response = await request(app)
        .put("/user/invalid-id")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ username: "newuser" });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "An error occurred");
    });
  });

  describe("validateAccessToken Middleware Tests", () => {
    let testUser: IUser;
    let validToken: string;

    beforeEach(async () => {
      // Create a test user
      testUser = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      // Generate valid token
      validToken = jwt.sign(
        { id: testUser._id, role: "user" },
        process.env.ACCESS_TOKEN_SECRET || "test-secret-key"
      );
    });

    it("should allow access with valid token", async () => {
      const response = await request(app)
        .get("/validate-token")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Token validated");
      expect(response.body.user).toMatchObject({
        id: testUser._id.toString(),
        role: "user",
      });
    });

    it("should return 401 when no token is provided", async () => {
      const response = await request(app).get("/validate-token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Access token is missing" // עודכן להתאים להודעה החדשה
      );
    });

    it("should return 401 when authorization header is malformed", async () => {
      const response = await request(app)
        .get("/validate-token")
        .set("Authorization", "malformed-header");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Access token is missing" // עודכן להתאים להודעה החדשה
      );
    });

    it("should return 401 for expired token", async () => {
      // Generate expired token
      const expiredToken = jwt.sign(
        { id: testUser._id, role: "user" },
        process.env.ACCESS_TOKEN_SECRET || "test-secret-key",
        { expiresIn: "0s" }
      );

      const response = await request(app)
        .get("/validate-token")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid or expired access token"
      );
    });

    it("should return 401 for token with invalid signature", async () => {
      const invalidToken = jwt.sign(
        { id: testUser._id, role: "user" },
        "wrong-secret-key"
      );

      const response = await request(app)
        .get("/validate-token")
        .set("Authorization", `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid or expired access token"
      );
    });

    it("should return 401 for malformed token", async () => {
      const response = await request(app)
        .get("/validate-token")
        .set("Authorization", "Bearer not.a.valid.token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid or expired access token"
      );
    });

    it("should attach user data to request object", async () => {
      // Create a test route that returns req.user
      app.get("/test-user-data", validateAccessToken, (req, res) => {
        res.json({ user: req.user });
      });

      const response = await request(app)
        .get("/test-user-data")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        id: testUser._id.toString(),
        role: "user",
      });
    });
  });
});

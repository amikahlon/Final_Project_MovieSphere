import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/user";
import { AuthErrorCode } from "../middleware/auth";
import { generateAccessToken, generateRefreshToken } from "../middleware/auth";
import { REFRESH_TOKEN_EXPIRY } from "../config/constants";
import crypto from "crypto";
import jwt from "jsonwebtoken";

//Sign up a new user
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res
        .status(409)
        .json({ message: "User already exists. Please login instead." });
      return;
    }

    const user = new User({
      username,
      email,
      password,
      provider: "local",
    });

    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    user.refreshTokens.push({
      token: crypto.createHash("sha256").update(refreshToken).digest("hex"),
      validUntil: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    });

    await user.save();

    // Updated response to include refreshToken
    res.status(201).json({
      message: "User created successfully",
      accessToken,
      refreshToken, // Added refresh token to response
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        role: user.role, // הוספת הרול
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        code: AuthErrorCode.INVALID_REQUEST,
        message: "Invalid user ID",
        error: "invalid_id",
      });
      return;
    }

    const user = await User.findById(id)
      .select("username email favoriteGenres profilePicture")
      .exec();

    if (!user) {
      res.status(404).json({
        code: AuthErrorCode.NO_USER,
        message: "User not found",
        error: "user_not_found",
      });
      return;
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      favoriteGenres: user.favoriteGenres || [],
    });
  } catch (error) {
    res.status(500).json({
      code: AuthErrorCode.INVALID_REQUEST,
      message: "Internal server error",
      error: "server_error",
    });
  }
};

export const getMyProfileDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      code: AuthErrorCode.NO_TOKEN,
      message: "Access token is missing",
      error: "missing_token",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as { id: string };

    const user = await User.findById(decoded.id)
      .select("username email profilePicture favoriteGenres")
      .exec();

    if (!user) {
      res.status(404).json({
        code: AuthErrorCode.NO_USER,
        message: "User not found",
        error: "user_not_found",
      });
      return;
    }

    res.status(200).json({
      id: user._id,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture,
      favoriteGenres: user.favoriteGenres || [],
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        code: AuthErrorCode.TOKEN_EXPIRED,
        message: "Access token has expired",
        error: "token_expired",
      });
    } else {
      res.status(401).json({
        code: AuthErrorCode.INVALID_TOKEN,
        message: "Invalid access token",
        error: "invalid_token",
      });
    }
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({
        code: AuthErrorCode.INVALID_REQUEST,
        message: "Invalid user ID",
        error: "Invalid user ID", // Changed case to match test
      });
      return;
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      res.status(404).json({
        code: AuthErrorCode.NO_USER,
        message: "User not found",
        error: "user_not_found",
      });
      return;
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({
      code: AuthErrorCode.SERVER_ERROR,
      message: "Server error",
      error: "Server error", // Changed case to match test
    });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({
        code: AuthErrorCode.INVALID_REQUEST,
        message: "Invalid user ID",
        error: "invalid_id", // תוקן מ-"Server error"
      });
      return;
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({
        code: AuthErrorCode.NO_USER,
        message: "User not found",
        error: "user_not_found", // תוקן מ-"Server error"
      });
      return;
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({
      code: AuthErrorCode.SERVER_ERROR,
      message: "Server error",
      error: "Server error",
    });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find()
      .select("username email profilePicture favoriteGenres role")
      .exec();

    res.status(200).json({
      users: users.map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        favoriteGenres: user.favoriteGenres,
        role: user.role,
      })),
    });
  } catch (error) {
    res.status(500).json({
      code: AuthErrorCode.SERVER_ERROR,
      message: "Server error",
      error: "server_error",
    });
  }
};

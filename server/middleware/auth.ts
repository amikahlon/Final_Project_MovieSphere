import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user";
import crypto from "crypto";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../config/constants";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

export enum AuthErrorCode {
  NO_TOKEN = "NO_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INVALID_TOKEN = "INVALID_TOKEN",
  NO_USER = "NO_USER",
  NOT_ADMIN = "NOT_ADMIN",
  INVALID_REQUEST = "INVALID_REQUEST",
  SERVER_ERROR = "SERVER_ERROR",
  INVALID_ID = "INVALID_ID",
  USER_NOT_FOUND = "USER_NOT_FOUND",
}

export const signin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Missing email or password" });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.verifyPassword(password)) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    user.refreshTokens.push({
      token: crypto.createHash("sha256").update(refreshToken).digest("hex"),
      validUntil: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    });

    await user.save();

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture || "", // וודא שנשלח גם אם ריק
        role: user.role,
        favoriteGenres: user.favoriteGenres || [], // הוספת favoriteGenres עם ברירת מחדל של מערך ריק
      },
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const googleSignin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const credential = req.body.credential;
  if (!credential) {
    res.status(400).json({
      code: AuthErrorCode.NO_TOKEN,
      message: "Missing credential",
    });
    return;
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      res.status(400).json({
        code: AuthErrorCode.INVALID_TOKEN,
        message: "Invalid token",
      });
      return;
    }

    const { email = "", name = "Unknown User", picture = "", sub } = payload;

    let user = await User.findOne({ email });

    if (user) {
      if (user.provider !== "google") {
        user.provider = "google";
        user.providerId = sub;
        user.username = user.username || name;
        user.profilePicture = user.profilePicture || picture;
        await user.save();
      }
    } else {
      user = new User({
        username: name,
        email,
        profilePicture: picture,
        provider: "google",
        providerId: sub,
      });
      await user.save();
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    user.refreshTokens.push({
      token: crypto.createHash("sha256").update(refreshToken).digest("hex"),
      validUntil: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    });

    await user.save();

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken, // וודא שאתה מחזיר גם refreshToken בgoogle signin
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture || "", // וודא שנשלח גם אם ריק
        role: user.role,
        favoriteGenres: user.favoriteGenres || [],
      },
    });
  } catch (err) {
    console.error("Error verifying ID token:", err);
    res.status(400).json({
      code: AuthErrorCode.INVALID_TOKEN,
      message: "Invalid token or server error",
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  const refreshToken = req.body.refreshToken;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      code: AuthErrorCode.NO_TOKEN,
      message: "Access token is required",
      error: "missing_token",
    });
    return;
  }

  const accessToken = authHeader.split(" ")[1];
  let userId: string;

  try {
    // Try to get user ID from valid token first
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as { id: string };
    userId = decoded.id;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      // If token is expired, try to get user ID from decoded token
      const decoded = jwt.decode(accessToken) as { id: string } | null;
      if (!decoded || !decoded.id) {
        res.status(401).json({
          code: AuthErrorCode.INVALID_TOKEN,
          message: "Invalid access token",
          error: "invalid_token",
        });
        return;
      }
      userId = decoded.id;
    } else {
      res.status(401).json({
        code: AuthErrorCode.INVALID_TOKEN,
        message: "Invalid access token",
        error: "invalid_token",
      });
      return;
    }
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        code: AuthErrorCode.NO_USER,
        message: "User not found",
        error: "user_not_found",
      });
      return;
    }

    if (refreshToken) {
      const hashedRefreshToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      const tokenIndex = user.refreshTokens.findIndex(
        (t) => t.token === hashedRefreshToken
      );

      if (tokenIndex !== -1) {
        user.refreshTokens.splice(tokenIndex, 1);
        await user.save();
        res.status(200).json({
          message: "Logged out successfully",
          details: "Specific refresh token removed",
        });
        return;
      }
    }

    // Expire all refresh tokens before clearing them
    const currentTime = new Date();
    user.refreshTokens.forEach((token) => {
      token.validUntil = currentTime;
    });
    await user.save();

    // Then clear all tokens
    user.refreshTokens = [];
    await user.save();

    res.status(200).json({
      message: "Logged out successfully",
      details: "All refresh tokens expired and cleared",
    });
  } catch (error) {
    res.status(500).json({
      code: AuthErrorCode.SERVER_ERROR,
      message: "Server error",
      error: "server_error",
    });
  }
};

// מקבלת אקסס טוקן ריפרש טוקן
// אם האקסס טוקן לא בתוקף - בדיקה אם הריפרש טוקן בתוקף ונמצא במערך
// יוצר ריפרש טוקן ואקסס טוקן חדש. מעדכן במערך את הריפרש טוקן החדש
export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const refreshToken = req.body.refreshToken; // קבלת הריפרש טוקן מה-body

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      code: AuthErrorCode.NO_TOKEN,
      message: "Access token is required",
      error: "missing_token",
    });
    return;
  }

  if (!refreshToken) {
    res.status(401).json({
      code: AuthErrorCode.NO_TOKEN,
      message: "Refresh token is required",
      error: "missing_refresh_token",
    });
    return;
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    // בדיקת תוקף האקסס טוקן
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string);
    res.status(200).json({
      code: "TOKEN_VALID",
      message: "Access token is still valid",
      status: "valid",
    });
    return;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      // מוציא את ה-ID מהטוקן שפג
      const decoded = jwt.decode(accessToken) as { id: string } | null;
      if (!decoded || !decoded.id) {
        res.status(401).json({
          code: AuthErrorCode.INVALID_TOKEN,
          message: "Invalid access token",
          error: "invalid_token",
        });
        return;
      }

      try {
        const user = await User.findById(decoded.id);
        if (!user) {
          res.status(401).json({
            code: AuthErrorCode.NO_USER,
            message: "User not found",
            error: "user_not_found",
          });
          return;
        }

        // מחפש את הריפרש טוקן הספציפי במערך
        const hashedRefreshToken = crypto
          .createHash("sha256")
          .update(refreshToken)
          .digest("hex");

        const tokenIndex = user.refreshTokens.findIndex(
          (rt) => rt.token === hashedRefreshToken
        );

        if (tokenIndex === -1) {
          res.status(401).json({
            code: AuthErrorCode.INVALID_TOKEN,
            message: "Refresh token not found",
            error: "invalid_refresh_token",
          });
          return;
        }

        // בדיקה אם הריפרש טוקן בתוקף
        if (new Date() > new Date(user.refreshTokens[tokenIndex].validUntil)) {
          res.status(401).json({
            code: AuthErrorCode.TOKEN_EXPIRED,
            message: "Refresh token has expired",
            error: "refresh_token_expired",
          });
          return;
        }

        // יצירת טוקנים חדשים
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken();

        // החלפת הריפרש טוקן הספציפי בחדש
        user.refreshTokens[tokenIndex] = {
          token: crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex"),
          validUntil: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
        };

        await user.save();

        res.status(200).json({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          message: "Tokens renewed successfully",
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        res.status(500).json({
          code: AuthErrorCode.SERVER_ERROR,
          message: "Server error",
          error: "server_error",
        });
      }
    } else {
      res.status(401).json({
        code: AuthErrorCode.INVALID_TOKEN,
        message: "Invalid access token",
        error: "invalid_token",
      });
    }
  }
};

export const accessTokenStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      status: "missing_token",
      message: "Access token is missing",
    });
    return;
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string);
    res.status(200).json({
      status: "valid",
      message: "Access token is valid and active",
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: "expired",
        message: "Access token has expired",
      });
    } else {
      res.status(401).json({
        status: "invalid",
        message: "Access token is invalid",
      });
    }
  }
};

// Middleware to check if a user is authenticated
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      code: AuthErrorCode.NO_TOKEN,
      message: "Access token is required",
      error: "missing_token",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || "test-secret-key"
    ) as { id: string; role: string };
    req.user = decoded;
    next();
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

// Updated isAdmin with error codes
export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(403).json({
        code: AuthErrorCode.NO_USER,
        message: "Access denied, no user information provided",
      });
      return;
    }
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      res.status(403).json({
        code: AuthErrorCode.NOT_ADMIN,
        message: "Access denied, admin privileges required",
      });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Generate Refresh Token
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

// Generate Access Token
export const generateAccessToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role || "user", // ברירת מחדל: "user"
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

// Updated validateAccessToken to only return status
export const validateAccessToken = (
  req: Request,
  res: Response,
  next: () => void
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      code: AuthErrorCode.NO_TOKEN,
      message: "Access token is missing", // שונה מ-"Access token is required"
      error: "missing_token",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        code: AuthErrorCode.TOKEN_EXPIRED,
        message: "Invalid or expired access token", // שינוי כאן
        error: "token_expired",
      });
    } else {
      res.status(401).json({
        code: AuthErrorCode.INVALID_TOKEN,
        message: "Invalid or expired access token", // שינוי כאן
        error: "invalid_token",
      });
    }
  }
};

import express from "express";
import {
  createUser,
  getUserById,
  getMyProfileDetails,
  updateUser,
  deleteUser,
  getAllUsers,
  updateUsername,
  uploadProfileImage, // Add this import
  updateProfilePicture, // Add this import
} from "../controllers/user";
import {
  googleSignin,
  signin,
  logout,
  refreshAccessToken,
  accessTokenStatus,
  isAuthenticated,
  isAdmin,
} from "../middleware/auth";
import { uploadImages } from "../middleware/filesupload"; // Add this import

const router = express.Router();

// Authentication routes
router.post("/google-signin", googleSignin);
router.post("/signup", createUser);
router.post("/signin", signin);
router.post("/logout", logout);

// רענון אקסס טוקן והחלפת ריפרש טוקן מתאים במערך
router.post("/refresh-access-token", refreshAccessToken);
// סטטוס האקסס טוקן
router.post("/access-token-status", accessTokenStatus);

// עבור משתמשים מחוברים
router.get("/me", isAuthenticated, getMyProfileDetails); // הפרופיל שלי

// New route for updating username - MOVED BEFORE THE /:id ROUTE
router.put("/update-username", isAuthenticated, updateUsername);

// Add profile image upload route
router.post(
  "/upload-profile-image",
  uploadImages.single("file"),
  uploadProfileImage
);

// Add the new route for updating profile picture
router.put("/update-profile-picture", isAuthenticated, updateProfilePicture);

router.get("/:id", isAuthenticated, getUserById); // מידע על משתמשים אחרים

// Protected admin routes
router.get("/admin/users", isAuthenticated, isAdmin, getAllUsers); // רשימת כל המשתמשים במערכת
router.put("/:id", isAuthenticated, isAdmin, updateUser); // עדכון משתמש על ידי מנהל
router.delete("/:id", isAuthenticated, isAdmin, deleteUser); // מחיקת משתמש על ידי מנהל

export default router;

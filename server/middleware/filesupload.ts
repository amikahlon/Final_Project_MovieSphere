import multer from "multer";
import path from "path";

// Define storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/"); // Store files in `public/images/`
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Get the file extension
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`; // Create a unique name
    cb(null, uniqueName);
  },
});

// File filter to allow only image files
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only image files are allowed!"), false); // Reject non-image files
  }
};

// Create and export multer instance
export const uploadImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

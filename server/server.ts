import express, { Application } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import routes from "./routes/index";
import cors from "cors";
import path from "path";

dotenv.config();

const app: Application = express();

// Middleware לטיפול ב-JSON
app.use(express.json());

// Enable CORS for כל המקורות (ניתן לצמצם בפרודקשן)
app.use(cors());

// Serve static files from the "public" directory
app.use("/public", express.static("public"));

// פונקציה לחיבור ל-MongoDB
export const connectToDatabase = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (err) {
    if (err instanceof Error) {
      // Check if error is timeout related
      if (err.message.includes("timeout")) {
        console.error("MongoDB connection timeout");
        throw new Error("Connection timeout");
      }
      // Check if error is related to invalid URI
      if (err.message.includes("invalid")) {
        console.error("Invalid MongoDB URI");
        throw new Error("Invalid URI");
      }
      // Generic error handling
      console.error("MongoDB connection error:", err);
      throw err; // זורקים את השגיאה המקורית
    } else {
      console.error("Unknown MongoDB connection error");
      throw new Error("Unknown connection error");
    }
  }
};

// Routes תחת '/api'
app.use("/api", routes);

// ✅ Serve React Vite build directly from `front/`
app.use(express.static(path.join(__dirname, "../front")));

app.get("*", (req, res, next) => {
  // 🔹 If the request is for an API route, let Express handle it
  if (req.originalUrl.startsWith("/api")) {
    return next();
  }

  // 🔹 If the request is for a static file (e.g., CSS, JS), let Express serve it
  if (req.originalUrl.includes(".")) {
    return next();
  }

  // 🔹 Serve index.html for all other routes (let React handle routing)
  res.sendFile(path.resolve(__dirname, "../front/index.html"), (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

// ייצוא רק את ה-app כי connectToDatabase כבר מיוצא למעלה
export { app };

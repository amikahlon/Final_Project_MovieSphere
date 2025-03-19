import express from "express";
import {
  generateMovieRecommendations,
  handleMovieQA,
} from "../controllers/chatgpt";

const router = express.Router();

// Route to handle movie recommendations
router.post("/recommendations", generateMovieRecommendations);

// Route to handle Q&A about movies
router.post("/qa", handleMovieQA);

export default router;

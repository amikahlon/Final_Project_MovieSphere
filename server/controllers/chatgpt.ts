import { Request, Response } from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config(); // Ensure .env is loaded in this file

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.ChatGPTApiKey,
});

// Controller for generating movie recommendations
export const generateMovieRecommendations = async (req: Request, res: Response): Promise<void> => {
  const { movieTitle } = req.body;

  if (!movieTitle) {
    res.status(400).json({ error: "Movie title is required" });
    return;
  }

  try {
    const prompt = `Suggest 3 movies similar to "${movieTitle}", and briefly explain why they are similar.`;
    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
    });

    res.json({ recommendations: response.choices[0]?.message?.content });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      res.status(500).json({ error: error });
    } else {
      console.error(error);
      res.status(500).json({ error: error });
    }
  }
};

// Controller for handling Q&A about movies
export const handleMovieQA = async (req: Request, res: Response): Promise<void> => {
  const { question } = req.body;

  if (!question) {
    res.status(400).json({ error: "Question is required" });
    return;
  }

  try {
    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: question }],
      model: "gpt-4o-mini",
    });

    res.json({ answer: response.choices[0]?.message?.content });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error answering question:", error.message);
      res.status(500).json({ error:error });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ error: error });
    }
  }
};

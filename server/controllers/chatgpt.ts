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
  const { movieTitles } = req.body;

  if (!movieTitles || !Array.isArray(movieTitles) || movieTitles.length === 0) {
    res.status(400).json({ error: "At least one movie title is required" });
    return;
  }

  try {
    const prompt = `Based on the following movies: ${movieTitles.join(", ")}, suggest 3 movies the user might enjoy and provide a brief reason for each recommendation. Format the response as a JSON array of objects with "title" and "reason".`;

    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
    });

    // Extract response content and clean formatting
    let content = response.choices[0]?.message?.content || "[]";
    
    // Remove potential Markdown code blocks
    content = content.replace(/^```json\n|```$/g, "").trim();

    const recommendations = JSON.parse(content);

    res.json({ recommendations });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
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

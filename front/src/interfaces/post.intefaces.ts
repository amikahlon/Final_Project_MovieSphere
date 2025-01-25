import { User } from "./auth.interfaces";

export interface IPost {
  movieName: string;
  moviePosterURL: string;
  movieId: string;
  userId: string; // Depending on whether it's populated or just an ID
  title: string;
  review: string;
  rating: number; // Between 0 and 10
  images: File[]; // Array of photo URLs
  likes: string[]; // Array of user IDs who liked the post
  commentsCount: number; // Number of comments
}

export interface Post {
  _id: string;
  movieName: string;
  moviePosterURL: string;
  movieId: string;
  userId: string;
  user: User;
  title: string;
  review: string;
  rating: number;
  images: string[];
  likes: string[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  hasLiked:boolean;
}
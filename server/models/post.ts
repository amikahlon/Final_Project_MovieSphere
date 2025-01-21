import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  movieName: string;
  movieId: string;
  userId: mongoose.Types.ObjectId;
  title: string;
  review: string;
  rating: number;
  photos: string[]; // Array of photo URLs
  likes: mongoose.Types.ObjectId[]; // Array of user IDs who liked the post
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema({
  movieName: { type: String, required: true },
  movieId: { type: String, required: true },
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  review: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 10 },
  photos: { type: [String], default: [] },
  likes: { type: [mongoose.Types.ObjectId], ref: "User", default: [] },
  commentsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PostSchema.pre<IPost>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IPost>("Post", PostSchema);

import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
  postId: { type: mongoose.Types.ObjectId, ref: "Post", required: true },
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

CommentSchema.pre<IComment>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IComment>("Comment", CommentSchema);

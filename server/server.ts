import express, { Application } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routes from './routes/index';
import cors from 'cors';

dotenv.config();

const app: Application = express();

// Middleware לטיפול ב-JSON
app.use(express.json());

// Enable CORS for כל המקורות (ניתן לצמצם בפרודקשן)
app.use(cors());

// חיבור ל-MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';
mongoose
  .connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes תחת '/api'
app.use('/api', routes);

export default app; // מייצא את השרת בלבד

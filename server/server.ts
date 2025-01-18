import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routes from './routes/index';
import cors from 'cors';

// טוען משתני סביבה מקובץ .env
dotenv.config();

// יצירת אפליקציית Express
const app: Application = express();

// הגדרת Middleware לטיפול ב-JSON
app.use(express.json());

// Enable CORS for all origins (you can restrict it to your frontend URL in production)
app.use(cors());

// חיבור ל-MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';
mongoose
  .connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Use routes under '/api'
app.use('/api', routes);

// האזנה לשרת
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

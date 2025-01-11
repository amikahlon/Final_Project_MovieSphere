import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// טוען משתני סביבה מקובץ .env
dotenv.config();

// יצירת אפליקציית Express
const app: Application = express();

// הגדרת Middleware לטיפול ב-JSON
app.use(express.json());

// חיבור ל-MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';
mongoose
  .connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ראוט בסיסי
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the TypeScript server!');
});

// דוגמה לראוט עם Middleware
app.get('/api', (req: Request, res: Response, next: NextFunction) => {
  console.log('Request received at /api');
  next(); // העברה לראוט הבא
}, (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the API!' });
});

// האזנה לשרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

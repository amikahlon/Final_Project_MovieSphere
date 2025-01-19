import app from './server';

const PORT = process.env.PORT || 8000;

// הפעלת השרת
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

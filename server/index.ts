import { app, connectToDatabase } from "./server";

const PORT = process.env.PORT || 8000;

// חיבור ל-MongoDB
connectToDatabase()
  .then(() => {
    // הפעלת השרת לאחר שהחיבור הצליח
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(
      "Failed to connect to the database. Server will not start.",
      err
    );
  });

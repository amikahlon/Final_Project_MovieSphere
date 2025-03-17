import { app, connectToDatabase } from "./server";
import https from "https"
import fs from "fs"

const PORT = process.env.PORT || 8000;

// חיבור ל-MongoDB
connectToDatabase()
  .then(() => {
    // // הפעלת השרת לאחר שהחיבור הצליח
    // app.listen(PORT, () => {
    //   console.log(`Server is running on http://localhost:${PORT}`);
    // });
    console.log("Environment:" + process.env.NODE_ENV)
    if (process.env.NODE_ENV != "production") {
      app.listen(PORT, () => {
        console.log(`Example app listening at http://localhost:${PORT}`);
      });
    } else {
      console.log(`app listening at https://193.106.55.221`);
      const prop = {
        key: fs.readFileSync("./client-key.pem"),
        cert: fs.readFileSync("./client-cert.pem")
      }
      https.createServer(prop, app).listen(PORT)
    }
  })
  .catch((err) => {
    console.error(
      "Failed to connect to the database. Server will not start.",
      err
    );
  });

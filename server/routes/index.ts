import express from "express";
import userRoutes from "./user";
import chatRoutes from "./chatgpt";
import postRoutes from "./post";
import commentRoutes from "./comment";

import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MovieSphere API",
      version: "1.0.0",
      description: "API documentation for MovieSphere application",
    },
    servers: [
      {
        url: "/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.ts", "./controllers/*.ts"], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Use swagger UI
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Use '/api/users' for user-related routes
router.use("/users", userRoutes);

// Use '/api/post' for post-related routes
router.use("/post", postRoutes);

// Use '/api/chatgpt' for ChatGPT-related routes
router.use("/chatgpt", chatRoutes);

// Use '/api/comment' for comment-related routes
router.use("/comment", commentRoutes);

export default router;

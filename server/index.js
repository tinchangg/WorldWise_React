import "dotenv/config.js"; // Automatically calls dotenv.config()
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authenticate } from "./middleware/authMiddleware.js";
import citiesRoutes from "./routes/citiesRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// env.config();
const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", authenticate, citiesRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

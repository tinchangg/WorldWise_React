// import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import citiesRoutes from "./routes/citiesRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// API Routes
app.use("/api", citiesRoutes);
app.use("/api/auth", authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

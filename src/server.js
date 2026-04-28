import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// 🔹 ROUTES (MAKE SURE THESE FILES EXIST)
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();

// =======================
// 🔹 TRUST PROXY (for Render)
/// =======================
app.set("trust proxy", 1);

// =======================
// 🔹 MIDDLEWARE
// =======================
app.use(express.json());

// =======================
// 🔹 CORS (SAFE + WORKING)
// =======================
const allowedOrigins = [
  "http://localhost:5173",
  "https://sevalink-frontend-git-main-parts345s-projects.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        return callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

// =======================
// 🔹 MONGODB CONNECTION
// =======================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "sevalink",
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// =======================
// 🔹 ROUTES
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// =======================
// 🔹 HEALTH ROUTE
// =======================
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "SevaLink API is running 🚀",
  });
});

// =======================
// 🔹 ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// =======================
// 🔹 SERVER START
// =======================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();

// =======================
// 🔹 GRACEFUL SHUTDOWN
// =======================
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down server...");
  await mongoose.connection.close();
  process.exit(0);
});
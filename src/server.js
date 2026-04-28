import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// =======================
// 🔹 MIDDLEWARE
// =======================
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
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
// import routes here
// app.use("/api/auth", authRoutes);
// app.use("/api/tasks", taskRoutes);

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
// 🔹 SHUTDOWN
// =======================
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down server...");
  await mongoose.connection.close();
  process.exit(0);
});
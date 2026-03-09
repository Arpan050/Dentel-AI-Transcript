import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { testConnection } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import audioRoutes from "./routes/audio.js";
import transcriptionRoutes from "./routes/transcription.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 8000;

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin:      process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods:     ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use(
  "/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max:      20,
    message:  { error: "Too many login attempts. Please try again in 15 minutes." },
  })
);

app.use(
  "/audio/upload",
  rateLimit({
    windowMs: 60 * 60 * 1000,  // 1 hour
    max:      50,
    message:  { error: "Upload limit reached. Please try again later." },
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status:    "ok",
    service:   "Dental AI Transcription API",
    timestamp: new Date().toISOString(),
    version:   "1.0.0",
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/auth",          authRoutes);
app.use("/audio",         audioRoutes);
app.use("/transcription", transcriptionRoutes);

// ── 404 + Error handlers ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n🦷 Dental AI API running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}\n`);
  });
}

start();

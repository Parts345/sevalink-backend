import { Router } from "express";
import {
  fetchTasks,
  getVolunteerMatches,
  postTask,
  acceptTask
} from "../controllers/taskController.js";

import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

/* =========================
   PUBLIC ROUTES
========================= */
router.get("/", fetchTasks);

/* =========================
   VOLUNTEER ROUTES
========================= */
router.get(
  "/matches/me",
  requireAuth,
  requireRole("volunteer"),
  getVolunteerMatches
);

// 🔥 DEMO MODE: remove auth
router.post("/:taskId/accept", acceptTask);

/* =========================
   NGO / VOLUNTEER ROUTES
========================= */
router.post("/", postTask);

export default router;
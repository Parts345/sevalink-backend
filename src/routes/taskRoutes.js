import { Router } from "express";
import {
  fetchTasks,
  getVolunteerMatches,
  postTask,
  acceptTask   // ✅ IMPORTANT: added this
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

router.post(
  "/:taskId/accept",
  requireAuth,
  requireRole("volunteer"),
  acceptTask
);

/* =========================
   NGO / VOLUNTEER ROUTES
========================= */
router.post(
  "/",
  // requireAuth,                <-- Comment this out!
  // requireRole("ngo", "volunteer"), <-- Comment this out too!
  postTask
);

export default router;
import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getTranscription,
  updateTranscription,
  approveTranscription,
  getOutput,
} from "../controllers/transcriptionController.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET  /transcription/:audioId          — fetch transcription (with 202 polling support)
router.get("/:audioId", getTranscription);

// PUT  /transcription/:audioId          — edit text / summary / instructions
router.put("/:audioId", updateTranscription);

// POST /transcription/:audioId/approve  — mark as approved
router.post("/:audioId/approve", approveTranscription);

// GET  /transcription/:audioId/output   — final formatted output
router.get("/:audioId/output", getOutput);

export default router;

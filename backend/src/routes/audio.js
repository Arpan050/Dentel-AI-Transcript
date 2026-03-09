import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { uploadAudio as multerUpload } from "../middleware/upload.js";
import {
  uploadAudio,
  getRecordings,
  getRecording,
  deleteRecording,
} from "../controllers/audioController.js";

const router = Router();

// All audio routes require authentication
router.use(authenticate);

// POST /audio/upload  — multipart/form-data { audio: File, patientName: string }
router.post("/upload", multerUpload, uploadAudio);

// GET  /audio         — list recordings (paginated)
router.get("/", getRecordings);

// GET  /audio/:audioId
router.get("/:audioId", getRecording);

// DELETE /audio/:audioId
router.delete("/:audioId", deleteRecording);

export default router;

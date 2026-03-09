import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => {
    const ext      = path.extname(file.originalname) || ".webm";
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "audio/webm", "audio/wav", "audio/mp4", "audio/mpeg",
    "audio/ogg", "audio/flac", "audio/x-wav", "audio/x-m4a",
    "video/webm",   // Chrome records audio as video/webm sometimes
  ];

  if (allowed.includes(file.mimetype) || file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload an audio file.`));
  }
};

const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB) || 50;

export const uploadAudio = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeMB * 1024 * 1024 },
}).single("audio");

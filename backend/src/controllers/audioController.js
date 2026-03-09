import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";
import { transcribeAudio } from "../services/speechService.js";

// ── POST /audio/upload ────────────────────────────────────────────────────────
export async function uploadAudio(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const { patientName } = req.body;
    if (!patientName || !patientName.trim()) {
      // Remove orphaned file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Patient name is required" });
    }

    const audioId = uuidv4();

    // Save recording metadata
    await pool.query(
      `INSERT INTO audio_recordings
         (id, user_id, patient_name, file_path, file_size, mime_type, status)
       VALUES (?, ?, ?, ?, ?, ?, 'uploaded')`,
      [
        audioId,
        req.user.id,
        patientName.trim(),
        req.file.path,
        req.file.size,
        req.file.mimetype,
      ]
    );

    // Kick off transcription asynchronously — don't await
    processTranscription(audioId, req.file.path).catch((err) => {
      console.error(`Transcription failed for audio ${audioId}:`, err.message);
    });

    res.status(201).json({
      audioId,
      message: "Audio uploaded successfully. Transcription is processing.",
    });
  } catch (err) {
    // Clean up uploaded file if DB insert failed
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
}

// ── GET /audio ────────────────────────────────────────────────────────────────
export async function getRecordings(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await pool.query(
      `SELECT
         ar.id, ar.patient_name, ar.status, ar.duration_secs,
         ar.file_size, ar.created_at,
         t.id AS transcription_id
       FROM audio_recordings ar
       LEFT JOIN transcriptions t ON t.audio_id = ar.id
       WHERE ar.user_id = ?
       ORDER BY ar.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM audio_recordings WHERE user_id = ?",
      [req.user.id]
    );

    res.json({ recordings: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
}

// ── GET /audio/:audioId ───────────────────────────────────────────────────────
export async function getRecording(req, res, next) {
  try {
    const { audioId } = req.params;

    const [rows] = await pool.query(
      `SELECT
         ar.*, t.id AS transcription_id, t.edited_text, t.approved_at
       FROM audio_recordings ar
       LEFT JOIN transcriptions t ON t.audio_id = ar.id
       WHERE ar.id = ? AND ar.user_id = ?`,
      [audioId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Recording not found" });
    }

    res.json({ recording: rows[0] });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /audio/:audioId ────────────────────────────────────────────────────
export async function deleteRecording(req, res, next) {
  try {
    const { audioId } = req.params;

    const [rows] = await pool.query(
      "SELECT file_path FROM audio_recordings WHERE id = ? AND user_id = ?",
      [audioId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Recording not found" });
    }

    // Remove file from disk
    const { file_path } = rows[0];
    if (fs.existsSync(file_path)) fs.unlinkSync(file_path);

    // CASCADE deletes the transcription too (FK constraint)
    await pool.query("DELETE FROM audio_recordings WHERE id = ?", [audioId]);

    res.json({ message: "Recording deleted successfully" });
  } catch (err) {
    next(err);
  }
}

// ── Internal: run transcription and save result ───────────────────────────────
async function processTranscription(audioId, filePath) {
  // Mark as processing
  await pool.query(
    "UPDATE audio_recordings SET status = 'processing' WHERE id = ?",
    [audioId]
  );

  try {
    const { text, confidence, language } = await transcribeAudio(filePath);

    const transcriptionId = uuidv4();

    // Upsert transcription row
    await pool.query(
      `INSERT INTO transcriptions
         (id, audio_id, raw_text, edited_text, confidence, language_code)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         raw_text = VALUES(raw_text),
         edited_text = VALUES(edited_text),
         confidence = VALUES(confidence)`,
      [transcriptionId, audioId, text, text, confidence, language]
    );

    await pool.query(
      "UPDATE audio_recordings SET status = 'transcribed' WHERE id = ?",
      [audioId]
    );

    console.log(`✅ Transcription complete for audio ${audioId}`);
  } catch (err) {
    await pool.query(
      "UPDATE audio_recordings SET status = 'failed' WHERE id = ?",
      [audioId]
    );
    throw err;
  }
}

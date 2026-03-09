import pool from "../config/db.js";

// ── GET /transcription/:audioId ───────────────────────────────────────────────
export async function getTranscription(req, res, next) {
  try {
    const { audioId } = req.params;

    // Verify the audio belongs to this user
    const [audioRows] = await pool.query(
      "SELECT id, patient_name, status, created_at FROM audio_recordings WHERE id = ? AND user_id = ?",
      [audioId, req.user.id]
    );

    if (audioRows.length === 0) {
      return res.status(404).json({ error: "Recording not found" });
    }

    const audio = audioRows[0];

    // If still processing, return status without transcription data
    if (audio.status === "processing" || audio.status === "uploaded") {
      return res.status(202).json({
        status:      audio.status,
        message:     "Transcription is still being processed. Please poll again in a few seconds.",
        audioId,
      });
    }

    if (audio.status === "failed") {
      return res.status(422).json({
        status:  "failed",
        message: "Transcription failed. Please try uploading the audio again.",
        audioId,
      });
    }

    const [rows] = await pool.query(
      `SELECT
         t.id, t.audio_id, t.raw_text, t.edited_text,
         t.summary, t.instructions, t.confidence,
         t.language_code, t.approved_at, t.created_at,
         ar.patient_name, ar.created_at AS recorded_at
       FROM transcriptions t
       JOIN audio_recordings ar ON ar.id = t.audio_id
       WHERE t.audio_id = ?`,
      [audioId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Transcription not found" });
    }

    res.json({ transcription: rows[0] });
  } catch (err) {
    next(err);
  }
}

// ── PUT /transcription/:audioId ───────────────────────────────────────────────
export async function updateTranscription(req, res, next) {
  try {
    const { audioId } = req.params;
    const { text, summary, instructions } = req.body;

    if (!text && !summary && !instructions) {
      return res.status(400).json({ error: "At least one field (text, summary, instructions) is required" });
    }

    // Verify ownership
    const [audioRows] = await pool.query(
      "SELECT id FROM audio_recordings WHERE id = ? AND user_id = ?",
      [audioId, req.user.id]
    );

    if (audioRows.length === 0) {
      return res.status(404).json({ error: "Recording not found" });
    }

    // Build dynamic update
    const fields  = [];
    const values  = [];

    if (text !== undefined)         { fields.push("edited_text = ?");  values.push(text);         }
    if (summary !== undefined)      { fields.push("summary = ?");      values.push(summary);      }
    if (instructions !== undefined) { fields.push("instructions = ?"); values.push(instructions); }

    values.push(audioId);

    await pool.query(
      `UPDATE transcriptions SET ${fields.join(", ")} WHERE audio_id = ?`,
      values
    );

    const [updated] = await pool.query(
      "SELECT * FROM transcriptions WHERE audio_id = ?",
      [audioId]
    );

    res.json({ transcription: updated[0], message: "Transcription updated successfully" });
  } catch (err) {
    next(err);
  }
}

// ── POST /transcription/:audioId/approve ──────────────────────────────────────
export async function approveTranscription(req, res, next) {
  try {
    const { audioId } = req.params;

    // Verify ownership
    const [audioRows] = await pool.query(
      "SELECT id FROM audio_recordings WHERE id = ? AND user_id = ?",
      [audioId, req.user.id]
    );

    if (audioRows.length === 0) {
      return res.status(404).json({ error: "Recording not found" });
    }

    const now = new Date();

    await pool.query(
      "UPDATE transcriptions SET approved_at = ?, approved_by = ? WHERE audio_id = ?",
      [now, req.user.id, audioId]
    );

    await pool.query(
      "UPDATE audio_recordings SET status = 'approved' WHERE id = ?",
      [audioId]
    );

    res.json({ message: "Transcription approved successfully", approvedAt: now });
  } catch (err) {
    next(err);
  }
}

// ── GET /transcription/:audioId/output ───────────────────────────────────────
// Returns the final formatted output for the Output screen
export async function getOutput(req, res, next) {
  try {
    const { audioId } = req.params;

    const [rows] = await pool.query(
      `SELECT
         t.edited_text, t.summary, t.instructions, t.approved_at,
         ar.patient_name, ar.created_at AS recorded_at,
         u.name AS clinician_name
       FROM transcriptions t
       JOIN audio_recordings ar ON ar.id = t.audio_id
       JOIN users u ON u.id = ar.user_id
       WHERE t.audio_id = ? AND ar.user_id = ?`,
      [audioId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Output not found" });
    }

    const row = rows[0];

    res.json({
      output: {
        patientName:    row.patient_name,
        clinicianName:  row.clinician_name,
        recordedAt:     row.recorded_at,
        approvedAt:     row.approved_at,
        transcript:     row.edited_text,
        summary:        row.summary,
        instructions:   row.instructions,
      },
    });
  } catch (err) {
    next(err);
  }
}

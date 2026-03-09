import pool, { testConnection } from "./db.js";

const migrations = [
  // ── Users ──────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS users (
    id          VARCHAR(36)  PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('dentist', 'staff', 'admin') NOT NULL DEFAULT 'dentist',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // ── Audio recordings ────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS audio_recordings (
    id              VARCHAR(36)  PRIMARY KEY,
    user_id         VARCHAR(36)  NOT NULL,
    patient_name    VARCHAR(150) NOT NULL,
    file_path       VARCHAR(500) NOT NULL,
    file_size       INT          NOT NULL DEFAULT 0,
    duration_secs   INT          NOT NULL DEFAULT 0,
    mime_type       VARCHAR(100) NOT NULL DEFAULT 'audio/webm',
    status          ENUM('uploaded','processing','transcribed','approved','failed')
                                 NOT NULL DEFAULT 'uploaded',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id  (user_id),
    INDEX idx_status   (status),
    INDEX idx_created  (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // ── Transcriptions ──────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS transcriptions (
    id              VARCHAR(36)  PRIMARY KEY,
    audio_id        VARCHAR(36)  NOT NULL UNIQUE,
    raw_text        LONGTEXT,
    edited_text     LONGTEXT,
    summary         TEXT,
    instructions    TEXT,
    confidence      FLOAT        DEFAULT 0,
    language_code   VARCHAR(10)  DEFAULT 'en-US',
    approved_at     DATETIME,
    approved_by     VARCHAR(36),
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (audio_id)    REFERENCES audio_recordings(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audio_id (audio_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // ── Seed default admin user (password: Admin@1234) ─────────────────────────
  `INSERT IGNORE INTO users (id, name, email, password, role) VALUES (
    'usr_default_001',
    'Dr. Sarah Chen',
    'doctor@clinic.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'dentist'
  );`,
];

async function migrate() {
  await testConnection();
  console.log("🔄 Running migrations…");
  for (const sql of migrations) {
    await pool.query(sql);
  }
  console.log("✅ All migrations complete");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});

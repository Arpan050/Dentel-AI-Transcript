import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────
// Whisper model size: tiny | base | small | medium | large
// tiny  = fastest, ~75 MB  | base = good balance ~150 MB (default)
// small = better accuracy  | medium/large = best (needs lots of RAM)
const WHISPER_MODEL = process.env.WHISPER_MODEL || "base";

// Python executable — override via PYTHON_BIN in .env if needed
const PYTHON_BIN = process.env.PYTHON_BIN || (process.platform === "win32" ? "python" : "python3");

// Path to the transcription helper script
const WHISPER_SCRIPT = path.join(__dirname, "whisperTranscribe.py");

// ── Convert audio to 16kHz mono WAV (whisper works best with this) ────────────
function convertToWav(inputPath) {
  const outputPath = inputPath.replace(/\.[^.]+$/, "_whisper.wav");
  try {
    execSync(
      `ffmpeg -y -i "${inputPath}" -ar 16000 -ac 1 -sample_fmt s16 "${outputPath}"`,
      { stdio: "pipe" }
    );
    return outputPath;
  } catch (err) {
    throw new Error(
      "ffmpeg is required for audio conversion.\n" +
      "Windows: winget install ffmpeg\n" +
      "Mac:     brew install ffmpeg\n" +
      "Linux:   sudo apt install ffmpeg\n" +
      `Error: ${err.message}`
    );
  }
}

// ── Verify Python + whisper are installed ─────────────────────────────────────
function verifySetup() {
  try {
    execSync(`${PYTHON_BIN} -c "import whisper"`, { stdio: "pipe" });
  } catch {
    throw new Error(
      "openai-whisper Python package not found.\n" +
      "Run:  npm run setup:whisper\n" +
      "Or manually:  pip install openai-whisper"
    );
  }
}

// ── Main transcription function ───────────────────────────────────────────────
/**
 * Transcribe audio using OpenAI Whisper running locally via Python.
 * 100% free, offline, no API key needed.
 *
 * @param {string} filePath  - Path to uploaded audio file
 * @param {string} language  - Language code e.g. "en", "hi" (or "auto" to detect)
 * @returns {{ text, confidence, language }}
 */
export async function transcribeAudio(filePath, language = "en") {
  verifySetup();

  const wavPath = convertToWav(filePath);

  try {
    // Call the Python whisper script and capture JSON output
    const result = execFileSync(PYTHON_BIN, [
      WHISPER_SCRIPT,
      "--file",    wavPath,
      "--model",   WHISPER_MODEL,
      "--language", language,
    ], {
      timeout: 10 * 60 * 1000,   // 10 min max for large files
      maxBuffer: 10 * 1024 * 1024,
    });

    const parsed = JSON.parse(result.toString().trim());

    if (parsed.error) {
      throw new Error(parsed.error);
    }

    return {
      text:       parsed.text || "No speech detected in the audio.",
      confidence: parsed.confidence || 0.95,
      language:   parsed.language  || language,
    };
  } catch (err) {
    // If JSON parse fails, the script likely printed an error
    if (err instanceof SyntaxError) {
      throw new Error("Whisper transcription failed. Check Python setup.");
    }
    throw err;
  } finally {
    if (wavPath !== filePath && fs.existsSync(wavPath)) {
      fs.unlinkSync(wavPath);
    }
  }
}
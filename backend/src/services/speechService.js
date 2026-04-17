import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import FormData from "form-data";
import https from "https";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = "whisper-large-v3-turbo";

function convertAudio(inputPath) {
  const outputPath = inputPath.replace(/\.[^.]+$/, "_groq.mp3");
  try {
    execSync(`ffmpeg -y -i "${inputPath}" -ar 16000 -ac 1 -b:a 64k "${outputPath}"`, { stdio: "pipe" });
    return outputPath;
  } catch {
    console.warn("ffmpeg not found, sending original file to Groq.");
    return inputPath;
  }
}

function groqRequest(audioPath, language) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file",            fs.createReadStream(audioPath), path.basename(audioPath));
    form.append("model",           GROQ_MODEL);
    form.append("response_format", "verbose_json");
    if (language && language !== "auto") form.append("language", language);

    const options = {
      hostname: "api.groq.com",
      path:     "/openai/v1/audio/transcriptions",
      method:   "POST",
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          if (json.error) return reject(new Error(json.error.message || "Groq API error"));
          resolve(json);
        } catch {
          reject(new Error(`Groq parse error: ${body.slice(0, 200)}`));
        }
      });
    });

    req.on("error", reject);
    form.pipe(req);
  });
}

export async function transcribeAudio(filePath, language = "en") {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not set in .env — get a free key at https://console.groq.com");
  }

  const fileSizeMB = fs.statSync(filePath).size / (1024 * 1024);
  if (fileSizeMB > 25) {
    throw new Error(`File too large (${fileSizeMB.toFixed(1)} MB). Groq limit is 25 MB.`);
  }

  const convertedPath = convertAudio(filePath);

  try {
    console.log(`🎤 Sending to Groq Whisper (${fileSizeMB.toFixed(1)} MB)…`);
    const result     = await groqRequest(convertedPath, language);
    const text       = result.text?.trim() || "No speech detected.";
    const detected   = result.language || language;
    const segments   = result.segments || [];
    const avgLogProb = segments.length > 0
      ? segments.reduce((sum, s) => sum + (s.avg_logprob || -0.5), 0) / segments.length
      : -0.1;
    const confidence = Math.round(Math.min(1, Math.max(0, Math.exp(avgLogProb))) * 100) / 100;

    console.log(`✅ Transcription done — ${text.split(" ").length} words`);
    return { text, confidence, language: detected };
  } finally {
    if (convertedPath !== filePath && fs.existsSync(convertedPath)) fs.unlinkSync(convertedPath);
  }
}

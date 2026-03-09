/**
 * setupWhisper.js
 * One-time setup — installs openai-whisper Python package.
 * Run once:  npm run setup:whisper
 *
 * Requirements: Python 3.8+, pip, ffmpeg
 */

import { execSync }      from "child_process";
import fs                from "fs";
import path              from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(path.join(__dirname, "../../"));
const isWindows = process.platform === "win32";
const isMac     = process.platform === "darwin";

function run(cmd, opts = {}) {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { stdio: "inherit", ...opts });
}

function tryExec(cmd) {
  try { execSync(cmd, { stdio: "pipe" }); return true; } catch { return false; }
}

function detectPython() {
  for (const bin of ["python", "python3", "py"]) {
    try {
      const ver = execSync(`${bin} --version`, { stdio: "pipe" }).toString().trim();
      if (ver.includes("Python 3")) {
        console.log(`  ✅ Python found: ${ver} (using '${bin}')`);
        return bin;
      }
    } catch { continue; }
  }
  return null;
}

function detectPip(pythonBin) {
  for (const bin of [`${pythonBin} -m pip`, "pip", "pip3"]) {
    if (tryExec(`${bin} --version`)) {
      console.log(`  ✅ pip found (using '${bin}')`);
      return bin;
    }
  }
  return null;
}

function checkFfmpeg() {
  for (const cmd of ["ffmpeg -version", "ffmpeg --version", "where ffmpeg"]) {
    try { execSync(cmd, { stdio: "pipe" }); console.log("  ✅ ffmpeg found"); return; }
    catch { continue; }
  }
  console.error("  ❌ ffmpeg not found");
  console.error(isWindows ? "     Install: winget install ffmpeg"
    : isMac ? "     Install: brew install ffmpeg"
    : "     Install: sudo apt install ffmpeg");
  process.exit(1);
}

async function setup() {
  console.log("\n🦷 Dental AI — Whisper Python Setup");
  console.log("=".repeat(50));

  console.log("\n📋 Checking prerequisites…");
  checkFfmpeg();

  const pythonBin = detectPython();
  if (!pythonBin) {
    console.error("\n  ❌ Python 3 not found.");
    console.error(isWindows
      ? "     Install: winget install Python.Python.3  OR  https://python.org/downloads"
      : isMac ? "     Install: brew install python3"
      : "     Install: sudo apt install python3 python3-pip");
    process.exit(1);
  }

  const pipBin = detectPip(pythonBin);
  if (!pipBin) {
    console.error(`\n  ❌ pip not found. Try: ${pythonBin} -m ensurepip --upgrade`);
    process.exit(1);
  }

  console.log("\n📦 Installing openai-whisper…");
  console.log("   (First time: 2-5 min — downloads PyTorch + dependencies)\n");

  const alreadyInstalled = tryExec(`${pythonBin} -c "import whisper"`);
  if (alreadyInstalled) {
    const ver = execSync(`${pythonBin} -c "import whisper; print(whisper.__version__)"`, { stdio: "pipe" }).toString().trim();
    console.log(`  ⏭  openai-whisper already installed (v${ver}), skipping.`);
  } else {
    run(`${pipBin} install openai-whisper`);
    console.log("\n  ✅ openai-whisper installed");
  }

  console.log("\n🔍 Verifying…");
  try {
    const ver = execSync(`${pythonBin} -c "import whisper; print(whisper.__version__)"`, { stdio: "pipe" }).toString().trim();
    console.log(`  ✅ whisper v${ver} ready`);
  } catch {
    console.error("  ❌ Verification failed. Try: pip install openai-whisper");
    process.exit(1);
  }

  // Update .env
  const envPath = path.join(ROOT, ".env");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  let changed = false;
  const entries = { PYTHON_BIN: pythonBin, WHISPER_MODEL: "base" };
  for (const [key, val] of Object.entries(entries)) {
    if (!envContent.includes(key + "=")) {
      envContent += `\n${key}=${val}`;
      changed = true;
    }
  }
  if (changed) { fs.writeFileSync(envPath, envContent.trimStart()); console.log("\n  ✅ Updated .env"); }
  else { console.log("\n  ⏭  .env already configured."); }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Setup complete!\n");
  console.log("📝 The Whisper model (~150 MB) downloads automatically");
  console.log("   on the FIRST transcription. Cached after that.\n");
  console.log("Model options (set WHISPER_MODEL in .env):");
  console.log("  tiny   — fastest, ~75 MB");
  console.log("  base   — balanced, ~150 MB  ← default");
  console.log("  small  — better,   ~500 MB");
  console.log("  medium — great,    ~1.5 GB\n");
  console.log("Now run:  npm run dev\n");
}

setup().catch((err) => {
  console.error("\n❌ Setup failed:", err.message);
  process.exit(1);
});
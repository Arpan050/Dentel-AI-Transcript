#!/usr/bin/env python3
"""
whisperTranscribe.py
────────────────────
Called by Node.js speechService.js to transcribe audio using
OpenAI Whisper running fully locally.

Outputs a single JSON object to stdout:
  { "text": "...", "language": "en", "confidence": 0.95 }

On error:
  { "error": "description" }
"""

import sys
import json
import argparse
import os

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--file",     required=True,  help="Path to audio file (WAV preferred)")
    parser.add_argument("--model",    default="base",  help="Whisper model: tiny|base|small|medium|large")
    parser.add_argument("--language", default="en",    help="Language code e.g. en, hi, auto")
    args = parser.parse_args()

    # Validate file exists
    if not os.path.exists(args.file):
        print(json.dumps({"error": f"Audio file not found: {args.file}"}))
        sys.exit(1)

    try:
        import whisper
    except ImportError:
        print(json.dumps({
            "error": "openai-whisper not installed. Run: pip install openai-whisper"
        }))
        sys.exit(1)

    try:
        # Load model (cached after first download)
        # Models are stored in ~/.cache/whisper/
        model = whisper.load_model(args.model)

        # Transcription options
        options = {
            "task": "transcribe",
            "verbose": False,
        }

        # Language: pass None for auto-detect, or specific code
        if args.language and args.language.lower() != "auto":
            options["language"] = args.language

        # Run transcription
        result = model.transcribe(args.file, **options)

        full_text = result.get("text", "").strip()
        detected_language = result.get("language", args.language)

        # Calculate average confidence from segments if available
        segments = result.get("segments", [])
        if segments:
            avg_conf = sum(
                seg.get("avg_logprob", -0.5) for seg in segments
            ) / len(segments)
            # Convert log probability to 0-1 confidence (approx)
            import math
            confidence = round(min(1.0, max(0.0, math.exp(avg_conf))), 2)
        else:
            confidence = 0.9

        output = {
            "text":       full_text or "No speech detected in the audio.",
            "language":   detected_language,
            "confidence": confidence,
            "segments":   len(segments),
        }

        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
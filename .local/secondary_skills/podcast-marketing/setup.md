# Podcast Marketing Setup

Install commands, purposes, and a verification snippet for each dependency tier. Install only the tiers the requested outputs need.

## Tier 1: Text Content (always needed)

These are required for transcript extraction and content generation (show notes, blog, social, newsletter, pull quotes):

| Dependency | Install | Purpose |
|-----------|---------|---------|
| Python 3.10+ | `installProgrammingLanguage({ language: "python-3.11" })` | Runtime for all scripts |
| youtube-transcript-api | `installLanguagePackages({ language: "python", packages: ["youtube-transcript-api"] })` | YouTube caption extraction |
| yt-dlp | `installLanguagePackages({ language: "python", packages: ["yt-dlp"] })` | YouTube metadata + video/audio download |
| LLM API | Set up via Anthropic or OpenAI AI integration (Replit proxy — no user API key needed) | Content atom extraction and content generation |

## Tier 2: Quote Card Images

These are required to generate visual quote card PNG files:

| Dependency | Install | Purpose |
|-----------|---------|---------|
| Pillow | `installLanguagePackages({ language: "python", packages: ["Pillow"] })` | Image generation |
| System fonts | Already available on Nix (DejaVu Sans at `/usr/share/fonts/truetype/dejavu/`) | Typography |

No API keys needed. Run `scripts/generate_quote_cards.py` directly.

## Tier 3: Short-Form Video Clips (basic)

These produce trimmed, vertical-reformatted video clips without animated captions:

| Dependency | Install | Purpose |
|-----------|---------|---------|
| ffmpeg | `installSystemDependencies({ packages: ["ffmpeg"] })` | Video trimming, reformatting, subtitle burning |
| yt-dlp | (already in Tier 1) | Download source video from YouTube |

## Tier 4: Animated Captions (Opus Clips style)

These add word-by-word highlighted captions to video clips:

| Dependency | Install | Purpose |
|-----------|---------|---------|
| OpenAI API | Set up OpenAI AI integration OR user provides `OPENAI_API_KEY` | Whisper word-level timestamps |
| Pillow | (already in Tier 2) | Caption frame generation (alternative to ASS subtitles) |

The animated caption pipeline re-transcribes each trimmed clip through Whisper with `timestamp_granularities=["word"]` to get per-word timing. Without this, clips still work but use segment-level static captions instead.

## Setup Checklist

Before running the pipeline, verify:

```python
# Tier 1
import youtube_transcript_api  # YouTube captions
import yt_dlp  # YouTube metadata/download
import anthropic  # or openai — for content generation

# Tier 2 (if generating quote cards)
from PIL import Image, ImageFont
ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)

# Tier 3 (if generating video clips)
import subprocess
subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)

# Tier 4 (if generating animated captions)
import openai  # OPENAI_API_KEY must be set
```

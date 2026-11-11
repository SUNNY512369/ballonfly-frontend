# Podcast Audio Production with ElevenLabs

Skip this file in script-only mode. If the user doesn't have an ElevenLabs key or only wants the script, deliver the script with production notes and stop.

## Audio generation

**Install:** `pip install elevenlabs pydub`

**Model choice:** `eleven_multilingual_v2` for quality (10K char limit per call); `eleven_turbo_v2_5` for speed/cost (40K char limit, ~300ms latency, ~3x faster).

**Voice IDs that work for duo podcasts** (from the default library — verify with `client.voices.search()`):

- `JBFqnCBsd6RMkjVDRZzb` (George — warm, mid-range male)
- `21m00Tcm4TlvDq8ikWAM` (Rachel — clear, measured female)
- `pNInz6obpgDQGcFmaJgB` (Adam — energetic narrator)
- `EXAVITQu4vr4xnSDxMaL` (Bella — conversational female)

### Settings for conversational podcast delivery

- `stability: 0.45` — lower = more expressive; below 0.3 gets inconsistent
- `similarity_boost: 0.8` — keeps voice consistent across chunks
- `style: 0.3` — mild exaggeration for energy (0 = flat)
- `use_speaker_boost: True`

```python
import io
import os

from elevenlabs.client import ElevenLabs
from pydub import AudioSegment

client = ElevenLabs(api_key=os.environ["ELEVENLABS_API_KEY"])
VOICES = {"ALEX": "JBFqnCBsd6RMkjVDRZzb", "SAM": "21m00Tcm4TlvDq8ikWAM"}


def render_line(speaker: str, text: str) -> AudioSegment:
    audio = client.text_to_speech.convert(
        voice_id=VOICES[speaker],
        text=text,
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128",
        voice_settings={"stability": 0.45, "similarity_boost": 0.8,
                        "style": 0.3, "use_speaker_boost": True},
    )
    return AudioSegment.from_mp3(io.BytesIO(b"".join(audio)))


# parse script → list of (speaker, text) tuples, render each, concat
gap = AudioSegment.silent(duration=350)  # 350ms between speakers
episode = sum((render_line(s, t) + gap for s, t in lines), AudioSegment.empty())
episode.export("episode_raw.mp3", format="mp3", bitrate="128k")
```

**Chunking long utterances:** split at sentence boundaries (`.`, `?`, `!`), keep under ~800 chars per call. Pass `previous_text`/`next_text` params to preserve prosody across chunk boundaries.

## Loudness normalization

Podcast standard is **-16 LUFS** (stereo) per Apple/Spotify specs. pydub's `normalize()` is peak-only — not LUFS. Use ffmpeg's two-pass `loudnorm` via the `ffmpeg-normalize` wrapper:

```bash
pip install ffmpeg-normalize
ffmpeg-normalize episode_raw.mp3 -o episode.mp3 -c:a libmp3lame -b:a 128k \
  -t -16 -tp -1.5 -lra 11 --normalization-type ebu
```

`-t -16` = target LUFS, `-tp -1.5` = true-peak ceiling (prevents clipping), `-lra 11` = loudness range. This runs two passes automatically (analyze, then correct).

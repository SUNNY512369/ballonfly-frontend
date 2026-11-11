# Audio Conversions

```python
from pydub import AudioSegment

# --- MP3 ↔ WAV ---
AudioSegment.from_mp3("in.mp3").export("out.wav", format="wav")
AudioSegment.from_wav("in.wav").export("out.mp3", format="mp3", bitrate="192k")

# --- FLAC → MP3 ---
AudioSegment.from_file("in.flac", format="flac").export("out.mp3", format="mp3", bitrate="320k")

# --- OGG → MP3 ---
AudioSegment.from_ogg("in.ogg").export("out.mp3", format="mp3", bitrate="192k")

# --- M4A / AAC → MP3 ---
AudioSegment.from_file("in.m4a", format="m4a").export("out.mp3", format="mp3", bitrate="256k")

# --- Any → Any (pydub supports mp3, wav, ogg, flac, m4a, aac, wma, aiff) ---
AudioSegment.from_file("in.wma", format="wma").export("out.flac", format="flac")

# --- Trim audio (first 30 seconds) ---
audio = AudioSegment.from_file("in.mp3")
audio[:30000].export("first_30s.mp3", format="mp3")  # milliseconds

# --- Merge / concatenate ---
combined = AudioSegment.from_file("a.mp3") + AudioSegment.from_file("b.mp3")
combined.export("merged.mp3", format="mp3")

# --- Adjust volume ---
audio = AudioSegment.from_file("in.mp3")
louder = audio + 6  # +6 dB
quieter = audio - 6  # -6 dB
louder.export("louder.mp3", format="mp3")

# --- Get audio info ---
audio = AudioSegment.from_file("in.mp3")
print(f"Duration: {len(audio)/1000:.1f}s, Channels: {audio.channels}, "
      f"Sample rate: {audio.frame_rate}Hz, Sample width: {audio.sample_width*8}bit")

# --- Batch convert directory ---
from pathlib import Path
for p in Path("audio").glob("*.wav"):
    AudioSegment.from_wav(str(p)).export(p.with_suffix(".mp3"), format="mp3", bitrate="192k")
```

**Audio gotchas:**

- `pydub` requires `ffmpeg` installed system-wide for non-WAV formats
- Bitrate options: "128k" (small/low quality), "192k" (balanced), "256k" (high), "320k" (max for MP3)
- WAV files are uncompressed — expect 10x larger file sizes than MP3
- For sample rate conversion: `audio.set_frame_rate(44100).export("out.wav", format="wav")`
- Mono to stereo: `audio.set_channels(2)` / Stereo to mono: `audio.set_channels(1)`

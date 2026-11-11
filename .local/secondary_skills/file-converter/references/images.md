# Image and GIF Conversions

## Image Formats

```python
from PIL import Image

# --- Basic conversion ---
Image.open("in.png").convert("RGB").save("out.jpg", quality=90)
# convert("RGB") is REQUIRED: JPEG can't store alpha channel, will raise OSError

# --- WebP (best web format) ---
Image.open("in.jpg").save("out.webp", quality=85, method=6)  # method 0-6, 6=best compression

# --- AVIF (smallest, Pillow 11+) ---
Image.open("in.jpg").save("out.avif", quality=75)

# --- HEIC (iPhone photos) → JPG ---
from pillow_heif import register_heif_opener
register_heif_opener()
Image.open("in.heic").convert("RGB").save("out.jpg", quality=90)

# --- SVG → PNG ---
import cairosvg
cairosvg.svg2png(url="in.svg", write_to="out.png", output_width=1024)

# --- Batch convert directory ---
from pathlib import Path
for p in Path("imgs").glob("*.png"):
    Image.open(p).convert("RGB").save(p.with_suffix(".jpg"), quality=85)
```

**Image gotchas:**

- PNG → JPG: **must** `convert("RGB")` first or transparency crashes the save
- `quality` for PNG is meaningless (lossless) — use `optimize=True, compress_level=9`
- Pillow can't open `.svg` natively — use `cairosvg` or `svglib`
- GIF → MP4 is a video operation: `ffmpeg -i in.gif -pix_fmt yuv420p out.mp4`

## GIF Creation

```python
from PIL import Image
import imageio.v3 as iio
from pathlib import Path

# --- Images → animated GIF (Pillow) ---
frames = [Image.open(f"frame_{i}.png") for i in range(10)]
frames[0].save("out.gif", save_all=True, append_images=frames[1:],
               duration=100, loop=0)  # duration in ms, loop=0 means infinite

# --- Images → GIF with optimization ---
frames = [Image.open(f"frame_{i}.png").convert("RGBA") for i in range(10)]
frames[0].save("out.gif", save_all=True, append_images=frames[1:],
               duration=100, loop=0, optimize=True)

# --- Directory of images → GIF ---
frame_paths = sorted(Path("frames").glob("*.png"))
frames = [Image.open(p) for p in frame_paths]
frames[0].save("out.gif", save_all=True, append_images=frames[1:],
               duration=100, loop=0)

# --- GIF → individual frames ---
gif = Image.open("in.gif")
for i in range(gif.n_frames):
    gif.seek(i)
    gif.save(f"frame_{i}.png")

# --- Resize GIF ---
gif = Image.open("in.gif")
resized_frames = []
for i in range(gif.n_frames):
    gif.seek(i)
    resized_frames.append(gif.copy().resize((320, 240), Image.LANCZOS))
resized_frames[0].save("small.gif", save_all=True, append_images=resized_frames[1:],
                       duration=gif.info.get("duration", 100), loop=0)

# --- Video → GIF (imageio + ffmpeg) ---
import imageio.v3 as iio
frames = iio.imread("in.mp4", plugin="pyav")
iio.imwrite("out.gif", frames, plugin="pillow", duration=40, loop=0)

# --- GIF → MP4 (ffmpeg CLI, much smaller file) ---
# ffmpeg -i in.gif -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" out.mp4
```

**GIF gotchas:**

- GIF is limited to 256 colors per frame — complex images lose quality
- Use `optimize=True` to reduce file size, but large GIFs are still huge compared to MP4
- `duration` is per-frame in milliseconds (100ms = 10 FPS, 40ms = 25 FPS)
- `loop=0` means infinite loop; `loop=1` plays once then stops
- For video → GIF, consider downscaling first — full-resolution GIFs are enormous
- Pillow GIF output doesn't support transparency well — use `imageio` for better results
- For best quality: create GIF from video with ffmpeg: `ffmpeg -i in.mp4 -vf "fps=15,scale=480:-1" out.gif`

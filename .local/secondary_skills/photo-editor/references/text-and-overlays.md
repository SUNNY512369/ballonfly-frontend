# Text & Watermark (Adding)

```python
from PIL import Image, ImageDraw, ImageFont

draw = ImageDraw.Draw(img)
try:
    font = ImageFont.truetype("DejaVuSans-Bold.ttf", 48)  # Linux default
except OSError:
    font = ImageFont.load_default()  # fallback (tiny, ugly)

# --- Text with outline ---
draw.text((50, 50), "Caption", font=font, fill="white",
          stroke_width=3, stroke_fill="black")

# --- Centered text ---
bbox = draw.textbbox((0, 0), "Centered", font=font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
draw.text(((img.width - tw) // 2, (img.height - th) // 2), "Centered", font=font, fill="white")

# --- Watermark (semi-transparent PNG overlay) ---
logo = Image.open("logo.png").convert("RGBA")
logo.thumbnail((img.width // 5, img.height // 5))
# Fade to 40% opacity
alpha = logo.split()[3].point(lambda p: int(p * 0.4))
logo.putalpha(alpha)
pos = (img.width - logo.width - 20, img.height - logo.height - 20)
img.paste(logo, pos, logo)  # third arg = alpha mask — REQUIRED for transparency
```

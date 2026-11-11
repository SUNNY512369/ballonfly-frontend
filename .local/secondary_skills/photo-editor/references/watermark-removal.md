# Watermark / Logo Removal

Use OpenCV's `cv2.inpaint()` — it fills a masked region by sampling surrounding pixels, producing seamless results. **Do not use pixel-by-pixel `getpixel`/`putpixel` loops** — they are slow and produce visible artifacts.

## Step 1: Find the watermark boundaries

Always inspect the image at full resolution first. Watermarks are often much larger than they appear in thumbnails. Save a crop of the watermark region to verify coordinates before attempting removal.

```python
import cv2
import numpy as np
from PIL import Image, ImageOps

img = Image.open("photo.jpg")
img = ImageOps.exif_transpose(img)
w, h = img.size

# Save a debug crop of the suspected watermark area to verify its extent
debug = img.crop((0, 0, min(w, 1000), min(h, 500)))
debug.save("debug_watermark_area.jpg")
# IMPORTANT: View this debug image to confirm where the watermark actually is
# before proceeding. Guessing coordinates wastes iterations.
```

## Step 2: Create a mask and inpaint

```python
cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

# --- Option A: Color-based mask (best for colored logos on neutral backgrounds) ---
hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
# Example: detect blue watermark pixels (adjust ranges for your watermark color)
lower_blue = np.array([90, 40, 40])
upper_blue = np.array([130, 255, 255])
mask = cv2.inRange(hsv, lower_blue, upper_blue)

# Also catch dark text pixels in the watermark region
roi_gray = cv2.cvtColor(cv_img[:wm_h, :wm_w], cv2.COLOR_BGR2GRAY)
_, dark_mask = cv2.threshold(roi_gray, 80, 255, cv2.THRESH_BINARY_INV)
# Combine: place dark_mask into the full-size mask
mask[:wm_h, :wm_w] = cv2.bitwise_or(mask[:wm_h, :wm_w], dark_mask)

# --- Option B: Region-based mask (when you know the bounding box) ---
# Simpler but removes everything in the box, not just the watermark pixels
mask = np.zeros(cv_img.shape[:2], dtype=np.uint8)
mask[0:wm_h, 0:wm_w] = 255  # fill the entire watermark region

# Dilate the mask slightly to catch anti-aliased edges
kernel = np.ones((5, 5), np.uint8)
mask = cv2.dilate(mask, kernel, iterations=2)

# Inpaint — fills masked area using surrounding pixel data
result = cv2.inpaint(cv_img, mask, inpaintRadius=7, flags=cv2.INPAINT_TELEA)
# INPAINT_TELEA: fast marching method (best for most cases)
# INPAINT_NS: Navier-Stokes (better for large regions, slower)

result_pil = Image.fromarray(cv2.cvtColor(result, cv2.COLOR_BGR2RGB))
result_pil.save("clean.jpg", quality=92, optimize=True)
```

## Step 3: Verify the result

```python
# Save a crop of the same region after removal to confirm it's clean
verify = result_pil.crop((0, 0, min(w, 1000), min(h, 500)))
verify.save("debug_watermark_removed.jpg")
# View this image before proceeding to resize/crop
```

To spot-check specific pixels after removal, use the pixel check in the skill's Debug Workflow.

## Tips

- For watermarks on uniform backgrounds (studio portraits, product photos), `INPAINT_TELEA` with `inpaintRadius=5-10` works well.
- For watermarks over textured areas (landscapes, fabric), use `INPAINT_NS` with a larger radius (10-15).
- If the watermark is semi-transparent, color-based masking (Option A) is more precise than a rectangular region mask.
- Always verify at full resolution — artifacts invisible in thumbnails may be obvious when zoomed in.

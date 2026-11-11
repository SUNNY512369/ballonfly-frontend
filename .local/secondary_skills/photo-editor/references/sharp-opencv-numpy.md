# sharp, OpenCV, and numpy

## sharp (Node.js — use for high throughput)

```javascript
const sharp = require('sharp');

// Resize + convert + optimize, streaming (flat memory)
await sharp('in.jpg')
  .rotate() // auto-rotate from EXIF (like exif_transpose)
  .resize(1080, 1080, { fit: 'cover', position: 'center' }) // = ImageOps.fit
  .webp({ quality: 85 })
  .toFile('out.webp');
// fit options: 'cover' (crop), 'contain' (letterbox), 'inside' (shrink to fit), 'fill' (stretch)

// Composite watermark
await sharp('photo.jpg')
  .composite([{ input: 'logo.png', gravity: 'southeast' }])
  .toFile('watermarked.jpg');
```

sharp strips all metadata by default. Use `.withMetadata()` to preserve EXIF/ICC.

## OpenCV (when Pillow isn't enough)

```python
import cv2

img = cv2.imread("in.jpg")  # BGR order, not RGB!
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Face detection
cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
for (x, y, w, h) in faces:
    cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)
cv2.imwrite("out.jpg", img)

# Pillow <-> OpenCV
import numpy as np
cv_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
pil_img = Image.fromarray(cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB))
```

## Bulk Pixel Manipulation — Use numpy, Not getpixel/putpixel

**Never loop over pixels with `getpixel()`/`putpixel()`** for large regions — it is extremely slow (minutes for a full image). Convert to a numpy array, operate on the array, then convert back.

```python
import numpy as np
from PIL import Image

img = Image.open("photo.jpg").convert("RGB")
arr = np.array(img)  # shape: (height, width, 3), dtype: uint8

# Example: replace a region with sampled background color
bg_color = arr[50, -100, :]  # sample one pixel from the right side
arr[0:300, 0:800, :] = bg_color  # fill the region instantly

# Example: blend two regions with a gradient mask
alpha = np.linspace(1, 0, 100).reshape(1, 100, 1)  # horizontal fade over 100px
region = arr[0:300, 700:800, :]
bg_strip = np.full_like(region, bg_color)
arr[0:300, 700:800, :] = (region * (1 - alpha) + bg_strip * alpha).astype(np.uint8)

result = Image.fromarray(arr)
```

**Speed comparison:** `putpixel` on a 700x250 region = ~175,000 calls = 30+ seconds. numpy array slice = instant.

# Face-Aware Cropping

For portraits and headshots, detect the face first and crop around it instead of guessing coordinates. This produces much better results for profile pictures.

```python
import cv2
import numpy as np
from PIL import Image, ImageOps

img = Image.open("portrait.jpg")
img = ImageOps.exif_transpose(img)

cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)

cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(100, 100))

if len(faces) > 0:
    # Use the largest detected face
    fx, fy, fw, fh = max(faces, key=lambda f: f[2] * f[3])
    face_cx = fx + fw // 2
    face_cy = fy + fh // 2

    # Square crop centered on face with padding (3x face height for head+shoulders)
    crop_size = min(img.width, img.height, fh * 3)
    left = max(0, face_cx - crop_size // 2)
    top = max(0, face_cy - int(crop_size * 0.35))  # face in upper third
    right = left + crop_size
    bottom = top + crop_size

    # Clamp to image bounds
    if right > img.width:
        left -= (right - img.width)
        right = img.width
    if bottom > img.height:
        top -= (bottom - img.height)
        bottom = img.height
    left = max(0, left)
    top = max(0, top)

    cropped = img.crop((left, top, right, bottom))
    profile = cropped.resize((800, 800), Image.Resampling.LANCZOS)
    profile.save("profile_800x800.jpg", quality=92, optimize=True)
else:
    # Fallback: center crop
    profile = ImageOps.fit(img, (800, 800), Image.Resampling.LANCZOS, centering=(0.5, 0.4))
    profile.save("profile_800x800.jpg", quality=92, optimize=True)
```

## Tips

- `centering=(0.5, 0.4)` in the fallback biases the crop slightly toward the top — better for portraits than dead center.
- For group photos with multiple faces, you may want to fit all detected faces in the crop instead of picking the largest.

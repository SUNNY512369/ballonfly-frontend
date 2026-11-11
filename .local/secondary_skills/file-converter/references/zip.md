# ZIP Archives

```python
import zipfile
from pathlib import Path

# --- Create ZIP from files ---
with zipfile.ZipFile("archive.zip", "w", zipfile.ZIP_DEFLATED) as zf:
    zf.write("file1.txt")
    zf.write("file2.csv")
    zf.write("images/photo.jpg")

# --- Create ZIP from entire directory ---
import shutil
shutil.make_archive("archive", "zip", root_dir="my_folder")  # creates archive.zip

# --- Extract all ---
with zipfile.ZipFile("archive.zip", "r") as zf:
    zf.extractall("output_dir")

# --- Extract single file ---
with zipfile.ZipFile("archive.zip", "r") as zf:
    zf.extract("file1.txt", "output_dir")

# --- List contents without extracting ---
with zipfile.ZipFile("archive.zip", "r") as zf:
    for info in zf.infolist():
        print(f"{info.filename} {info.file_size:,} bytes {info.compress_size:,} compressed")

# --- Read file from ZIP without extracting ---
with zipfile.ZipFile("archive.zip", "r") as zf:
    content = zf.read("file1.txt").decode("utf-8")

# --- Add files to existing ZIP ---
with zipfile.ZipFile("archive.zip", "a") as zf:
    zf.write("new_file.txt")

# --- Create ZIP with password (read-only, use pyzipper for write) ---
# pip install pyzipper
import pyzipper
with pyzipper.AESZipFile("secure.zip", "w", compression=pyzipper.ZIP_DEFLATED,
                         encryption=pyzipper.WZ_AES) as zf:
    zf.setpassword(b"my_password")
    zf.write("secret.txt")

# --- Batch: ZIP all PDFs in a directory ---
with zipfile.ZipFile("all_pdfs.zip", "w", zipfile.ZIP_DEFLATED) as zf:
    for p in Path(".").glob("**/*.pdf"):
        zf.write(p)
```

**ZIP gotchas:**

- `zipfile` is in Python's standard library — no install needed
- Always use `ZIP_DEFLATED` compression (default is `ZIP_STORED` = no compression)
- For password-protected ZIPs, stdlib `zipfile` can only read (not write) — use `pyzipper` for encrypted writes
- Max file size in standard ZIP is 4 GB; use `allowZip64=True` (default in Python 3) for larger files
- `shutil.make_archive` is the simplest way to ZIP an entire directory tree

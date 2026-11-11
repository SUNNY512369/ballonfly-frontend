# PDF Operations and PDF → SVG

## PDF Operations

```python
# --- Extract text + tables ---
import pdfplumber
with pdfplumber.open("in.pdf") as pdf:
    text = "\n".join(p.extract_text() or "" for p in pdf.pages)
    tables = pdf.pages[0].extract_tables()  # list of list-of-rows

# --- PDF → images (one PNG per page) ---
from pdf2image import convert_from_path
for i, img in enumerate(convert_from_path("in.pdf", dpi=200)):
    img.save(f"page_{i+1}.png")

# --- Merge / split / rotate ---
from pypdf import PdfReader, PdfWriter
writer = PdfWriter()
for path in ["a.pdf", "b.pdf"]:
    for page in PdfReader(path).pages:
        writer.add_page(page)
writer.write("merged.pdf")

# Extract pages 2–5
reader = PdfReader("in.pdf")
writer = PdfWriter()
for p in reader.pages[1:5]:
    writer.add_page(p)
writer.write("pages_2-5.pdf")
```

**PDF gotchas:**

- `pdf2image` needs `poppler-utils` installed system-wide (not a pip package)
- Scanned PDFs have no text layer — pdfplumber returns `None`. Use `pytesseract` OCR on pdf2image output.
- `PyPDF2` is deprecated → use `pypdf` (same API, maintained fork)

## PDF to SVG

```python
# --- PyMuPDF (fitz) — best quality, vector-preserving ---
import fitz  # pip install pymupdf

# Single page
doc = fitz.open("in.pdf")
page = doc[0]
svg_text = page.get_svg_image()
with open("page_1.svg", "w") as f:
    f.write(svg_text)

# All pages
doc = fitz.open("in.pdf")
for i, page in enumerate(doc):
    svg_text = page.get_svg_image()
    with open(f"page_{i+1}.svg", "w") as f:
        f.write(svg_text)
doc.close()

# With custom resolution (matrix scales the output)
doc = fitz.open("in.pdf")
page = doc[0]
mat = fitz.Matrix(2, 2)  # 2x scale for higher detail
svg_text = page.get_svg_image(matrix=mat)
with open("page_hires.svg", "w") as f:
    f.write(svg_text)
```

```bash
# --- CLI alternatives ---
# pdf2svg (if installed)
pdf2svg in.pdf out.svg 1  # page number

# Inkscape CLI
inkscape in.pdf --export-type=svg --export-filename=out.svg

# pdftocairo (from poppler-utils)
pdftocairo -svg in.pdf out.svg
```

**PDF to SVG gotchas:**

- `pymupdf` (imported as `fitz`) produces true vector SVGs — text stays as text, paths stay as paths
- Scanned PDFs produce SVGs with embedded raster images (no vector data to extract)
- Large PDFs with complex graphics produce very large SVG files
- `pdf2svg` CLI tool is simple but must be installed separately (`apt install pdf2svg`)
- For rasterized SVG (simpler but not truly vector): render PDF to PNG first, then embed in SVG

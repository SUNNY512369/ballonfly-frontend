# Document, EPUB, and HTML → PDF Conversions

## Document Formats — pandoc is the Swiss Army knife

```bash
# Markdown → PDF (requires LaTeX: apt install texlive-xetex)
pandoc input.md -o output.pdf --pdf-engine=xelatex

# Markdown → DOCX
pandoc input.md -o output.docx

# DOCX → Markdown (extracts images to ./media/)
pandoc input.docx -o output.md --extract-media=.

# HTML → Markdown
pandoc input.html -o output.md -t gfm

# Any → Any (pandoc supports ~40 formats)
pandoc -f docx -t rst input.docx -o output.rst
```

```python
# From Python
import pypandoc
pypandoc.convert_file("in.md", "docx", outputfile="out.docx")
```

**Without pandoc (pure Python):**

```python
# Markdown → HTML
import markdown
html = markdown.markdown(open("in.md").read(), extensions=["tables", "fenced_code", "toc"])

# HTML → Markdown
from markdownify import markdownify
md = markdownify(html, heading_style="ATX")  # ATX = # headers, not underlines
```

## EPUB Formats

```python
# --- EPUB → other formats (via pandoc) ---
# pandoc is the easiest way to convert EPUB
import pypandoc

# EPUB → Markdown
pypandoc.convert_file("in.epub", "markdown", outputfile="out.md")

# EPUB → HTML
pypandoc.convert_file("in.epub", "html", outputfile="out.html")

# EPUB → DOCX
pypandoc.convert_file("in.epub", "docx", outputfile="out.docx")

# EPUB → plain text
pypandoc.convert_file("in.epub", "plain", outputfile="out.txt")

# --- Other formats → EPUB ---
# Markdown → EPUB
pypandoc.convert_file("in.md", "epub", outputfile="out.epub",
                      extra_args=["--metadata", "title=My Book"])

# HTML → EPUB
pypandoc.convert_file("in.html", "epub", outputfile="out.epub",
                      extra_args=["--metadata", "title=My Book"])

# DOCX → EPUB
pypandoc.convert_file("in.docx", "epub", outputfile="out.epub")
```

```bash
# --- CLI equivalents ---
pandoc in.epub -o out.md
pandoc in.epub -o out.pdf --pdf-engine=xelatex
pandoc in.md -o out.epub --metadata title="My Book"
pandoc in.html -o out.epub --metadata title="My Book" --epub-cover-image=cover.jpg
```

```python
# --- Pure Python: read/write EPUB with ebooklib ---
from ebooklib import epub

# Read EPUB
book = epub.read_epub("in.epub")
for item in book.get_items_of_type(9):  # 9 = ITEM_DOCUMENT (HTML chapters)
    print(item.get_name())
    html_content = item.get_content().decode("utf-8")

# Create EPUB from scratch
book = epub.EpubBook()
book.set_identifier("id123")
book.set_title("My Book")
book.set_language("en")
book.add_author("Author Name")
ch1 = epub.EpubHtml(title="Chapter 1", file_name="ch1.xhtml", lang="en")
ch1.content = "<h1>Chapter 1</h1><p>Hello world.</p>"
book.add_item(ch1)
book.toc = [epub.Link("ch1.xhtml", "Chapter 1", "ch1")]
book.add_item(epub.EpubNcx())
book.add_item(epub.EpubNav())
book.spine = ["nav", ch1]
epub.write_epub("out.epub", book)
```

**EPUB gotchas:**

- `pandoc` is the simplest for format-to-format EPUB conversion
- Always add `--metadata title="..."` when creating EPUB — readers require a title
- EPUB is essentially a ZIP of HTML files — `ebooklib` gives you fine-grained control
- For EPUB → PDF, pandoc needs a LaTeX engine (`texlive-xetex`)
- Cover images: use `--epub-cover-image=cover.jpg` with pandoc

## HTML to PDF

```python
# --- weasyprint (best CSS support, no browser needed) ---
from weasyprint import HTML

# Simple file conversion
HTML("in.html").write_pdf("out.pdf")

# From URL
HTML("https://example.com").write_pdf("page.pdf")

# From HTML string
HTML(string="<h1>Hello</h1><p>World</p>").write_pdf("out.pdf")

# With custom CSS
HTML("in.html").write_pdf("out.pdf", stylesheets=["custom.css"])

# With page size and margins
from weasyprint import CSS
HTML("in.html").write_pdf("out.pdf", stylesheets=[
    CSS(string="@page { size: A4; margin: 2cm; }")
])

# Landscape orientation
HTML("in.html").write_pdf("out.pdf", stylesheets=[
    CSS(string="@page { size: A4 landscape; margin: 1.5cm; }")
])
```

```bash
# --- CLI alternatives ---
# pandoc (simpler, less CSS fidelity)
pandoc in.html -o out.pdf --pdf-engine=xelatex

# weasyprint CLI
weasyprint in.html out.pdf
weasyprint https://example.com page.pdf
```

**HTML to PDF gotchas:**

- `weasyprint` supports CSS3 including flexbox, grid, and `@page` rules — best for styled documents
- `weasyprint` does NOT run JavaScript — for JS-heavy pages, use `playwright` or `pyppeteer` instead
- For JS-rendered pages: `playwright` → `page.pdf()` is the most reliable option
- pandoc HTML → PDF goes through LaTeX, so complex CSS layouts may not render correctly
- Large HTML files with many images: use `HTML(filename="in.html", base_url=".")` so relative image paths resolve

# PDF & DOCX Export

**Every drafted contract MUST be delivered as both a PDF and a DOCX file.** Clients need PDF for signing and DOCX for redlining — always provide both.

## Architecture: React + Vite → Puppeteer PDF + python-docx DOCX

Build the contract as a React web artifact first (source of truth for layout), then export:

### PDF via Puppeteer

Install `puppeteer-core` in the `scripts` package: `pnpm --filter @workspace/scripts add puppeteer-core`

```typescript
// scripts/src/generate-contract.ts
import puppeteer from 'puppeteer-core';

// Find Chromium — pick the latest version from the list:
// ls /nix/store/*chromium*/bin/chromium | sort -V | tail -1
const CHROMIUM_PATH = "/nix/store/FIND_LATEST_PATH/bin/chromium";

// Use the artifact's actual URL, not localhost
const CONTRACT_URL = `https://${process.env.REPLIT_DEV_DOMAIN}/ARTIFACT-ROUTE`;

const browser = await puppeteer.launch({
  executablePath: CHROMIUM_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 816, height: 1056 }); // Match page container dimensions
await page.goto(CONTRACT_URL, { waitUntil: 'networkidle0' });

// IMPORTANT: Set document.title for correct PDF metadata title.
// Without this, the PDF viewer title bar shows the HTML <title> from index.html,
// which may be wrong when generating multiple documents from the same app.
await page.evaluate(() => { document.title = "Your Document Title Here"; });

await page.pdf({
  path: 'contract.pdf',
  format: 'Letter',
  printBackground: true,
  // IMPORTANT: Use zero margins — the page containers already include internal padding.
  // Non-zero Puppeteer margins + fixed-height containers = blank overflow pages.
  margin: { top: '0', bottom: '0', left: '0', right: '0' },
});

await browser.close();
```

Add a script entry in `scripts/package.json`: `"generate-contract": "tsx ./src/generate-contract.ts"`

Run via: `pnpm --filter @workspace/scripts run generate-contract`

### DOCX via python-docx

Python may not be available via `pip` in the Replit environment. Use `nix-shell` to get `python-docx`:

```bash
nix-shell -p python3Packages.python-docx --run "python3 scripts/src/generate-contract.py"
```

```python
# scripts/src/generate-contract.py
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()

# Set default font
style = doc.styles['Normal']
font = style.font
font.name = 'Times New Roman'
font.size = Pt(12)

# Set margins
for section in doc.sections:
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1.25)
    section.right_margin = Inches(1.25)

# Title
title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run('DOCUMENT TITLE')
run.bold = True
run.font.size = Pt(18)

# Preamble
doc.add_paragraph(
    'This Agreement is entered into as of [DATE] by and between:'
)

# Parties table
table = doc.add_table(rows=1, cols=2)
table.style = 'Table Grid'
# ... populate with party details

# Sections with numbered clauses
heading = doc.add_paragraph()
run = heading.add_run('1. Section Title')
run.bold = True
doc.add_paragraph('Section body text...')

# Signature block
sig_table = doc.add_table(rows=5, cols=2)
# Row 0: labels (BUYER / SELLER)
# Rows 1-4: Signature, Printed Name, Title, Date lines

doc.save('contract.docx')
```

## Styling for Legal Documents

- **Font**: Times New Roman 12pt (standard for legal docs) or similar serif
- **Margins**: 1" top/bottom, 1.25" left/right
- **Line spacing**: 1.5 or double-spaced (jurisdiction dependent)
- **Section numbering**: Use hierarchical numbering (1, 1.1, 1.1.1)
- **Page numbers**: Bottom center, "Page X of Y"
- **Headers**: Document title and date on each page
- **Signature blocks**: Two-column layout with lines for signature, printed name, title, date

## Page-Aware Layout (Preventing Blank PDF Pages)

Use fixed-height page containers that map 1:1 to physical letter pages. This ensures content stays within page boundaries on screen and in PDF output.

### Page container constants (letter size at 96 DPI)

- `PAGE_W = "816px"` (8.5 inches)
- `PAGE_H = "1056px"` (11 inches)
- Internal padding: `48px` top/bottom, `72px` left/right

### Page container component pattern

```tsx
<div
  className="page-container mx-auto bg-white shadow-lg print:shadow-none mb-8 print:mb-0 flex flex-col overflow-hidden"
  style={{
    width: PAGE_W,
    height: PAGE_H,
    pageBreakAfter: pageNum < TOTAL_PAGES ? "always" : undefined,
    breakAfter: pageNum < TOTAL_PAGES ? "page" : undefined,
  }}
>
  {/* Page header with "Page X of Y" */}
  {/* Content area with internal padding */}
</div>
```

### Critical CSS for print/PDF — add to your global stylesheet

```css
@page {
  size: letter;
  margin: 0;
}

@media print {
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }

  .page-container {
    box-shadow: none !important;
    margin: 0 !important;
  }
}
```

**Why blank pages happen:** If Puppeteer adds its own margins (e.g., `margin: { top: "0.5in" }`) on top of 1056px containers, each container exceeds the physical page height. The overflow creates a blank page before the next `breakAfter: "page"` fires. The fix: always use `margin: { top: "0", bottom: "0", left: "0", right: "0" }` in Puppeteer and `@page { margin: 0 }` in CSS, since the page containers already include their own internal padding.

**Do NOT override `height: auto` in print media** — removing the fixed height lets containers expand beyond one page, defeating the 1:1 page mapping. Keep the fixed height; the CSS page breaks handle pagination.

### Outer wrapper must neutralize screen-only styles for print

```tsx
<div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:py-0 print:px-0 print:min-h-0">
```

**Viewport must match page width** in Puppeteer: `page.setViewport({ width: 816, height: 1056 })` so content renders at the correct scale.

**Content balancing:** Use `breakInside: "avoid"` on sections and distribute content across pages so no page overflows. Check the rendered layout in the browser at 816px width before generating PDFs.

## Multi-Document Routing

When generating multiple documents for the same transaction (e.g., LOI + NDA), use a single React artifact with separate routes for each document:

```tsx
// App.tsx
<Route path="/" component={LOIDocument} />
<Route path="/nda" component={NDADocument} />
```

Then generate separate PDF/DOCX files for each document by pointing Puppeteer at each route and running a separate python-docx script per document. Present all files together so the user receives the complete package.

**IMPORTANT:** Since all routes share the same `index.html`, the HTML `<title>` tag applies to every document. Each PDF generation script must call `page.evaluate(() => { document.title = "Correct Document Title"; })` before `page.pdf()` to set the correct PDF metadata title. Otherwise the PDF viewer's title bar will show the wrong document name.

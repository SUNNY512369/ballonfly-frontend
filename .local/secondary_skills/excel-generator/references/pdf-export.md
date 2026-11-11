# PDF Export & Print Layout

## Method 1: LibreOffice CLI (best fidelity)

```bash
libreoffice --headless --calc --convert-to pdf --outdir ./output report.xlsx
```

```python
import subprocess

def xlsx_to_pdf(input_path, output_dir="./output"):
    result = subprocess.run(
        ["libreoffice", "--headless", "--calc", "--convert-to", "pdf",
         "--outdir", output_dir, input_path],
        capture_output=True, text=True, timeout=60
    )
    if result.returncode != 0:
        raise RuntimeError(f"Conversion failed: {result.stderr}")
    return f"{output_dir}/{input_path.rsplit('/', 1)[-1].replace('.xlsx', '.pdf')}"
```

## Method 2: Print Layout in openpyxl

```python
from openpyxl.worksheet.page import PageMargins, PrintPageSetup

ws.page_setup.orientation = "landscape"
ws.page_setup.paperSize = ws.PAPERSIZE_LETTER
ws.page_setup.fitToWidth = 1
ws.page_setup.fitToHeight = 0
ws.sheet_properties.pageSetUpPr.fitToPage = True

ws.page_margins = PageMargins(left=0.5, right=0.5, top=0.75, bottom=0.75,
                              header=0.3, footer=0.3)

ws.oddHeader.center.text = "Sales Report — Q1 2026"
ws.oddHeader.center.font = "Arial,Bold"
ws.oddHeader.center.size = 12
ws.oddFooter.center.text = "Page &P of &N"
ws.oddFooter.right.text = "&D"

ws.print_title_rows = "1:1"
ws.print_area = f"A1:F{last_row}"
ws.row_breaks.append(openpyxl.worksheet.pagebreak.Break(id=25))
```

## Method 3: Print Layout in xlsxwriter

```python
ws.set_landscape()
ws.set_paper(1)
ws.fit_to_pages(1, 0)
ws.set_margins(left=0.5, right=0.5, top=0.75, bottom=0.75)
ws.set_header("&C&\"Arial,Bold\"&14 Sales Report")
ws.set_footer("&CPage &P of &N")
ws.repeat_rows(0)
ws.print_area(0, 0, last_row, 5)
ws.set_page_break(25, 0)
```

## Print layout tips

- Always set `fitToWidth=1` for wide tables — prevents columns from being cut off across pages.
- Use `repeat_rows` to repeat headers on every page — critical for multi-page tables.
- Set margins to 0.5" for data-heavy sheets, 0.75"+ for presentation sheets.
- Test with landscape for tables wider than 6 columns.
- For Excel-native PDF: the user can also do File > Export > PDF in Excel after opening.

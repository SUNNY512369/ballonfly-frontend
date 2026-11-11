# Multi-Workbook Linking

Excel supports cross-workbook references using `[filename.xlsx]SheetName!Cell` syntax. Python can write these formulas as strings.

## Writing cross-workbook references

```python
import xlsxwriter

wb = xlsxwriter.Workbook("master_report.xlsx")
ws = wb.add_worksheet("Consolidated")

ws.write(0, 0, "Region")
ws.write(0, 1, "Revenue")
ws.write(0, 2, "EBITDA")

regions = [
    ("East", "east_data.xlsx"),
    ("West", "west_data.xlsx"),
    ("Central", "central_data.xlsx"),
]
for i, (region, filename) in enumerate(regions, 1):
    ws.write(i, 0, region)
    ws.write_formula(i, 1, f"='[{filename}]Summary'!B2")
    ws.write_formula(i, 2, f"='[{filename}]Summary'!B5")

ws.write(len(regions) + 1, 0, "Total")
ws.write_formula(len(regions) + 1, 1, f"=SUM(B2:B{len(regions)+1})")
ws.write_formula(len(regions) + 1, 2, f"=SUM(C2:C{len(regions)+1})")
wb.close()
```

## Multi-workbook gotchas

- External references only resolve when both files are open in Excel or when Excel has cached values.
- Python writes the formula string only — no values are cached. On first open, Excel will show `#REF!` until the linked file is also open or the link is updated.
- File paths in references can be relative (`[file.xlsx]`) or absolute (`'C:\Reports\[file.xlsx]'`). Prefer relative for portability.
- When generating a suite of workbooks, generate all data workbooks first, then the master.
- Google Sheets uses `IMPORTRANGE("spreadsheet_url", "Sheet1!A1:B10")` instead of bracket syntax.

## Generating a workbook suite

```python
import xlsxwriter

regions = {"East": [100, 200, 150], "West": [180, 220, 190],
           "Central": [90, 110, 130]}

for region, revenues in regions.items():
    wb = xlsxwriter.Workbook(f"{region.lower()}_data.xlsx")
    ws = wb.add_worksheet("Summary")
    ws.write(0, 0, "Quarter")
    ws.write(0, 1, "Revenue")
    for i, rev in enumerate(revenues, 1):
        ws.write(i, 0, f"Q{i}")
        ws.write(i, 1, rev)
    ws.write(len(revenues) + 1, 0, "Total")
    ws.write_formula(len(revenues) + 1, 1, f"=SUM(B2:B{len(revenues)+1})")
    wb.close()
```

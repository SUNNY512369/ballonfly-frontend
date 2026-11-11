# Pivot-Table-Style Summaries

Python cannot create native Excel PivotTables programmatically (they require cached data). Instead, build the equivalent summary using formulas or pandas aggregation.

## Pattern 1: pandas groupby to formatted Excel output

```python
import pandas as pd

df = pd.DataFrame({
    "Region": ["East", "East", "West", "West", "East", "West"],
    "Product": ["Widget", "Gadget", "Widget", "Gadget", "Widget", "Gadget"],
    "Revenue": [120, 80, 150, 90, 200, 110],
    "Units": [10, 5, 12, 6, 15, 8],
})

pivot = df.pivot_table(
    values=["Revenue", "Units"],
    index="Region",
    columns="Product",
    aggfunc="sum",
    margins=True,
    margins_name="Total"
)
pivot.columns = [f"{val} - {prod}" for val, prod in pivot.columns]
pivot = pivot.reset_index()

with pd.ExcelWriter("pivot_report.xlsx", engine="xlsxwriter") as writer:
    df.to_excel(writer, sheet_name="Data", index=False)
    pivot.to_excel(writer, sheet_name="Summary", index=False)
    ws = writer.sheets["Summary"]
    ws.autofit()
    hdr_fmt = writer.book.add_format(
        {"bold": True, "bg_color": "#2F5496", "font_color": "white"})
    for col_num, value in enumerate(pivot.columns):
        ws.write(0, col_num, value, hdr_fmt)
```

## Pattern 2: SUMIFS-based pivot using formulas (dynamic in Excel)

```python
import xlsxwriter

wb = xlsxwriter.Workbook("formula_pivot.xlsx")
ws_data = wb.add_worksheet("Data")
ws_pivot = wb.add_worksheet("Pivot")

headers = ["Region", "Product", "Revenue"]
data_rows = [("East", "Widget", 120), ("East", "Gadget", 80),
             ("West", "Widget", 150), ("West", "Gadget", 90),
             ("East", "Widget", 200), ("West", "Gadget", 110)]
ws_data.write_row(0, 0, headers)
for i, row in enumerate(data_rows, 1):
    ws_data.write_row(i, 0, row)
last_data = len(data_rows)

regions = ["East", "West"]
products = ["Widget", "Gadget"]

ws_pivot.write(0, 0, "Region \\ Product")
for j, prod in enumerate(products):
    ws_pivot.write(0, j + 1, prod)
ws_pivot.write(0, len(products) + 1, "Total")

for i, region in enumerate(regions):
    ws_pivot.write(i + 1, 0, region)
    for j, prod in enumerate(products):
        ws_pivot.write_formula(i + 1, j + 1,
            f'=SUMIFS(Data!C2:C{last_data+1}, Data!A2:A{last_data+1}, '
            f'A{i+2}, Data!B2:B{last_data+1}, {chr(66+j)}1)')
    ws_pivot.write_formula(i + 1, len(products) + 1,
        f"=SUM(B{i+2}:{chr(65+len(products))}{i+2})")

ws_pivot.write(len(regions) + 1, 0, "Total")
for j in range(len(products) + 1):
    col_letter = chr(66 + j)
    ws_pivot.write_formula(len(regions) + 1, j + 1,
        f"=SUM({col_letter}2:{col_letter}{len(regions)+1})")

wb.close()
```

## Pattern 3: Multi-dimension pivot with percentage columns

After building a pivot, add percentage-of-total columns:

- `=Cell / ColumnTotal` formatted as `"0.0%"`
- `=Cell / RowTotal` formatted as `"0.0%"`
- Use `IFERROR` to handle division by zero

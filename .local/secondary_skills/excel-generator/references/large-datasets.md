# Large Dataset Handling

For datasets exceeding 100K rows, standard openpyxl will consume excessive memory. Use these strategies:

## xlsxwriter (streaming by default)

```python
import xlsxwriter

wb = xlsxwriter.Workbook("large_dataset.xlsx", {"constant_memory": True})
ws = wb.add_worksheet()
ws.write_row(0, 0, ["ID", "Name", "Value", "Category", "Date"])
for i in range(1, 1_000_001):
    ws.write_row(i, 0, [i, f"Item_{i}", i * 1.5, f"Cat_{i % 10}", "2026-01-01"])
wb.close()
```

`constant_memory: True` — reduces RAM usage further by flushing rows to disk. Trade-off: you cannot go back and edit earlier rows.

## openpyxl write-only mode

```python
from openpyxl import Workbook

wb = Workbook(write_only=True)
ws = wb.create_sheet("Data")
ws.append(["ID", "Name", "Value"])
for i in range(1, 500_001):
    ws.append([i, f"Item_{i}", i * 1.5])
wb.save("large_openpyxl.xlsx")
```

`write_only` gotchas:

- Cannot read or modify cells after writing — append-only.
- Cannot add tables, merged cells, or conditional formatting.
- Cannot set column widths (use xlsxwriter if you need formatting + large data).

## Chunked reading of large files

```python
from openpyxl import load_workbook

wb = load_workbook("huge_file.xlsx", read_only=True, data_only=True)
ws = wb.active
batch = []
for i, row in enumerate(ws.iter_rows(min_row=2, values_only=True)):
    batch.append(row)
    if len(batch) >= 10_000:
        process_batch(batch)
        batch = []
if batch:
    process_batch(batch)
wb.close()
```

## pandas chunked processing

```python
import pandas as pd

chunks = pd.read_excel("huge_file.xlsx", sheet_name="Data", engine="openpyxl",
                       dtype={"ID": int, "Value": float},
                       usecols=["ID", "Name", "Value"])

for chunk in pd.read_csv("data.csv", chunksize=50_000):
    process(chunk)
```

## Performance comparison

| Method | Max Rows (practical) | RAM for 1M rows | Formatting |
| --- | --- | --- | --- |
| xlsxwriter `constant_memory` | 1M+ | ~200MB | Full |
| xlsxwriter normal | 1M+ | ~500MB | Full |
| openpyxl `write_only` | 500K | ~1GB | None |
| openpyxl normal | 100K | ~5GB | Full |
| pandas `to_excel` (xlsxwriter) | 1M+ | ~800MB | Via engine |

## Decision tree

- Need formatting + large data -> xlsxwriter with `constant_memory: True`
- Need to read + modify large file -> openpyxl `read_only` + process + xlsxwriter output
- Just need data dump -> pandas `to_excel` with xlsxwriter engine
- Over 1M rows -> split across multiple sheets (Excel limit is 1,048,576 rows per sheet)

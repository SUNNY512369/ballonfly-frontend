# Excel Data Tables (Sensitivity Analysis)

Excel Data Tables (What-If Analysis > Data Table) let you vary one or two inputs and see how an output changes. Python cannot create native data tables, but you can build the equivalent grid of formulas.

## One-Way Data Table

```python
import xlsxwriter

wb = xlsxwriter.Workbook("sensitivity_1way.xlsx")
ws = wb.add_worksheet("Sensitivity")

ws.write(0, 0, "Revenue")
ws.write(0, 1, 1000)
ws.write(1, 0, "Margin")
ws.write(1, 1, 0.20)
ws.write(2, 0, "EBITDA")
ws.write_formula(2, 1, "=B1*B2")

margins = [0.10, 0.15, 0.20, 0.25, 0.30]
ws.write(4, 0, "Margin Sensitivity")
ws.write(5, 0, "Margin")
ws.write(5, 1, "EBITDA")

pct_fmt = wb.add_format({"num_format": "0.0%"})
money_fmt = wb.add_format({"num_format": '"$"#,##0.0'})

for i, margin in enumerate(margins):
    ws.write(6 + i, 0, margin, pct_fmt)
    ws.write_formula(6 + i, 1, f"=B1*A{7+i}", money_fmt)

wb.close()
```

## Two-Way Data Table (Sensitivity Grid)

```python
import xlsxwriter

wb = xlsxwriter.Workbook("sensitivity_2way.xlsx")
ws = wb.add_worksheet("IRR Sensitivity")

hdr = wb.add_format({"bold": True, "bg_color": "#1B3A5C",
                     "font_color": "white", "align": "center"})
corner = wb.add_format({"bold": True, "bg_color": "#1B3A5C",
                        "font_color": "white", "align": "center", "text_wrap": True})
pct = wb.add_format({"num_format": "0.0%", "align": "center"})
x_fmt = wb.add_format({"num_format": "0.0x", "align": "center"})
cell_pct = wb.add_format({"num_format": "0.0%", "align": "center",
                          "bg_color": "#F2F2F2"})

ws.write(0, 0, "Entry EBITDA")
ws.write(0, 1, 100)
ws.write(1, 0, "Equity Invested")
ws.write(1, 1, 400)
ws.write(2, 0, "Hold Period")
ws.write(2, 1, 5)

exit_multiples = [6.0, 7.0, 8.0, 9.0, 10.0]
ebitda_growth_rates = [0.00, 0.03, 0.05, 0.08, 0.10, 0.12]

start_row = 5
ws.write(start_row, 0, "EBITDA Growth \\ Exit Multiple", corner)
for j, mult in enumerate(exit_multiples):
    ws.write(start_row, j + 1, mult, x_fmt)

for i, growth in enumerate(ebitda_growth_rates):
    r = start_row + 1 + i
    ws.write(r, 0, growth, pct)
    for j, mult in enumerate(exit_multiples):
        ws.write_formula(r, j + 1,
            f"=IFERROR((B1*(1+A{r+1})^B3*{mult}/B2)^(1/B3)-1, 0)",
            cell_pct)

ws.conditional_format(start_row+1, 1,
    start_row+len(ebitda_growth_rates), len(exit_multiples), {
        "type": "3_color_scale",
        "min_color": "#F8696B",
        "mid_color": "#FFEB84",
        "max_color": "#63BE7B",
    })

ws.autofit()
wb.close()
```

## Data table tips

- Always use `IFERROR` wrappers — edge cases (negative equity, zero denominators) will produce `#DIV/0!` or `#NUM!`.
- Apply 3-color-scale conditional formatting to make the grid scannable at a glance.
- Label the corner cell clearly (e.g., "Growth \ Multiple") so users know which axis is which.
- For financial models, common sensitivity pairs: Entry Multiple vs Exit Multiple, Revenue Growth vs EBITDA Margin, WACC vs Terminal Growth.

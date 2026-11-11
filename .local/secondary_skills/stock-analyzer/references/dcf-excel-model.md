# DCF Excel Model

Read this before building the DCF Excel model (Build Order step 3): it defines the required sheets, the formula rules, and the formatting standards.

Use openpyxl in Python to generate the .xlsx file (reports/{TICKER}_DCF_Model.xlsx):

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side, numbers
from openpyxl.utils import get_column_letter
```

## Required Sheets

The Excel model must include the following sheets:

Sheet 1 -- DCF Model:

- Revenue projections (5-year forecast with growth assumptions)
- EBITDA / operating income projections (margin assumptions)
- Free cash flow build: EBITDA -> subtract taxes, capex, change in working capital -> unlevered FCF
- Terminal value calculation (perpetuity growth method AND exit multiple method)
- WACC calculation with clearly labeled inputs: risk-free rate, equity risk premium, beta, cost of debt, tax rate, debt/equity ratio
- Enterprise value -> equity value -> implied share price
- Upside/downside % vs current price

Sheet 2 -- Sensitivity Analysis:

- Two-variable data table: WACC (rows) vs terminal growth rate (columns) showing implied share price at each combination
- Highlight the base case cell
- Use conditional formatting: green for upside scenarios, red for downside

Sheet 3 -- Scenario Analysis:

- Bull / Base / Bear cases with different revenue growth, margin, and multiple assumptions
- Probability-weighted price target (e.g., 25% Bull, 50% Base, 25% Bear)
- Show each scenario's implied share price and upside/downside

Sheet 4 -- Comparable Companies:

- Peer comparison table: ticker, market cap, P/E, EV/EBITDA, P/S, revenue growth, gross margin, FCF yield
- Pull real data from yfinance for 4-6 peers
- Highlight the subject company row

Sheet 5 -- Financial Summary:

- Historical income statement (3-4 years from yfinance)
- Historical balance sheet highlights (cash, debt, equity)
- Key ratios: ROE, ROIC, debt/EBITDA, current ratio

## CRITICAL -- Use Excel Formulas, Not Hardcoded Values

- Every calculated cell MUST use an Excel formula, not a pre-computed Python value. The entire point of a financial model is that users can change assumptions and see results update automatically.
- Input cells (yellow): hardcoded values the user can edit (growth rates, margins, WACC inputs, tax rate, etc.)
- Calculated cells: MUST be formulas referencing input cells or other calculated cells. Examples:
  - Cost of Equity: `=B7+B9*B8` (risk-free + beta * ERP)
  - WACC: `=B10*(1-B13)+B11*(1-B12)*B13` (formula using CoE, CoD, tax, D/TC)
  - Revenue projections: `=B21*(1+C22)` (prior year * (1 + growth rate))
  - Gross Profit: `=C21*C24` (revenue * gross margin)
  - Terminal Value: `=B42*(1+B43)/(B44-B43)` (FCF*(1+g)/(WACC-g))
  - PV factors: `=1/(1+B44)^n`
  - Implied Share Price: `=B55/B56` (equity value / shares)
- Sensitivity table: Each cell should be a formula computing implied price for that row's WACC and column's terminal growth rate, referencing the DCF Model sheet for PV of FCFs, terminal FCF, debt, cash, and shares.
- Scenario Analysis: Implied prices should be formulas (e.g., revenue * EBITDA margin * EV/EBITDA multiple / (1+WACC)^5, adjusted for net cash). Probability-weighted target = SUMPRODUCT of probabilities and prices.
- Financial Summary: Derived metrics (gross profit, margins, net cash, FCF, ROE) should be formulas referencing the raw data cells, not hardcoded.
- Cross-sheet references use the format: `='DCF Model'!B42`
- Test: Open the Excel file, change WACC from 12.5% to 10%, and verify the implied share price, sensitivity table, and scenario prices all update. If anything stays static, it's broken.

## Formatting Standards

- Professional header row with navy (#003366) background and white text
- Alternating row shading for data tables
- Number formatting: currency with commas ($#,##0), percentages (0.0%), large numbers in millions ($#,##0M)
- Input cells (assumptions) highlighted in light yellow (#FFFFCC) with medium borders to visually distinguish from calculated cells
- Freeze panes on header rows
- Column widths auto-sized for readability

Present the Excel model to the user in chat alongside the PDF.

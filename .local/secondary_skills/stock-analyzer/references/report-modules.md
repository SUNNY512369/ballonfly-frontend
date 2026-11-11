# Project Architecture -- Reusable Modules

Read this before writing or running any script under `reports/`: it lists the shared modules, the workflow for adding a ticker, and the data validation and peer data rules.

The reports/ directory contains shared modules that all ticker-specific scripts import from. Never duplicate the ResearchReport class, chart functions, or Excel styling helpers -- always import from these modules.

## reports/report_base.py -- Shared PDF Report Class

- sanitize_text(text): Cleans Unicode characters for fpdf2's latin-1 encoding. Apply to ALL text before passing to pdf.cell() or pdf.multi_cell().
- ResearchReport(company_name, ticker): Extends FPDF with all report methods. Constructor sets alias_nb_pages() and auto_page_break(margin=15).
  - Methods: header(), footer(), ensure_space(needed_mm), section_title(), sub_title(), body_text(), bullet_point(), key_metric(), table_header(), table_row(), data_table(), callout_box(), cover_page(data_dict), disclaimer_page(sources_text)
  - cover_page(data) expects a dict with keys: exchange, sector, rating, price_target, current_price, market_cap_str, range_52w, analyst_consensus
- Usage: from report_base import ResearchReport, sanitize_text
- IMPORTANT fpdf2 gotcha: bullet_point() uses cell(5, 4, chr(149)) then multi_cell(185, 4, text). You MUST pass an explicit width (185) to multi_cell after cell(), otherwise multi_cell gets 0 remaining width and throws "Not enough horizontal space" error. Never use multi_cell(0, ...) after a cell() on the same line.

## reports/chart_utils.py -- Shared Chart Generation

- price_chart(df, ticker, company_name): 1-year price history with 50/200 SMAs. Returns saved path.
- revenue_margin_chart(years, revenues, gross_margins, op_margins, net_margins, ticker): Bar+line combo chart. Returns saved path.
- segment_chart(segments_dict, ticker): Grouped bar chart from {year: {segment: value}} dict. Returns saved path.
- peer_valuation_chart(peers_dict, ticker): 3-panel bar chart (Fwd P/E, EV/EBITDA, P/S). peers_dict = {ticker: {fwd_pe, ev_ebitda, ps}}. Subject ticker highlighted in red. Returns saved path.
- All charts saved to reports/charts/ at 150 DPI.
- Usage: from chart_utils import price_chart, revenue_margin_chart, segment_chart, peer_valuation_chart

## reports/excel_base.py -- Shared Excel Styling

- Style constants: NAVY_FILL, WHITE_FONT, HEADER_FONT, INPUT_FILL, LIGHT_GRAY, GREEN_FILL, RED_FILL, THIN_BORDER, INPUT_BORDER, THICK_BORDER
- style_header_row(ws, row, max_col): Navy header with white bold text
- style_data_cell(ws, row, col, fmt, is_input, shaded): Applies borders, fills, number format
- auto_width(ws): Auto-sizes all columns
- write_section_header(ws, row, col, text): Section label in navy bold
- write_table(ws, start_row, headers, rows, col_formats, highlight_row): Complete table with header + data rows
- Usage: from excel_base import *

## reports/data_utils.py -- Data Pulling & Validation

- pull_stock_data(ticker, retries=2): Pulls all yfinance data with retry logic. Returns dict with all metrics, formatted strings (market_cap_str, range_52w, analyst_consensus), and raw DataFrames (financials, balance_sheet, cashflow, quarterly_financials, history_1y).
- pull_peer_data(tickers): Pulls key metrics for a list of peer tickers. Returns dict of dicts.
- validate_data(data): Checks for common data issues (zero price, negative P/E, missing history). Returns list of warning strings.
- fmt_val(val, fmt_type, fallback): Format a value for display. Types: "pct", "pct_change", "ratio", "dollar", "dollar_b", "market_cap".
- Usage: from data_utils import pull_stock_data, pull_peer_data, validate_data, fmt_val

## reports/generate_report.py -- Single Entry Point CLI

- Usage: python reports/generate_report.py TICKER --peers PEER1,PEER2,PEER3
- Runs the data pipeline: pulls subject + peer data, validates, generates price + peer charts
- Outputs a data summary and tells you which ticker-specific scripts to create/run next
- Revenue/margin and segment charts require manual historical data (yfinance only provides trailing 4 years, segment data requires 10-K parsing)

## Workflow for Adding a New Ticker

1. Run: python reports/generate_report.py TICKER --peers PEER1,PEER2
2. Create reports/generate_{ticker}_pdf.py -- imports ResearchReport from report_base, chart paths from chart_utils
3. Create reports/generate_{ticker}_dcf.py -- imports excel_base helpers, uses Excel formulas (not hardcoded values)
4. Run both scripts to generate the PDF and Excel model
5. Present both files to the user

## Data Validation Rules

- Always call validate_data() after pulling data and print warnings
- Negative trailing P/E means the company is unprofitable -- flag it, don't hide it
- If yfinance returns None for a metric, display "N/A" in the report, never 0 or a guess
- Cross-reference key financials (revenue, net income) between yfinance and SEC filings when possible
- If a peer ticker fails to pull data, include it in the table with "N/A" values rather than silently dropping it

## Peer Data -- Always Pull from yfinance

- Never hardcode peer metrics -- always pull from yfinance via pull_peer_data() so data is current
- Pull at least 4 peers in the same sector/industry
- Common peer sets: Tech (AAPL/MSFT/GOOG/AMZN/META), Semis (NVDA/AMD/AVGO/QCOM/INTC), Auto (TSLA/GM/F/TM/RIVN)
- For the comparable companies Excel sheet, use formulas for the median row: =MEDIAN(C5:C10)

# PDF Research Report: Charts, Structure, fpdf2, and Styling

Read this before generating charts or writing the PDF generation script (Build Order steps 1 and 2): it holds the chart example, the required report structure, fpdf2 sample code, text encoding, layout fixes, and styling standards.

## Chart Generation Example (matplotlib)

Generate all charts first -- these will be embedded in the PDF. Save as PNG at 150+ DPI to reports/charts/. Generate at least 4 charts: price history with SMAs, revenue/margin trends, peer valuation comparison, and one more relevant to the thesis.

```python
import matplotlib.pyplot as plt
import yfinance as yf

df = yf.Ticker("AAPL").history(period="1y")
fig, ax = plt.subplots(figsize=(10, 5))
ax.plot(df.index, df['Close'], label='Price', color='#1a1a2e')
ax.plot(df.index, df['Close'].rolling(50).mean(), label='50 SMA', color='#e94560', linestyle='--')
ax.plot(df.index, df['Close'].rolling(200).mean(), label='200 SMA', color='#0f3460', linestyle='--')
ax.set_title("AAPL - 1 Year Price History")
ax.legend()
ax.grid(alpha=0.3)
fig.savefig("reports/charts/price_chart.png", dpi=150, bbox_inches='tight')
```

## PDF Report -- Professional Research Report (Sell-Side Format)

The PDF should look like a sell-side initiation note from Goldman, Morgan Stanley, or JP Morgan. This is the primary deliverable -- invest the most effort here.

### Report Structure

Page 1 -- Cover / Executive Summary:

- Disclaimer line (required): "This report is for informational purposes only and does not constitute investment advice. It is not a recommendation to buy, sell, or hold any security."
- Company name, ticker, exchange, current price, market cap
- Rating: Buy / Hold / Sell with price target and upside/downside %
- Investment thesis in 3-4 bullet points (the "elevator pitch")
- Key metrics snapshot: P/E, EV/EBITDA, revenue growth, FCF yield
- A 1-year price chart (generated via matplotlib, embedded as image)
- Investor Profile box (only if profile was collected): Show risk tolerance, time horizon, and income preference in a small summary box

Pages 2-3 -- Investment Thesis:

- Bull case (with probability weighting if possible)
- Bear case (required -- what kills this trade?)
- Key catalysts with expected timeline
- Competitive positioning / moat analysis

Pages 3-4 -- Financial Analysis:

- Revenue breakdown by segment (with a stacked bar chart)
- Margin trends over 4+ quarters (with a line chart)
- FCF bridge / waterfall
- Balance sheet health (debt maturity, liquidity)
- Peer comparison table (pulled from yfinance for 3-5 peers)

Page 5 -- Valuation:

- DCF model summary (show assumptions: WACC, terminal growth, revenue CAGR)
- Comparable company analysis table
- Historical valuation range (P/E or EV/EBITDA band chart)
- Price target derivation

Page 6 -- Technical Analysis:

- Price chart with 50/200 SMA overlay (generated via matplotlib)
- Volume analysis
- Key support/resistance levels
- RSI chart

Page 7 -- Risks:

- Ranked by probability x impact
- Regulatory, competitive, execution, macro risks
- Specific to this company, not generic boilerplate

Final Page -- Sources & Disclaimer:

- Full citation list with dates for every external source referenced
- Full disclaimer (required -- use the exact text from the "Limitations & Disclaimer" section of SKILL.md)
- If investor profile was collected, include a closing note: "This analysis was tailored to a [risk tolerance] risk profile with a [time horizon] time horizon. Your actual circumstances may differ. Consult a licensed financial advisor before making investment decisions."

## PDF Generation with fpdf2

Use fpdf2 (Python) to generate the PDF. Install: pip install fpdf2.

```python
from fpdf import FPDF

class ResearchReport(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "B", 8)
        self.set_text_color(0, 51, 102)
        self.cell(0, 6, "Company (TICKER) | Equity Research Report", align="L")
        self.cell(0, 6, "Report Date", align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(0, 51, 102)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(2)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 7)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def ensure_space(self, needed_mm):
        """Check if needed_mm of vertical space remains on the current page.
        If not, insert a page break. Call this before any section that has a
        title + table/chart combo to prevent them from splitting across pages."""
        if self.get_y() + needed_mm > self.h - self.b_margin:
            self.add_page()

pdf = ResearchReport()
pdf.alias_nb_pages()
pdf.set_auto_page_break(auto=True, margin=15)
pdf.add_page()

# Title
pdf.set_font("Helvetica", "B", 24)
pdf.cell(0, 12, "Company Analysis", ln=True)

# Embed chart (w=160, NOT 190 -- see chart sizing notes below)
pdf.image("reports/charts/price_chart.png", x=15, w=160)

pdf.output("reports/Research_Report.pdf")
```

### Critical: Text Encoding for fpdf2

fpdf2 uses latin-1 encoding by default. Special Unicode characters will cause errors or render as garbage. Before writing any text to the PDF, sanitize it:

```python
def sanitize_text(text):
    replacements = {
        "\u2014": "-",    # em-dash
        "\u2013": "-",    # en-dash
        "\u2018": "'",    # left single quote
        "\u2019": "'",    # right single quote
        "\u201c": '"',    # left double quote
        "\u201d": '"',    # right double quote
        "\u2022": "*",    # bullet
        "\u2026": "...",  # ellipsis
        "\u00a0": " ",    # non-breaking space
        "\u2212": "-",    # minus sign
        "\u00b7": "*",    # middle dot
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    return text.encode("latin-1", errors="replace").decode("latin-1")
```

Apply sanitize_text() to every string before passing it to pdf.cell(), pdf.multi_cell(), or pdf.write(). This is not optional -- text from web scraping, yfinance, and deep research will contain Unicode characters that break the PDF.

### Avoiding Common fpdf2 Issues

- Chart sizing -- DO NOT use w=190 (full page width): Charts generated by matplotlib at 150 DPI are typically 1500-1700px wide and 800-1000px tall. At w=190mm, fpdf2 scales them proportionally, producing chart heights of 90-130mm -- nearly half an A4 page. This pushes the chart to the next page, leaving a large white gap below the section title. Use w=160 (centered with x=15) as the default chart width. This keeps charts at ~75-110mm tall, which fits comfortably on a page alongside a title and surrounding content.
- Section splitting across pages: fpdf2's auto page break only triggers when content would overflow -- it does NOT keep a section title together with its table or chart. A subtitle at y=270 will render on the current page, but the table below it starts on the next page, leaving the title orphaned. To prevent this, implement an ensure_space(needed_mm) method (see sample code above) and call it before every subtitle+table or subtitle+chart combo. Estimate the needed space: title (~7mm) + table header (~6mm) + rows (5mm each) + body text if any. For charts, use ~80mm. For tables with 5-8 rows, use ~50-55mm.
- Spacing discipline: Use tight spacing throughout. Recommended values: ln(0.5) after subtitles, ln(1) between sections, ln(1.5) between major sections. Avoid ln(3) or higher -- it adds up fast across a multi-page report. Body text line height should be 4mm, bullet line height 4mm, table rows 5mm, table headers 6mm. These small values compound: a report with 20 sections saves 40-60mm of vertical space vs. generous spacing, which is nearly an entire extra page of content.
- Auto page break margin: Use margin=15, not margin=20. The default 20mm wastes 5mm per page (45mm across a 9-page report). 15mm provides enough room for the footer without wasting space.
- Long text overflow: Use multi_cell() for paragraphs, not cell(). cell() truncates at one line.
- Table column overflow: cell() does NOT clip or wrap text -- it renders beyond the cell boundary, causing text to overflow into adjacent columns or off the page. For tables with a wide text column (like "Details" in a risk matrix), allocate most of the width to that column. Example: [45, 24, 24, 97] instead of [55, 27, 27, 81]. Also shorten text strings to fit: abbreviate "Medium" to "Med", truncate long names ("Valuation Compression" -> "Valuation Compress."), and tighten phrasing. At 8pt Helvetica, a 97mm column fits roughly 50-55 characters. Test visually and shorten any string that overflows.
- Table alignment: Right-align numbers, left-align text. Use cell() with explicit widths for table columns.
- Font availability: Stick to built-in fonts: Helvetica, Times, Courier. These require no font file embedding. If you need bold/italic, use the style parameter: set_font("Helvetica", "B", 12).

## Styling Guidelines

- Header bar on each page (except cover) with company name, ticker, report date, and page number
- Data tables with alternating row shading, right-aligned numbers, 8pt font, 5mm row height
- Charts at w=160 (not full width) centered with x=15, with clear titles and axis labels
- Callout boxes for key insights ("Management guided 15% revenue growth in Q4 call")
- Source citations as footnotes or inline parenthetical references
- Professional typography: 9pt body text (4mm line height), 8pt table text (5mm row height), 10pt subtitles, 13pt section headers. Keep spacing tight -- ln(0.5) to ln(1.5) between elements, never ln(3) or higher.
- Color palette: Navy (#003366) for headers, dark gray (#333333) for body text, green (#228B22) for positive metrics, red (#CC0000) for negative metrics
- Page density: Aim for dense, information-rich pages with minimal white space. Every page should feel full. If a page has more than 40mm of unused space at the bottom, either pull the next section up (by removing the forced add_page()) or increase chart/table sizes to fill the space.
- Avoid forced page breaks between sections: Do NOT use add_page() between every section. This creates large white gaps when the previous section ends partway down the page. Instead, let content flow continuously and use ensure_space(needed_mm) to trigger a page break only when there isn't enough room for the next section's title + content. Only use add_page() for truly standalone sections (e.g., cover page, disclaimer page). For everything else -- financial tables, charts, risk matrices, catalysts -- let them flow naturally with ensure_space() guarding against orphaned titles.

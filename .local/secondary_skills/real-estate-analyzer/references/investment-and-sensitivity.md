# Steps 4-5: Investment, Sensitivity, and Breakeven Analysis

## Step 4: Investment Analysis — Run the Numbers

**All investment calculations must use the asking price (or confirmed purchase price), not algorithm estimates.** If the property is off-market, use the estimated value but label it clearly.

### Quick-filter rules (kill deals fast)

- **1% rule**: monthly rent ≥ 1% of purchase price. Dead in coastal/HCOL markets — there, 0.5-0.7% is realistic and you're betting on appreciation, not cash flow.
- **50% rule**: operating expenses (NOT mortgage) eat ~50% of gross rent. Vacancy + repairs + management + taxes + insurance + capex reserve. Beginners always underestimate this.
- **70% rule (flips/BRRRR)**: max offer = (ARV × 0.70) − rehab cost. ARV = after-repair value from renovated comps.

### Full underwriting (build in Python)

```text
Gross rent (use Rentometer or Zillow ZORI for the ZIP)
− Vacancy (5-8% typical; 10% conservative)
− Property management (8-10% of collected rent)
− Repairs/maintenance (~8% of rent)
− CapEx reserve (~5% — roof/HVAC/water heater sinking fund)
− Taxes + insurance
= NOI (Net Operating Income)

Cap rate = NOI / purchase price
→ <4%: you're buying appreciation, not cash flow
→ 4-6%: typical for A/B-class in growth metros
→ 6-8%: solid cash flow, B/C-class
→ >10%: either a great deal or a war zone — verify crime data

NOI − annual debt service (P+I) = annual cash flow
Cash-on-cash = annual cash flow / total cash in (down pmt + closing + rehab)
→ Target 8%+ CoC. Below that, an index fund wins with zero tenants.
```

### DSCR (what lenders check for investment loans)

- DSCR = NOI / annual debt service. Lenders want ≥1.20-1.25× (2025 standard). <1.0 means rent doesn't cover the mortgage.
- DSCR loans (2025): ~6.5-7.5% rate, qualify on property income not W-2, typical max 75% LTV. How investors scale past 10 conventional mortgages.

**BRRRR stack**: Buy distressed (hard money, 7-14 day close) → Rehab → Rent → Refinance at 75% of new ARV into DSCR loan → pull most capital out → Repeat. Only works if `ARV × 0.75 ≥ purchase + rehab + holding costs`.

**Rent comps:** webSearch Rentometer free tier, or pull Zillow rentals for the ZIP and compute median $/sqft for same bed count.

## Step 5: Sensitivity Analysis & Breakeven Returns

Always include sensitivity analysis in every property report. This section stress-tests the investment under multiple scenarios and identifies the exact breakeven thresholds where the deal flips from loss to gain.

**All scenarios must use the asking price as the anchor point.** The sensitivity matrix should include the asking price as one of the columns, with discount scenarios below it and premium scenarios above if relevant.

### Three-Scenario Comparison (required)

Model three scenarios side-by-side — Base Case, Stressed, and Worst Case. Vary the following inputs across scenarios:

| Input | Base Case | Stressed | Worst Case |
|---|---|---|---|
| Monthly Rent | Market median | 5-10% below median | 15-20% below median |
| Vacancy Rate | 8% | 10% | 12% |
| Repairs/Maintenance | 8% of gross rent | 10% | 12% |
| CapEx Reserve | 5% | 5% | 6% |
| Tax + Insurance | Current estimates | +10% increase | +20% increase |
| HOA (if applicable) | Current | +8% increase | +15% increase |

For each scenario, compute and display:

- Effective Gross Income
- Total Operating Expenses
- Net Operating Income (NOI)
- Cap Rate
- Annual Cash Flow (after debt service)
- Cash-on-Cash Return
- DSCR

### Breakeven Analysis (required)

Compute and present these breakeven thresholds:

```text
Breakeven Rent = monthly rent needed for $0 annual cash flow
→ Formula: (annual_debt_service + fixed_opex) / ((1 - vacancy) * (1 - mgmt_pct) * 12 - variable_opex_pct * 12)
→ Compare to current market rent and show the gap

Rent for 8% Cash-on-Cash = monthly rent needed for target CoC return
→ target_cash_flow = 0.08 * total_cash_invested
→ target_NOI = target_cash_flow + annual_debt_service
→ solve for rent using same formula

Breakeven Purchase Price = price at which cap rate hits 4% and 5%
→ price_at_5pct_cap = NOI / 0.05
→ price_at_4pct_cap = NOI / 0.04
→ show discount needed from asking price

Breakeven Mortgage Rate = rate at which NOI covers debt service
→ iterate rates from 1% to 10% in 0.1% steps
→ find rate where annual P&I ≤ NOI

Annual Appreciation Needed = appreciation rate to offset annual cash losses
→ (total_annual_costs - effective_rental_income) / purchase_price
→ compare to local long-term average appreciation (typically 3-6%)
```

### Sensitivity Matrix (required)

Build a rent vs. purchase price grid showing monthly cash flow at each intersection. Use 4-6 rent levels (from below-market to well-above-market) and 3-4 purchase prices. **The asking price must be one of the columns.** Include discount scenarios (e.g., 5% and 10% below asking) and at least one below-market price to show where the deal starts working. Color-code: green = positive cash flow, red = negative.

Example structure (for a $629K asking price):

```text
            $500K   $565K   $600K   $629K
$3,800/mo   -$XXX   -$XXX   -$XXX   -$XXX
$4,200/mo   -$XXX   -$XXX   -$XXX   -$XXX
$4,600/mo   +$XXX   -$XXX   -$XXX   -$XXX
$5,000/mo   +$XXX   +$XXX   -$XXX   -$XXX
$5,500/mo   +$XXX   +$XXX   +$XXX   -$XXX
$6,500/mo   +$XXX   +$XXX   +$XXX   +$XXX
```

### Key Takeaway (required)

Summarize what the sensitivity analysis reveals — how far current conditions are from breakeven, whether any realistic combination of rent and price produces positive returns, and what would need to change for the deal to work.

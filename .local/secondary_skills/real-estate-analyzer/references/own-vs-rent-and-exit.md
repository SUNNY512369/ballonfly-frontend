# Steps 6-7: Own vs. Rent and Exit Scenario Modeling

## Step 6: Own vs. Rent Comparison

Always include an own-vs-rent comparison when analyzing a property the user might live in (not purely investment). Even for investment properties, this section helps frame the decision for potential tenants.

### Monthly cost comparison (required)

Build a side-by-side table:

```text
                          Own          Rent Equivalent
Mortgage (P&I)            $X,XXX       —
Property Tax              $XXX         —
Homeowners Insurance      $XXX         —
HOA / Condo Fee           $X,XXX       —
Flood Insurance           $XXX         —
Maintenance Reserve       $XXX         —
Monthly Rent              —            $X,XXX
Renter's Insurance        —            $XX
─────────────────────────────────────────────────
Total Monthly Cost        $X,XXX       $X,XXX
Monthly Delta (Own - Rent)    +$X,XXX / -$X,XXX
```

Use the market-rate rent for a comparable unit in the same building or neighborhood (same beds/baths/sqft). Source from Zillow/Rentometer rent comps.

### Equity build vs. opportunity cost (required)

The monthly payment difference isn't the whole story. Model two parallel paths over 5, 10, and 30 years:

```text
Path A — Buy:
- Home equity built (principal paydown from amortization schedule)
- Home appreciation (model at 3%, 5%, and local historical average)
- Tax benefits: mortgage interest deduction + property tax deduction (up to $10K SALT cap)
- Minus: closing costs at purchase (~3-5% of price)
- Minus: selling costs at exit (~5-6% of sale price)
- Minus: maintenance and repair costs over holding period (1-2% of value/year)

Path B — Rent + Invest the Difference:
- Take the difference: (down_payment + closing_costs) + (monthly_own - monthly_rent) each month
- Invest in a diversified index fund at 7% real return (10% nominal - 3% inflation)
- No selling costs, no maintenance, no property tax
- Minus: rent increases (model at 3-4% annual growth)
```

### Breakeven timeline (required)

Compute the crossover point — the number of years at which Path A's total wealth exceeds Path B's total wealth. Present for multiple appreciation scenarios:

```text
Appreciation Rate     Breakeven Year   Notes
2% (pessimistic)      XX years         Renting wins for most hold periods
3% (national avg)     XX years         Breakeven in mid-range
5% (growth market)    XX years         Buying wins after X years
Local historical      XX years         Based on ZIP-level ZHVI data
```

If the breakeven exceeds 10 years or never occurs at realistic appreciation, state this clearly: "At current prices and rates, renting and investing the difference outperforms buying for any hold period under X years."

### Key output line (always include in the verdict)

> "Owning costs $X,XXX/month more than renting an equivalent unit. To justify buying, you need the property to appreciate at X.X% annually — [above/below/in line with] the local historical average of X.X%."

## Step 7: Exit Scenario Modeling

Always include exit scenarios in every property report. Buyers need to understand their actual financial outcome when they sell — not just the monthly cash flow while they hold.

**Model exit at 3, 5, 7, and 10 years from purchase.** For each exit horizon, compute the complete financial picture:

```text
For each year (3, 5, 7, 10):

Projected Sale Price = purchase_price × (1 + annual_appreciation)^years
→ Model at three appreciation rates: pessimistic (2%), base (3-4%), optimistic (5-6%)
→ Use local ZIP-level ZHVI historical average as the "base" rate

Selling Costs = projected_sale_price × 5.5%
→ Agent commissions (2.5-3% buyer + 2.5-3% seller, post-NAR settlement)
→ Closing costs (title, transfer tax, doc stamps — varies by state)
→ Florida doc stamps: $0.70 per $100 of sale price (seller pays)

Remaining Loan Balance = compute from amortization schedule at month (years × 12)
→ Use the standard amortization formula, not an estimate

Net Proceeds = projected_sale_price - selling_costs - remaining_loan_balance

Total Cash Invested = down_payment + closing_costs_at_purchase + cumulative_negative_cash_flow (if investment)
→ For primary residence: down_payment + closing_costs + (monthly_own - monthly_rent) × months

Total Return = net_proceeds - total_cash_invested

Annualized ROI = ((net_proceeds / total_cash_invested)^(1/years) - 1) × 100
```

### Present as a table (required)

```text
Exit Scenario: 3% Annual Appreciation

                 Year 3       Year 5       Year 7       Year 10
Sale Price       $XXX,XXX     $XXX,XXX     $XXX,XXX     $XXX,XXX
Selling Costs    -$XX,XXX     -$XX,XXX     -$XX,XXX     -$XX,XXX
Loan Balance     -$XXX,XXX    -$XXX,XXX    -$XXX,XXX    -$XXX,XXX
Net Proceeds     $XX,XXX      $XX,XXX      $XX,XXX      $XX,XXX
Total Invested   $XXX,XXX     $XXX,XXX     $XXX,XXX     $XXX,XXX
Profit/Loss      +/-$XX,XXX   +/-$XX,XXX   +/-$XX,XXX   +/-$XX,XXX
Annualized ROI   X.X%         X.X%         X.X%         X.X%
```

Generate this table for at least two appreciation rates (pessimistic and base case). If the property is negative cash flow, include the cumulative cash flow loss as part of total cash invested.

### Breakeven hold period (required)

For each appreciation scenario, compute the minimum number of years the buyer must hold before net proceeds exceed total cash invested (including selling costs). State clearly:

> "At 3% appreciation, you need to hold at least X years to break even after selling costs. At 2% appreciation, you would lose $XX,XXX even after holding 10 years."

### Early exit risk (flag if applicable)

If the breakeven hold period exceeds 5 years, flag this as a risk: the buyer is locked in. Job loss, divorce, relocation, or market downturns within the breakeven window result in a realized loss. This is especially relevant for condos in volatile markets.

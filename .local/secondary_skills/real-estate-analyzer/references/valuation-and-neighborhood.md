# Steps 2-3: Valuation and Neighborhood Analysis

## Step 2: Valuation Analysis

### Pull comps — specific sources

- `webFetch` Redfin sold filter: `redfin.com/city/{id}/filter/include=sold-6mo` — recently sold within 0.5mi, ±20% sqft, same beds
- Zillow Research (`zillow.com/research/data/`) — free CSV downloads of ZHVI (home value index) and ZORI (rent index) by ZIP, monthly back to 1996
- County assessor website — webSearch `"{county name} property assessor {address}"` for tax-assessed value, last sale price, permit history. Assessed value is typically 70-90% of market value.
- Adjust comps: ±$15-40/sqft for size delta, ±$5-15k per bedroom, ±10-20% for condition

**Always compare asking price to estimated fair value.** Present both side-by-side:

- Asking price and $/sqft
- Comp-derived fair value and $/sqft
- Percentage difference (overpriced / underpriced / fairly priced)
- Automated estimates (Zestimate, Redfin Estimate) as secondary reference points

### Affordability math (compute, don't estimate)

```python
# PITI at 30yr fixed — webSearch current rates (use Freddie Mac PMMS)
# PMMS reports percentage (e.g. 6.76), so divide by 100 first
P, r, n = loan_amount, annual_rate/100/12, 360
monthly_PI = P * (r*(1+r)**n) / ((1+r)**n - 1)
# + property tax (county rate × assessed value / 12)
# + homeowners insurance (~$150-250/mo, varies wildly by state)
# + PMI if <20% down (~0.5-1.0% of loan/yr)
```

- 28/36 rule: PITI <28% gross income, total debt <36%. Lenders stretch to 43% DTI — don't.
- Closing costs: 2-5% of purchase. Maintenance reserve: 1-2% of home value/yr.

## Step 3: Neighborhood Analysis

### webSearch/webFetch targets (name the source, don't be vague)

- Schools: `greatschools.org/{state}/{city}` — rating ≥7 protects resale value even if user has no kids
- Crime: `crimemapping.com` or `spotcrime.com/{city}` — check 6-month trend, not just snapshot. NeighborhoodScout for demographic overlay.
- Walk/Transit/Bike Score: `walkscore.com/score/{address}`
- Flood: `msc.fema.gov/portal/search` — Zone A/AE/V = mandatory flood insurance ($400-3,000+/yr, often kills deals)
- Market velocity: Redfin Data Center — median DOM, sale-to-list ratio, months of supply. <3 months supply = seller's market.
- Future development: webSearch `"{city} planning commission agenda"` + `"{city} zoning map"` — a highway expansion or apartment rezoning next door changes everything

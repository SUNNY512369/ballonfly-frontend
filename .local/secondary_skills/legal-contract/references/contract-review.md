# Contract Review

Run every review in this order: grep the red-flag phrases, run the playbook checks for the document type, then write the result in the Review Output Format. Reviews are commentary delivered as text, not PDF/DOCX documents.

## Red-Flag Language to Grep For

When reviewing, search the document text for these exact phrases — each is a known risk pattern:

| Phrase | Why it's dangerous | Suggested fix |
|--------|-------------------|---------------|
| `"any and all claims"` | Unlimited indemnity scope | "claims arising directly from [Party]'s breach of Section X" |
| `"indemnify, defend, and hold harmless"` | "Hold harmless" blocks your counterclaims even if they caused the loss | Strike "and hold harmless"; keep "indemnify and defend" |
| `"sole discretion"` / `"absolute discretion"` | One party can act arbitrarily (block settlements, reject deliverables) | "consent not to be unreasonably withheld, conditioned, or delayed" |
| `"including but not limited to"` in IP assignment | Open-ended IP grab beyond deliverables | Enumerate specific deliverables; add "excluding pre-existing IP" |
| No liability cap stated | Courts default to **unlimited** liability | "Aggregate liability capped at fees paid in the 12 months preceding the claim" |
| `"time is of the essence"` | Any delay = material breach | Delete, or limit to payment obligations only |
| Indemnity **carved out** of liability cap | Your cap doesn't protect you where exposure is highest | "Indemnification obligations are subject to the cap in Section X" |
| Auto-renewal with <30-day opt-out window | Easy to miss; locked in another term | 60–90 day notice window; email notice permitted |
| `"perpetual"` + `"irrevocable"` license | Can never be revoked even after breach | Term-limited; terminable on material breach |

**Indemnity forms (escalating risk):** *Limited* = you cover only your own negligence. *Intermediate* = everything except their sole negligence. *Broad* = you cover losses **even when caused entirely by them**. Flag intermediate and broad as Critical.

## Playbook Checks (What Harvey/Spellbook Actually Run)

AI contract tools run a fixed checklist per document type. For a **Service Agreement** run these checks and grade each Pass/Flag/Missing:

1. Is there a liability cap? Is it mutual? Is it tied to fees paid (1x, 2x)?
2. Is indemnity mutual or one-way? Subject to the cap or carved out?
3. Does IP assignment exclude contractor's pre-existing tools/libraries?
4. Is there a cure period (typically 30 days) before termination for breach?
5. Are "consequential damages" (lost profits, lost data) excluded? Mutually?
6. Payment terms: Net 30 or better? Late fee specified?
7. Can the client terminate for convenience? If so, is there a kill fee?
8. Governing law + venue: neutral, or the other party's home court?

For a **Letter of Intent** run these checks:

1. Are binding vs. non-binding sections clearly identified?
2. Is there an exclusivity/no-shop clause? Is it binding?
3. Is the purchase price clearly stated with payment structure?
4. Is the due diligence period defined with access rights?
5. Are conditions to closing enumerated?
6. Is there a confidentiality obligation (binding)?
7. Does the LOI have an expiration date?
8. If there's an earnout, are the metrics and measurement methodology specified (or deferred to the definitive agreement)?

## Review Output Format

```text
# Contract Review: [Document Type]

**NOT LEGAL ADVICE — for informational purposes only. Consult an attorney before signing.**

## Summary
[2–3 sentences: what this is, who it favors, biggest concern]

## Critical — Do Not Sign Without Addressing
1. **[Clause §X.Y]**: [quote the exact language]
   - **Risk**: [plain English]
   - **Suggested redline**: "[replacement text]"

## Warnings — Negotiate If You Have Leverage

## Notes — Standard But Be Aware

## Missing Protections
[clauses that should be here but aren't — e.g., no liability cap, no cure period]

## Overall: [Fair / Favors Counterparty / Consult Attorney Before Signing]
```

For **reviews** (not drafting), output the review analysis directly as text using this format. Do not generate PDF/DOCX for reviews — the review is commentary, not a document.

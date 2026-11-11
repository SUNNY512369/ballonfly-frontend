# Required fields by jurisdiction, numbering, and payment terms

Read this once you know where the seller is based, and before you fill in the tax lines, invoice number, or payment terms.

## Required fields by jurisdiction

### EU (VAT Directive 2006/112/EC, Article 226) — legally mandatory

- Sequential invoice number (gaps must be documented — auditors **will** assess VAT on missing numbers)
- Invoice date + date of supply (if different)
- Seller's full name, address, and **VAT number**
- Customer's name and address (and VAT number if B2B)
- Description of goods/services, quantity/extent
- Unit price excluding VAT, VAT rate per line, VAT amount **in the member state's currency** (even if invoice is in USD)
- **Reverse charge:** if selling B2B cross-border within EU, charge 0% VAT and add the notation `"Reverse charge — VAT to be accounted for by the recipient (Art. 196, Directive 2006/112/EC)"`. Include the customer's VAT number (validate via VIES).

**US — no federal invoice law.** Sequential numbering is best practice (IRS wants unique IDs for audit trail) but not legally required. Sales tax rules vary by state; many services are untaxed.

**Other jurisdictions:** Always ask the user which country they operate in before assuming a tax regime. Key questions: Is the tax called VAT, GST, HST, sales tax, or something else? What is the rate? Are digital services exempt or taxable? If exempt, label the tax line clearly (e.g., `VAT — Exempt` or the local equivalent) with `$0.00` rather than omitting the line entirely — omitting it looks like you forgot, whereas labeling it exempt looks intentional and professional.

**Numbering scheme:** `{PREFIX}-{YYYY}-{SEQ:04d}` e.g. `NiDO-2026-0042`. Prefix can distinguish clients or entities. Never reuse or skip; if you void one, keep the voided record.

## Payment terms glossary

| Term | Meaning | Typical use |
|------|---------|-------------|
| Due on receipt | Pay immediately | Small amounts, new clients |
| Net 30 | Due 30 days from invoice date | Standard B2B |
| Net 60 / Net 90 | 60/90 days | Large enterprise (push back on this) |
| 2/10 Net 30 | 2% discount if paid in 10 days, else full in 30 | Incentivize fast payment |
| EOM | Due end of month | |
| 1.5% monthly late fee | Compounds on overdue balance | Check local usury caps — often ~18% APR max |

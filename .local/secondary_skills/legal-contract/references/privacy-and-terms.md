# Privacy Policy & Terms of Service (Web Apps / SaaS)

Privacy Policies and Terms of Service are among the most common legal documents a web app needs. They are not contracts between two parties — they are public-facing declarations. Treat them as a separate document type from the contract/NDA/LOI workflow.

## Key questions to ask before drafting

1. **Legal entity name** — Always ask for the exact registered legal name separately from the brand name. The brand is what users see ("NiDO"); the legal entity is what appears in formal documents ("NiDO Finanzas S.A.S."). Never assume they are the same.
2. **Country of incorporation** — Determines which data protection law applies (GDPR for EU, LGPD for Brazil, Ley 172-13 for Dominican Republic, CCPA for California, etc.).
3. **What data is collected** — Account info (name, email), financial/transactional data, uploaded files, usage/analytics?
4. **Third-party data processors** — Ask the user to enumerate every service that touches user data: auth provider, database host, AI/ML services, payment processor, analytics, email provider, CDN. Each must be disclosed in the Privacy Policy.
5. **Are there paid plans?** — If yes, the Terms must cover payment terms, auto-renewal, cancellation, and refund policy.
6. **Minimum age** — Typically 18 for financial apps, 13 for general consumer apps.
7. **Contact email for privacy/legal** — Often different from the support email. Ask explicitly.

## Third-party processor disclosure pattern

For every integration the app uses, include a line in the Privacy Policy. Format:

```text
- **[Provider] ([function]):** [What they receive and why]. [Link to their privacy policy if possible.]
```

Example:

```text
- **Neon (base de datos):** almacenamiento seguro de sus datos financieros en servidores PostgreSQL.
- **Google Gemini (IA):** genera categorías y análisis. Solo recibe descripciones de transacciones; nunca datos personales identificables.
- **Stripe (pagos):** procesa pagos con tarjeta. NiDO no almacena datos de tarjetas.
- **Replit Auth (autenticación):** gestiona el inicio de sesión vía Google/GitHub.
```

If the app uses analytics, advertising pixels, or session recording (Hotjar, FullStory, etc.), these MUST be disclosed and typically require explicit consent in GDPR jurisdictions.

## Privacy Policy required sections

1. Who we are (legal entity name, contact email for privacy)
2. What data we collect (account info, user-generated data, uploaded files, usage logs)
3. How we use it (provide service, personalization, legal compliance)
4. Third-party processors (enumerate all — see above)
5. Data storage and security (encryption at rest/in transit, access controls)
6. User rights (access, correction, deletion, export)
7. Cookies (session-only vs. tracking; consent requirements if in GDPR territory)
8. Minors (minimum age, what happens if a minor's data is discovered)
9. Changes to the policy (notice method and timing — typically 15–30 days)
10. Governing law (jurisdiction's data protection statute)

## Terms of Service required sections

1. Acceptance (clicking/using = agreement)
2. Service description (what it does and does NOT do)
3. Account registration (age requirement, accurate info, responsibility for activity)
4. Acceptable use (prohibited behaviors: fraud, scraping, reverse engineering, illegal activity)
5. **Financial/medical disclaimer** — if the app gives any advice-like output (budget suggestions, AI analysis), include an explicit "not financial/legal/medical advice" clause
6. User data ownership (user owns their data; limited license to operator to run the service)
7. Payments (if applicable: billing cycle, auto-renewal, cancellation, refunds, payment processor)
8. Service availability (no uptime guarantee unless SLA offered)
9. Limitation of liability (cap at fees paid in last 12 months or a fixed floor like $100)
10. IP ownership (brand, code, design belong to the operator)
11. Termination (user can delete account; operator can suspend for violations; data deletion timeline)
12. Changes to terms (notice period — typically 15 days for material changes)
13. Governing law and jurisdiction

## Delivery format for web apps — routed pages, not PDFs

For web apps, the best delivery format for Privacy Policy and Terms of Service is **routed pages within the app itself**, not PDFs or DOCX files. This is the standard for all modern SaaS products.

### Pattern

- Create `client/src/pages/Privacy.tsx` and `client/src/pages/Terms.tsx`
- Register them as **public routes** — accessible without authentication. Place the route check **before** the auth loading state in `AppContent`:

```tsx
function AppContent() {
  const { isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Public legal pages — always accessible, no auth required
  if (location === "/privacidad") return <Privacy />;
  if (location === "/terminos") return <Terms />;

  // Auth guard below
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? <AuthenticatedLayout /> : <Landing />;
}
```

### Page layout pattern

- Minimal header: logo + "Back to home" link
- Amber disclaimer banner at the top: *"Este documento es una plantilla informativa y no constituye asesoramiento legal."*
- Clean `max-w-3xl mx-auto` prose layout, `text-sm leading-relaxed`
- Footer with cross-links: Privacy ↔ Terms ↔ Contact ↔ Home
- No sidebar, no app navigation — these are public documents

**After creating the pages, always update the footer links** in the landing page or marketing page. Footer links that point to `href="#"` are broken. Replace with `href="/privacidad"` and `href="/terminos"`, and change the "Contact" link to `mailto:` rather than another dead hash.

**Consistency check after any company name change:** If the user changes the legal entity name, search ALL files — not just the legal pages. Invoice templates, billing pages, and email footers often also contain the company name and will need updating too.

## Disclaimer banner (always include on the rendered page)

Every rendered legal page should display a visible disclaimer. Do not only warn the user in chat — put it on the page itself:

```tsx
<div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-4 py-3 mb-10 text-sm text-amber-800 dark:text-amber-300">
  Este documento es una plantilla informativa y no constituye asesoramiento legal.
  Consulte un abogado calificado para asuntos legales específicos.
</div>
```

# Internationalization and Locale Handling

Read this before adding locale variants, translated pages, or hreflang tags to a page set.

Only add multilingual pSEO when you have **genuinely translated data** — not machine-translated boilerplate. Machine-translating 10,000 thin pages at once is one of the fastest ways to trigger a spam manual action.

## URL structure — subfolders win

| Approach | Example | SEO verdict |
|---|---|---|
| Subfolder | `yoursite.com/es/glosario/presupuesto` | **Preferred** — consolidates domain authority |
| ccTLD | `yoursite.es/glosario/presupuesto` | Strong signal but costly to maintain |
| Subdomain | `es.yoursite.com/...` | Treated as separate site; avoid for pSEO |
| Query param | `yoursite.com/glossary?lang=es` | Not crawlable reliably; never use |

## hreflang implementation

Every page that has a locale variant must declare all variants (including `x-default`) in `<head>`:

```html
<link rel="alternate" hreflang="en" href="https://site.com/glossary/budget" />
<link rel="alternate" hreflang="es" href="https://site.com/es/glosario/presupuesto" />
<link rel="alternate" hreflang="x-default" href="https://site.com/glossary/budget" />
```

Rules:

- Every page in the set must list **all** pages in the set (bidirectional)
- Omitting a language from even one page breaks the cluster for Google
- `x-default` should point to the most general version (usually English or a language-selector page)
- Validate with Google Search Console → Enhancements → International targeting

## Data structure for multilingual pages

Store translations as a map keyed by locale so the generator stays clean:

```typescript
const TERM = {
  slug: { en: "budget", es: "presupuesto" },
  name: { en: "Budget", es: "Presupuesto" },
  definition: { en: "...", es: "..." },
};

function getTermHtml(slug: string, locale: "en" | "es"): string { ... }
```

## Machine-translation risk

Machine-translated prose is detectable by Google and often results in near-duplicate content across locales. Only translate if:

- A human reviews/edits the output, OR
- The page is primarily structured data (tables, numbers, steps) with minimal prose

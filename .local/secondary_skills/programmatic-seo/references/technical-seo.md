# Technical SEO: Schema, Freshness, Crawl Budget, and Performance

Read this when adding structured data, planning how pages stay fresh and regenerate, managing crawl budget for large or faceted page sets (roughly 10k+ URLs), or tuning Core Web Vitals on server-rendered pages.

## Schema Markup by Playbook

Match schema type to content type — don't use a generic WebPage schema when a more specific type exists:

| Playbook | Schema type | Key properties |
|---|---|---|
| Glossary / definitions | `DefinedTerm` + `DefinedTermSet` | `name`, `description`, `inDefinedTermSet` |
| How-to guides | `HowTo` | `step[]` with `HowToStep`, `tool`, `supply` |
| FAQ sections | `FAQPage` | `mainEntity[]` with `Question` + `Answer` |
| Comparisons | `ItemList` or `Review` | `itemListElement[]`, `ratingValue` |
| Data profiles | `Dataset` or `Place` | `name`, `description`, `spatialCoverage` |
| Recipes/templates | `CreativeWork` | `name`, `description`, `genre` |

Multiple schema types can appear on the same page (e.g., a HowTo guide can also have a FAQPage block at the bottom).

## Content Freshness Signals

Google rewards pages that are genuinely kept up to date. Stale pSEO pages — especially data-driven ones — gradually lose rankings as fresher competitors appear.

### `dateModified` in schema

Every page with structured data should carry a timestamp:

```json
{
  "@type": "WebPage",
  "datePublished": "2024-01-15",
  "dateModified": "2025-03-01"
}
```

**Only update `dateModified` when content actually changes.** Bumping it on a schedule without real changes is a deception signal that Google penalises. If you auto-regenerate pages, tie `dateModified` to the data source's `updatedAt`, not the deploy timestamp.

### When and how to regenerate

| Data type | Trigger strategy |
|---|---|
| Exchange rates / prices | SSR with short cache (`s-maxage=60`); no static generation |
| Product/company data | Webhook from data source on change → re-render and invalidate CDN cache |
| Weekly-updated datasets | Nightly cron job → regenerate changed pages → update sitemap `<lastmod>` |
| Static reference content (glossary, guides) | Regenerate on code deploy only |

For Express SSR, the page is always fresh — no regeneration needed. The cost is latency; mitigate with a CDN in front.

For ISR (Next.js), trigger on-demand revalidation via the revalidation API when upstream data changes:

```typescript
// When data changes, invalidate the specific path
await fetch(`/api/revalidate?secret=TOKEN&path=/glossary/${slug}`, { method: "POST" });
```

### Signals that indicate staleness to Google

- Dates in page content (e.g., "Updated January 2022") that are old
- Prices or rates that no longer match the live source
- Links to pages that now 404
- Schema `dateModified` older than 12 months for competitive queries

## Crawl Budget Management at Scale

Crawl budget is the number of pages Googlebot will crawl on your site per day. For sites with 10k+ URLs it becomes a real constraint — Googlebot will simply stop crawling before it reaches all your pages, and newly added pages may take weeks to be discovered.

### What wastes crawl budget

- **Faceted navigation**: Filter/sort URLs like `?color=red&size=M` that produce near-duplicate pages
- **Pagination**: `/page/2`, `/page/3`... where the same products appear on multiple pages
- **Session IDs / tracking params**: `?sessionid=abc123` creating millions of unique URLs
- **Internal search results**: `/search?q=anything` — never crawlable, always thin

### Solutions

**Block via `robots.txt`** (prevents crawling, doesn't affect indexation of already-indexed pages):

```text
User-agent: Googlebot
Disallow: /search
Disallow: /*?sessionid=
```

**`noindex` on parameterized URLs** (crawled but not indexed — use when the URL must exist for users):

```html
<meta name="robots" content="noindex, follow" />
```

**Canonical for near-duplicates** (one sorted/filtered variant is canonical; others point to it):

```html
<!-- On /products?sort=price-asc -->
<link rel="canonical" href="https://site.com/products" />
```

**Pagination**: Use `rel="next"`/`rel="prev"` or consolidate paginated content into one long page. Don't noindex paginated pages if they contain unique products not on page 1.

### Diagnosing crawl budget problems

In Google Search Console → Settings → Crawl stats:

- **Crawled pages/day declining** → Googlebot is throttling due to slow responses or crawl errors
- **Response codes: high 404 rate** → fix broken links; they waste crawl budget
- **Crawled but not indexed** rising → thin content or crawl budget exhausted before quality assessment

For large sites, use separate sitemaps per page type (`sitemap-glossary.xml`, `sitemap-guides.xml`) and prioritize high-value pages in the first sitemap.

## Performance and Core Web Vitals for SSR Pages

pSEO pages are often deprioritized for performance work because they're "just content pages." But Core Web Vitals are a confirmed ranking factor, and a slow pSEO page competes against well-optimized competitors who target the same keyword.

### The three metrics that matter

| Metric | Threshold | Common cause in pSEO |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5s | Hero image without dimensions/preload; render-blocking CSS |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Images without `width`/`height`; fonts causing FOUT |
| **INP** (Interaction to Next Paint) | < 200ms | Large JS bundles blocking the main thread |

### For SSR Express pages specifically

#### Eliminate render-blocking resources

```html
<!-- WRONG: blocks render until stylesheet loads -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter" />

<!-- CORRECT: preconnect + async load -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter&display=swap" media="print" onload="this.media='all'" />
```

**Inline critical CSS** (the styles needed to render above-the-fold content):

- Inline it in `<style>` tags in `<head>` — eliminates one round trip
- Load remaining CSS asynchronously or omit it (pSEO pages rarely need large stylesheets)

**Images must have explicit dimensions** to prevent CLS:

```html
<!-- WRONG: browser doesn't know height → layout shift on load -->
<img src="${hero}" alt="..." />

<!-- CORRECT -->
<img src="${hero}" width="1200" height="630" alt="..." loading="lazy" />
```

**No JavaScript is ideal.** SSR content pages need zero client-side JS. If you must include JS (analytics, interactivity), load it `defer` or `async`.

### Measuring pages not yet in Chrome UX Report

New pages have no real-user data (CrUX) for 28 days. Use:

- **Lighthouse** (Chrome DevTools or CLI): `lighthouse https://yoursite.com/glossary/term --only-categories=performance`
- **PageSpeed Insights API**: programmatic scoring for a batch of URLs
- **WebPageTest**: detailed waterfall view to identify bottlenecks

Run Lighthouse on a representative sample of pages (hub, high-volume spoke, low-volume spoke) — don't assume all pages perform equally.

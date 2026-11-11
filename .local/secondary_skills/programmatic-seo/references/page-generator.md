# Building the Page Generator

Read this at Step 6 of the workflow, when choosing SSG, ISR, or SSR and writing the routes, shared HTML shell, assets, header, footer, and sitemaps that serve the pages. Confirm the app's rendering strategy first (see "Check the App's Rendering Strategy First" in the main skill).

## Rendering strategy decision

| Page count | Data freshness | Strategy |
|---|---|---|
| <1,000 | Rarely changes | **SSG** — pre-render everything at build |
| 1,000-100,000 | Changes daily/weekly | **ISR** — pre-render popular subset, generate rest on-demand + cache |
| 100,000+ or live data | Real-time (prices, rates) | **ISR with short revalidate** or SSR |

SSG is fastest but build time scales linearly — 50k pages can mean 30+ min builds. ISR is the pSEO sweet spot: instant deploys, pages generate on first request then cache.

## For SPAs: Express SSR pattern

When adding pSEO to an existing SPA, the simplest approach is adding Express routes that return complete HTML strings. Organize into three layers:

### 1. Shared HTML shell (create this first)

```typescript
// server/ssrShared.ts — create before writing any individual page
export function ssrHtmlShell({ title, description, canonical, schemaJson, css, body, ...}): string {
  return `<!DOCTYPE html>
<html lang="...">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${canonical}" />
<!-- OG tags, fonts, schema -->
<style>${sharedCss()}${css ?? ""}</style>
</head>
<body>
${header()}
${body}
${footer()}
</body>
</html>`;
}
```

Create this shared shell **before** writing any individual page. Every new SEO page reuses it. This ensures consistent branding (header, footer, fonts, base CSS) across all SSR pages without duplication.

### 2. Data + page generator modules (one per playbook)

```typescript
// server/glossary.ts
export const TERMS: GlossaryTerm[] = [ /* structured data */ ];
export function getTermHtml(slug: string, logoBase64: string): string | null { ... }
export function getTermIndexHtml(logoBase64: string): string { ... }
```

Keep data as typed arrays/objects in the same file as the generator. This makes content easy to update without touching routing logic.

### 3. Routes (thin, just wiring)

```typescript
// in routes.ts
app.get("/glossary/:slug", (req, res) => {
  const html = getTermHtml(req.params.slug, LOGO_BASE64);
  if (!html) { res.status(404).end(); return; }
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});
```

## Cache headers per page type

Set cache headers based on data freshness — not one-size-fits-all:

| Page type | Recommended header | Reason |
|---|---|---|
| Static content (glossary, guides) | `public, max-age=86400` | Content rarely changes; CDN can serve |
| Live data (exchange rates, prices) | `no-cache` or `s-maxage=60` | Must be fresh; stale data damages credibility |
| Semi-dynamic (weekly updates) | `public, s-maxage=3600, stale-while-revalidate=86400` | Balance freshness vs. load |

## For Next.js App Router

```tsx
export async function generateStaticParams() {
  const popular = await db.query('SELECT slug FROM entities ORDER BY search_volume DESC LIMIT 500');
  return popular.map(e => ({ slug: e.slug }));
}

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entity = await getEntity(slug);
  return {
    title: `${entity.name} — ${entity.category} | Brand`,
    description: entity.summary,
    alternates: { canonical: `https://site.com/${entity.category}/${slug}` },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const entity = await getEntity(slug);
  if (!entity) notFound();
}
```

**Critical ISR rules:** `generateStaticParams` is NOT re-run on revalidation. Must return an array (even `[]`) or the route becomes fully dynamic. Set `dynamicParams = false` only if you want 404s for anything not pre-generated.

## Astro alternative

Better for content-heavy, less-interactive pages. Ships zero JS by default — better Core Web Vitals.

```js
export async function getStaticPaths() {
  const entities = await loadEntities();
  return entities.map(e => ({ params: { slug: e.slug }, props: { entity: e } }));
}
```

No native ISR; use on-demand rendering + `Cache-Control: s-maxage=3600, stale-while-revalidate`.

## Sitemaps at scale

Google's limit is 50,000 URLs per sitemap file. Shard into `sitemap-1.xml`, `sitemap-2.xml`... referenced by a sitemap index. For ISR/SSR sites, generate sitemaps server-side from the DB, not at build time. **Warning:** Google will NOT index all pages immediately — indexation at scale takes weeks/months. Prioritize high-volume slugs in the first sitemap.

## SSR-Specific Implementation Notes

### Asset handling in SSR

Frontend assets (images, fonts) processed by Vite/webpack/esbuild are **not** directly accessible to server-side routes. Common problems:

- Images imported with `import logo from "@assets/logo.png"` work in React but not in Express route handlers
- Files copied to `public/` by the build tool may not be served correctly in development
- Files with restricted permissions (`rw-------`) will throw EACCES errors when read from disk

#### Solutions by asset type

| Asset | Recommended approach |
|---|---|
| Logo / brand images | Base64-encode at server startup; embed inline in `<img src="data:...">` |
| Small icons | Inline SVG string in the HTML template |
| External fonts | Google Fonts CDN link in `<head>` |
| Background images | Use CSS gradients or CDN URLs |

```typescript
// Base64 encode logo once at startup — safe for all SSR pages
import fs from "fs";
const logoBuffer = fs.readFileSync("./attached_assets/logo.png");
const LOGO_BASE64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
```

### Header/footer consistency

SSR pages and the React/Vue/SPA app will share the same domain. Users will navigate between them. **Brand consistency is critical** — a mismatch between the main app's header and the SSR page's header breaks trust.

Steps:

1. Study the main app's header/footer colors, logo treatment, link structure, and typography
2. Replicate them in the shared `ssrShared.ts` shell functions — not approximations, pixel-for-pixel matches
3. When the main app's footer is updated (new links, new columns), update the SSR footer function too
4. Conversely, when new SSR hub pages are added (e.g., `/glossary`, `/guides`), add them to the main app's footer navigation

### Logo rendering in SSR

If the logo image has a non-standard aspect ratio or significant whitespace, a plain `height: 48px` will render it incorrectly. Inspect how the main React app clips and positions the logo, then replicate exactly:

```html
<!-- If the main app uses overflow-hidden clipping to show only part of the image: -->
<div style="height:56px; width:160px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
  <img src="${LOGO_BASE64}" style="width:auto; height:250%; object-fit:contain; margin-top:-5%;" />
</div>
```

Don't guess — read the main app's logo component before writing the SSR equivalent.

### Breadcrumb placement and negative margins

A common hero design pattern uses negative `margin-top` on the content section to create a "card floating up into the hero" visual effect:

```css
.hero { padding-bottom: 72px; }
.main { margin-top: -32px; } /* pulls first card up into hero */
```

**This breaks breadcrumbs.** If a breadcrumb element sits between the hero and `.main` in the HTML, the negative margin on `.main` will pull the main content over the breadcrumb, hiding it.

**Rule: breadcrumbs must always be the first child inside `.main`**, never between `.main` and the preceding section.

```html
<!-- WRONG: breadcrumb between hero and main -->
<div class="hero">...</div>
<nav class="breadcrumb">...</nav> <!-- will be covered by .main -->
<div class="main">...</div>

<!-- CORRECT: breadcrumb inside main -->
<div class="hero">...</div>
<div class="main">
  <nav class="breadcrumb">...</nav> <!-- safely in the content flow -->
  <div class="card">...</div>
</div>
```

Additionally, if a page has a breadcrumb and the hero uses large `padding-bottom` (designed to pair with negative margin), that padding becomes wasted dark space. Override it on breadcrumb pages:

```html
<div class="hero" style="padding-bottom: 32px;">
```

# Common Mistakes

Read this when reviewing a pSEO plan or implementation before launch, or when diagnosing why a page set is not indexed or not ranking.

## Strategic mistakes (most damaging)

- **Confusing scale with strategy**: Believing "more pages = more traffic" without validating that each page has information gain. This is the single most common pSEO failure mode in 2025+.
- **SEO cosplay**: Pages with perfect technical structure (H1, H2, meta tags, schema) but zero information gain over existing results. Structure is table stakes, not a ranking advantage.
- **No information gain audit**: Publishing pages without checking whether they add anything the current top 10 results don't already have.
- **Skipping intent matching**: Building blog posts when the query demands a comparison table, or building a product page when the query demands educational content. Wrong page type = won't rank regardless of quality.
- **Ignoring topical authority**: Publishing hundreds of pages in a domain where the site has no track record. Authority is earned through depth and trust signals, not page count.
- **Letting AI make strategic decisions**: AI generates confidently even when the keyword is unwinnable, the page type is wrong, or the content has no unique value. Human judgment is required for: keyword selection, page type, competitive viability, and publish/no-publish decisions.
- **Treating AI output as finished content**: AI drafts need human enrichment — original data, case studies, expert judgment, first-hand experience. Raw AI output is a starting point, not a final product.

## Content mistakes

- **Thin content**: Just swapping entity names in identical boilerplate (Google will deindex)
- **AI prose with no data variation**: All pages share the same generic paragraphs — amplifies thin content at scale. If you removed the entity name, pages would be indistinguishable.
- **Rewriting the top 10 results**: Using AI to rephrase what already ranks is zero information gain. Google doesn't need another version of existing content.
- **Keyword cannibalization**: Multiple pages targeting the same keyword
- **Over-generation**: Creating pages with no search demand
- **Poor data quality**: Outdated or incorrect information erodes trust

## Technical mistakes

- **SPA without SSR**: Adding pSEO pages to a React/Vue app without server-rendering — Google sees nothing
- **Orphan pages**: New SEO pages not linked from anywhere in the main site's navigation or footer
- **Inconsistent branding**: SSR pages that look different from the main app break user trust
- **Breadcrumb obscured by layout tricks**: Negative margin patterns hiding breadcrumb navigation
- **Wrong cache headers**: Live-data pages cached for 24h showing stale rates; static pages uncached causing unnecessary server load
- **Asset permission errors**: Referencing frontend assets from SSR routes that can't read them
- **Machine-translating pSEO content at scale**: Produces near-duplicate content across locales; triggers spam signals
- **Missing or asymmetric hreflang**: One page in the set not listing all variants breaks the entire locale cluster
- **Bumping `dateModified` without real content changes**: Deception signal; Google can detect and penalise it
- **Faceted navigation URLs not blocked**: Filter/sort param combinations create thousands of near-duplicate crawlable URLs, wasting crawl budget
- **No crawl budget monitoring**: Teams discover Googlebot stopped crawling new pages only after rankings plateau
- **Skipping Core Web Vitals on pSEO pages**: Slow LCP or high CLS on "just content" pages loses rankings to faster competitors
- **Images without dimensions**: Causes CLS on SSR pages (browser doesn't know reserved height until image loads)

## Process mistakes

- **Blasting hundreds of pages at once**: Instead of starting with 10-20 pages, validating indexation and impressions, then scaling what works
- **No iteration loop**: Shipping pSEO and never reviewing Search Console — dead pages accumulate and drag down domain trust
- **No freshness strategy for live-data pages**: Exchange rates or prices cached for 24h showing stale data destroys credibility
- **Ignoring UX**: Pages that exist for Google but not for users — no conversion path, no value to visitors

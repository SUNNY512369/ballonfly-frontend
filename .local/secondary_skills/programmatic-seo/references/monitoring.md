# Monitoring and Iteration Loop

Read this when writing the validation plan, reviewing a page set after launch, or deciding whether to scale, fix, or kill a playbook.

Shipping pSEO pages is not a one-time event. The standard pattern is: launch → wait 4-8 weeks → analyze → iterate. Most pSEO playbooks fail because teams skip the iteration step.

## What to track in Search Console (per page type)

Open the **Performance** report, filter by URL prefix for each playbook (`/glossary/`, `/guides/`, etc.):

| Signal | Healthy | Problem indicator |
|---|---|---|
| **Impressions growing** | Steady week-over-week increase | Flat after 8 weeks → pages not indexed or no demand |
| **CTR** | >2% for informational, >5% for navigational | Low CTR → title/description not compelling |
| **Average position** | Trending toward <20 | Stuck at 30-50 → content quality or authority issue |
| **Coverage: Crawled, not indexed** | Decreasing | Increasing → thin content signal |
| **Coverage: Excluded (noindex)** | Matches intentional noindex count | Higher than expected → template accidentally sets noindex |

## Decision framework per page set

```text
8 weeks post-launch:
│
├── Indexed AND getting impressions?
│   ├── YES, position <10 → monitor; optimize title/meta for CTR
│   ├── YES, position 11-30 → improve content depth, add internal links
│   └── YES, position >30 → thin content; merge with a stronger page or rewrite
│
├── Not indexed (Crawled, not indexed)?
│   ├── Low page count (<100) → submit to Search Console for inspection
│   └── High page count (100+) → thin content; noindex worst pages, improve rest
│
└── Not even crawled?
    ├── Check sitemap submission
    ├── Check robots.txt for accidental blocks
    └── Check crawl budget — too many thin pages may be crowding out good ones
```

## When to kill a playbook

Kill it (noindex + 301 redirect survivors to a hub) when after 6 months:

- Zero pages from the set are in the top 50 for any target keyword, AND
- Impressions are flat or declining, AND
- The page type is consuming crawl budget (visible in crawl stats)

Keeping dead pages alive harms the rest of the site — Google distributes trust across the whole domain. A smaller set of high-quality pages consistently outperforms a large set of mediocre ones.

## Iteration cadence

| Frequency | Action |
|---|---|
| Weekly | Check indexation coverage for errors |
| Monthly | Review impressions/CTR per playbook; update titles on underperformers |
| Quarterly | Full content audit — merge, improve, or kill underperforming page sets |
| On data change | Regenerate affected pages; update `dateModified` in schema |

# Information Gain and Proven Playbooks

Read this when choosing a playbook or URL pattern, judging whether a page set has enough information gain to publish, or explaining to the user why a template-only page set will not rank.

## Information Gain — The Core Quality Signal

Google's systems increasingly evaluate "information gain" — whether a page adds something new to the corpus of existing results for a query. This is the single most important concept in modern pSEO.

### What counts as information gain

| Source of gain | Example | Strength |
|---|---|---|
| **Original data / metrics** | Your own A/B test results, proprietary benchmarks, internal analytics | Strongest — impossible to replicate |
| **First-hand experience** | Actual product reviews you conducted, real case studies with named clients | Very strong — hard to fake |
| **Unique analysis** | Novel comparisons, calculated scores, derived insights from raw data | Strong — requires expertise |
| **Curated judgment** | Expert picks, opinionated rankings with reasoning, "here's what we'd actually use" | Moderate — requires credibility |
| **Structured aggregation** | Data from multiple sources combined into a single useful view (with attribution) | Moderate — useful but reproducible |
| **Rewritten common knowledge** | The same information available on 50 other sites, just rephrased | Zero — this is what gets penalized |

### The information gain test

Before publishing any pSEO page set, run this test on 5 random pages:

1. Search Google for the target keyword
2. Read the top 3 results
3. Read your generated page
4. Ask: **"Does our page contain at least one piece of information, data point, or insight that none of the top 3 results have?"**
5. If no → do not publish. Improve the data source or reduce the page set to only pages where you have genuine information gain.

### Scaled content abuse (Google's 2024+ spam policy)

Google now explicitly targets "scaled content abuse" — content produced at scale (whether by AI, humans, or automation) that exists primarily to manipulate rankings rather than help users. The pattern Google detects is:

- Many pages with similar structure
- Smooth, readable prose with no new information
- Comprehensive coverage that is really just reorganized common knowledge
- High page count with no corresponding trust signals or user engagement
- Each page is readable, but after reading it you've learned nothing new

**This pattern triggers penalties regardless of whether AI wrote the content.** A human content farm producing the same pattern gets the same treatment. The issue is not AI — it is the absence of value at scale.

## Proven Playbooks (Real Traffic Numbers)

| Playbook | URL pattern | Who does it | Scale |
|---|---|---|---|
| **Integrations** | `/apps/[A]/integrations/[B]` | **Zapier** — ~56k pages, 5.8M+ monthly organic visits, ranks for 1.3M keywords. Proprietary data (triggers/templates per app pair) no one else can replicate. | N² combinations |
| **Conversions** | `/currency-converter/[from]-to-[to]-rate` | **Wise** — 8.5M pages across locale subfolders, 60M+ monthly visits. Live exchange-rate data + fee calculators = unique value per page. | N² × locales |
| **Locations** | `/Restaurants-[city]`, `/[cuisine]-Restaurants-[city]`, `/Restaurants-[neighborhood]` | **Tripadvisor** — 700M+ pages, 226M+ monthly visits. UGC reviews keep pages fresh; layered matrix (city × cuisine × neighborhood). | city × category × modifier |
| **Data profiles** | `/[city-slug]` | **Nomad List** — cost-of-living, internet speed, safety scores per city. Pages are pure data tables — minimal prose, high value. | N entities |
| **Comparisons** | `/[A]-vs-[B]`, `/alternatives/[A]` | **G2, Capterra** — "vs" pages + "alternatives" pages, populated by user reviews. | N² / 2 |
| **Templates** | `/templates/[type]` | **Canva, Notion** — each template is a landing page. | N types |
| **Glossary** | `/learn/[term]` | **Ahrefs, HubSpot** — definition pages cluster topical authority. | N terms |
| **How-to guides** | `/guides/[task]-with-[tool]` | Documentation sites — step-by-step guides, HowTo schema | N tasks × M tools |
| **Personas** | `/[product]-for-[audience]` | "CRM for real estate agents" | N × M |

**The test:** If your data doesn't meaningfully change between page variations, don't build it. Zapier works because Slack+Asana genuinely differs from Slack+Trello. "Plumber in Austin" vs "Plumber in Dallas" with identical boilerplate = thin content penalty.

Layer playbooks for long-tail: Tripadvisor's "Best Italian Restaurants in Chinatown NYC" = curation × cuisine × neighborhood.

### Why these playbooks work — and why copycats fail

Every successful pSEO example above shares one trait: **the data genuinely changes between pages.** Zapier's Slack+Asana page has different triggers, different actions, and different templates than Slack+Trello. Wise's USD-to-EUR page has a different exchange rate, different fee structure, and different historical chart than USD-to-GBP. Tripadvisor's pages have different restaurants, different reviews, and different ratings per city.

Copycats fail because they replicate the URL structure without replicating the information gain. Creating 500 "/service-in-city" pages where only the city name changes and the rest is identical prose is not programmatic SEO — it is spam at scale. Google's systems detect this pattern reliably: many pages, similar structure, no meaningful data variation.

**Before choosing a playbook, ask:** "Do I have genuinely different data for each page variation, or am I just swapping one variable into the same template?" If the latter, reduce the page count to only variations where you have real data, or choose a different playbook entirely.

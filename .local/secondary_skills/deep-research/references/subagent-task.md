# Research subagent task template

Use this template in Phase 3 of the deep-research skill for every research subagent. Fill in the brackets and ship the task text verbatim: subagents never see the skill, so every rule they need, including the webSearch/webFetch call contract, ships inside the task text. Paraphrasing away the call-contract lines is how a subagent ends up concluding it has no web tools.

```javascript
const researchTask = `Research FOCUS AREA: [Area Name]

Topic context: [1-2 sentence description of the overall research question]

Your job: Search for information specifically about [focus area]. webSearch and webFetch are pre-registered callbacks in your CodeExecution environment -- call them directly; there is nothing to import, no skill doc to read first, and no Node runtime in the shell. Run at least 4 webSearch queries with different angles:

- [specific search term 1]
- [specific search term 2]
- [specific search term 3]
- [specific search term 4]

Each search is ONE call with this exact shape -- query is a REQUIRED string, and there is no queries parameter:

webSearch({ query: "<one full question>", searchQueries: ["<keyword variant>", "<keyword variant>"] })

Results come back in .resultPages (not .results), each with url, title, and snippet.

Pass every webSearch call a searchQueries list of 2-3 concise keyword variants (3-6 words each) alongside the query — results are noticeably better than with the query alone; query stays required, and searchQueries never replaces it. For time-sensitive topics, check today's date and use the current year in the variants; a year recalled from memory is often stale.

Local language searches: If this topic is specific to a non-English-speaking country or region, run at least 1-2 searches in the local language (e.g., Spanish for Latin America, Portuguese for Brazil, French for Francophone Africa). Primary government data, local media, and industry reports are often only available in the local language.

Source freshness: Note the publication date of every source. Flag any source older than 18 months on a fast-moving topic. For figures that move -- funding, valuations, pricing, versions, market share, leadership -- the first number a search surfaces is often last quarter's: spend one search on recent news for the entity (current month and year in the terms) before reporting such a figure as current, and attach an as-of date to every figure you report.

Run ALL searches before fetching anything, then pick the 2-3 pages worth reading: URLs that surfaced across multiple queries, authoritative domains, specific pages over homepages. Fetches are the scarce resource -- spend them on the best candidates, not the first result. SEO listicles and forum threads (Reddit, Quora) rank well because they are written to rank, not to be right: use them only as leads to the primary sources they cite.

Fetch each chosen page with ONE call carrying this exact shape (the function is webFetch -- there is no fetchPage, fetchWebPage, browse, or fetchUrl):

webFetch({ url, query: "<your focus-area question>", path: "research/sources/[focus-slug]-[NN]-[page-slug].md" })

Pass BOTH query and path on every research fetch. query has a fast model read the FULL fetched page and the result returns its answer in place of raw markdown -- never print or slice page markdown yourself; a slice silently drops everything below the fold. path saves the complete markdown to disk with a provenance header (URL, title, fetch date), and savedTo in the result confirms the save -- saved pages outlive your context and are what makes the report's citations verifiable later. Need something else from a page you already saved? Call webFetch again with a different query, same path.

webFetch THROWS on unfetchable pages (403s, dead links, crawl failures). Wrap calls in try/catch -- use Promise.allSettled for batches so one bad URL does not lose the rest -- and move to a DIFFERENT url from the search results on failure; never re-fetch the same failing URL.

Sources you cite from search snippets alone (without fetching): append each snippet with its URL, title, and date to research/sources/[focus-slug]-snippets.md. Every source you cite needs saved evidence -- the snippet is what the citation gets checked against later, so a claim more specific than its snippet needs the page fetched, or the claim dropped.

Return your findings using this EXACT structure:

## Key Facts

[Bullet list of key data points, each with source URL in parentheses]

## Notable Claims Requiring Cross-Reference

[Claims that seem important but only appear in one source, or that conflict with other findings]

## Source Quality Assessment

[For each source, rate: Tier 1 (government/multilateral/academic), Tier 2 (major publication/industry report), Tier 3 (blog/opinion/promotional). Note publication date.]

## Gaps & Unanswered Questions

[What you could not find or what needs deeper investigation]

## Sources

[Numbered list with title, URL, publication date (if available), tier rating, and the research/sources/ path for fetched pages]

Minimum: 5 distinct sources with URLs`;
```

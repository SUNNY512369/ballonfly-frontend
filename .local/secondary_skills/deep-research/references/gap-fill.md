# Gap-fill subagent task (Deep tier)

Use this template in Phase 5 of the deep-research skill, on the Deep tier only, to launch 1-2 targeted follow-up subagents for the most critical gaps. Fill in the brackets and ship the task text verbatim: subagents never see the skill, so the webSearch/webFetch call contract must stay in the task.

```javascript
const gapFillTask = `GAP-FILL RESEARCH: [Specific gap identified]

Context: During initial research on [topic], we found insufficient data on [gap].

Your job: Run 3-4 targeted searches to fill this specific gap:

- [targeted search term 1]
- [targeted search term 2]
- [targeted search term 3]

Each search is one webSearch({ query: "<one full question>", searchQueries: ["<keyword variant>", "<keyword variant>"] }) call -- query is a REQUIRED string (there is no queries parameter) and results come back in .resultPages. webSearch and webFetch are pre-registered callbacks in your CodeExecution environment; call them directly, nothing to import.

Fetch the 1-2 best pages (picked after all searches complete) with webFetch({ url, query: "<the gap question>", path: "research/sources/gapfill-[NN]-[page-slug].md" }) -- the result returns the answer in place of raw markdown and savedTo confirms the full page is on disk; never print or slice markdown. webFetch throws on unfetchable pages, so try/catch and move to a different URL. Append snippets for sources you cite without fetching to research/sources/gapfill-snippets.md.

Return findings using the same structured template as the initial research, listing the research/sources/ path for each fetched page.`;
const gapFillResult = await subagent({
  name: "gap-fill",
  task: gapFillTask,
  config: { $kind: "general" },
});
```

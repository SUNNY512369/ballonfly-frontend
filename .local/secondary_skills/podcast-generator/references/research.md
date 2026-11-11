# Podcast Research

Gather source material systematically before writing. A well-researched script sounds authoritative; a loosely researched one sounds generic. Leverage web search systematically to make each episode timely and data-rich. Do not rely on general knowledge alone — always ground the script in current, verifiable information.

## Research checklist: run these searches in parallel

| Category | What to Gather | How |
|----------|---------------|-----|
| **Recent events** | Latest results, scores, announcements, breaking news | `webSearch` with date-specific queries (e.g., "Real Madrid results April 2026") |
| **Statistics & data** | Standings, player stats, records, rankings | `webSearch` for official stats pages (fbref, transfermarkt, official league sites) |
| **Quotes & reactions** | Press conference quotes, player interviews, social media reactions | `webSearch` for post-match quotes, press conferences |
| **Context & history** | Historical comparisons, records being chased, milestones | `webSearch` for historical context related to current events |
| **Narrative angles** | Controversies, storylines, fan sentiment, trending debates | `webSearch` for opinion pieces, fan forums, trending topics |

## Research template: fill this before writing

```text
EPISODE RESEARCH BRIEF
======================
Topic: [main topic]
Date context: [what just happened / why this is timely]

KEY FACTS:
- [fact 1 with source]
- [fact 2 with source]
- [fact 3 with source]

STATISTICS:
- [stat 1]
- [stat 2]

QUOTES:
- "[quote]" — [who said it, when]

NARRATIVE ANGLES:
- [angle 1: why it's interesting]
- [angle 2: the contrarian take]

OPEN QUESTIONS:
- [what's still uncertain / debatable]
```

Run at least 3 parallel web searches covering different facets of the topic. Cross-reference facts across sources. Flag anything that's unverified or contradictory — use it as discussion material in the script rather than stating it as fact.

## Search strategy

Run searches in parallel to maximize speed. Use at least 3 different search queries per episode:

```javascript
// Run these in parallel — don't serialize
const [results1, results2, results3] = await Promise.all([
  webSearch({ query: "[topic] latest news [current month year]" }),
  webSearch({ query: "[topic] statistics standings data [year]" }),
  webSearch({ query: "[topic] analysis reactions opinions [current month year]" }),
]);
```

## Data verification

- Cross-reference statistics across at least 2 sources before including them in the script
- When sources conflict, acknowledge the discrepancy in the script — it makes good discussion material
- Always include the date context of your research — "as of [date]" — so listeners know the information is current
- For rapidly changing topics (sports scores, stock prices, breaking news), note in the script header when the research was conducted

## Enriching the script with data

Transform raw research into conversational content:

| Raw Data | Script Version |
|----------|---------------|
| "Player scored 59 goals in 2025" | "Fifty-nine goals. In one calendar year. That ties the all-time club record." |
| "Team is 4 points behind leader" | "Four points. That's the gap. And with eight games left, there's almost no margin for error." |
| "Manager was fired after 7 months" | "Seven months. That's all it lasted. One of the shortest managerial stints in the club's recent history." |

Numbers should be spoken out in script form when they open a sentence or carry dramatic weight. Use digits when they're mid-sentence and factual.

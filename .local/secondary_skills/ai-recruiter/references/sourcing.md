# Sourcing: Calibration, Search, Profiles, Channels, and Outreach

Detailed playbook for workflow Steps 1-6. Read this after Step 0 research and clarifying questions, whenever the user wants a sourcing strategy, search strings, candidate profiles, sourcing channels beyond LinkedIn, or cold outreach.

## Step 1: Calibrate the Role

Split requirements into three buckets — be ruthless, most JDs list nice-to-haves as must-haves and shrink the pool 80%:

- **Must-have** (3-4 max): Deal-breakers. Can't do the job without these on day one.
- **Learnable in 90 days**: Most "required" skills belong here.
- **Pedigree signals**: School, FAANG experience, etc. — these filter for bias, not ability. Drop them unless there's a specific reason.

**Comp research:** `webSearch: "levels.fyi [role] [company tier]"` or `"[role] salary [city] site:glassdoor.com"`. For startups, `webSearch: "Pave [role] equity benchmarks"`. Keep comp in the internal strategy doc for reference but do NOT include it in outreach templates by default.

## Step 2: Build Boolean Search Strings

Boolean-savvy recruiters fill roles ~23% faster (LinkedIn 2023 data). LinkedIn Recruiter caps each field at ~300 chars — split across Title and Keywords rather than cramming one field.

### Core pattern — put role in Title, skills in Keywords

```text
Title: ("staff engineer" OR "senior engineer" OR "tech lead" OR "principal")
Keywords: (Rust OR Go OR "distributed systems") AND (Kubernetes OR k8s) NOT (manager OR director OR intern)
```

**Synonym rings — the \#1 missed tactic.** Titles fragment massively across companies:

```text
("product manager" OR "product owner" OR "PM" OR "program manager" OR "product lead")
("data scientist" OR "ML engineer" OR "machine learning engineer" OR "applied scientist" OR "research scientist")
("SRE" OR "site reliability" OR "devops engineer" OR "platform engineer" OR "infrastructure engineer")
```

**Impact-verb trick** — surface doers, not title-holders:

```text
("built" OR "shipped" OR "launched" OR "scaled" OR "led migration" OR "0 to 1")
```

### X-ray search (Google, bypasses LinkedIn limits)

```text
site:linkedin.com/in ("staff engineer" OR "principal engineer") "rust" "san francisco" -recruiter -hiring
```

## Step 3: Provide Direct LinkedIn Search Links

Always generate at least 5 clickable LinkedIn search URLs that the user can open directly in their browser. These should be pre-built with URL-encoded keywords, location filters, and relevant company/skill terms.

### URL format

```text
https://www.linkedin.com/search/results/people/?keywords=URL_ENCODED_KEYWORDS&geoUrn=%5B%22GEO_ID%22%5D&origin=FACETED_SEARCH
```

### Common geo IDs

- SF Bay Area: `102095887`
- New York: `103644278`
- US: `103644278`
- London: `90009496`

Create separate links for different search angles:

1. Candidates at direct competitors
2. Candidates with the specific skill/background the user prioritized
3. Candidates at adjacent companies in the space
4. Candidates at tier 2/3 companies (bigger pool)
5. Broader keyword search for passive candidates

## Step 4: Find Specific Candidate Profiles

Always use `webSearch` with `site:linkedin.com/in` queries to find specific named candidates. Search multiple angles:

- PMs/engineers at competitor companies
- People with the specific background the user asked for (e.g., founder experience, UI expertise)
- People at adjacent companies in the same space

Present candidates in a table with:

- Name
- Current role
- Why they fit (1 sentence)
- Hyperlinked LinkedIn profile URL

Aim for 10-15 specific profiles, organized into tiers (e.g., direct competitors, adjacent companies, broader pool).

## Step 5: Source Beyond LinkedIn

LinkedIn InMail response rates have dropped from 30%+ to 10-13% over 5 years as the platform saturated. Diversify:

| Channel | Best for | Tactic |
|---------|----------|--------|
| **GitHub** | Engineers | `webFetch` their profile — check contribution graph (consistent > spiky), pinned repos, languages bar, PR review quality on public projects. |
| **GitHub Search** | Niche skills | `site:github.com "location: [city]" language:Rust` or search commits/issues in relevant OSS projects |
| **Stack Overflow** | Deep specialists | Top answerers on niche tags — check profile for contact info |
| **Conference talks** | Senior/staff+ | `webSearch: "[conference name] speakers 2025"` — speakers are pre-vetted for communication skills |
| **Papers/Google Scholar** | ML/research | Co-authors on relevant papers, often with .edu emails |
| **HN "Who wants to be hired"** | Startup-minded | Monthly thread, candidates self-describe, `site:news.ycombinator.com "who wants to be hired"` |
| **Product Hunt** | Builder-types | Makers of top products in the relevant category |
| **Twitter/X** | Thought leaders | Search for people posting about the relevant domain |
| **YC Alumni** | Founder-PMs | Founders whose startups ended and moved into PM/leadership roles |
| **Paid aggregators** | Volume | SeekOut, HireEZ (45+ platforms), Gem, Juicebox/PeopleGPT |

## Step 6: Outreach That Gets Replies

**2025 benchmarks:** Cold InMail averages 10-13% response. Personalized outreach with a specific hook hits 20%+. 86% of candidates ignore generic messages entirely (TalentBoard 2024).

### Structure — 4 sentences max

1. **Hook** (why *them*, specifically): "Saw your PR on the Tokio scheduler — the approach to work-stealing was clean."
2. **Why this role matters** (to them, not to you): "We're 12 engineers, pre-Series-B, and the entire storage layer is unowned."
3. **One concrete detail**: Remote policy, a tech problem they'd find interesting, team size, or growth metrics. Avoid listing comp — save that for when they respond.
4. **Low-friction CTA**: "Worth 15 min to hear more?" — not "Let me know if you're open to opportunities."

**Do NOT include compensation in outreach templates.** Comp details belong in the internal strategy section. If a candidate responds, share comp on the first call. Leading with comp in cold outreach can anchor low or signal desperation.

**Subject lines:** Use their project name or the specific tech, not "Opportunity at [Company]." Lowercase, short, looks like a peer wrote it.

**Follow-up:** One bump at day 5 with a *new* piece of info (funding news, a blog post, the hiring manager's name). Never "just following up."

**Generate 3 outreach templates** tailored to different candidate segments (e.g., competitors, adjacent companies, career-changers). Customize the angle for each.

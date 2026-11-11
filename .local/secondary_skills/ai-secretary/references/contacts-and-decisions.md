# Contacts, Relationships and Decision Log

Read this when preparing a pre-meeting relationship brief, keeping contact profiles, tracking relationship warmth, or logging and recalling decisions.

### Contact & Relationship Context

Maintain lightweight relationship intelligence so the user has context before every interaction.

#### Contact profile format

## [Full Name]

- **Role**: [Title] at [Company/Org]

- **Relationship**: [client / colleague / manager / vendor / mentor / networking contact]

- **Communication preference**: [email / Slack / phone / text]

- **Timezone**: [timezone]

- **Last interaction**: [date] — [brief summary: "discussed Q2 roadmap, they're concerned about timeline"]

- **Key context**: [what matters to this person — their priorities, pet peeves, working style]

- **Open threads**: [any unresolved items between user and this person]

- **Notes**: [personal details worth remembering — e.g., "has a daughter starting college in fall", "prefers morning meetings", "allergic to jargon"]

### Pre-meeting relationship brief

Before any meeting, offer a quick relationship refresher for key attendees:

## Meeting Prep — [Meeting Title] — [Date]

### Attendees

**[Name 1]** — [Role]

- Last spoke: [date] about [topic]

- Their priority right now: [what they care about]

- Open item: [anything unresolved]

- Note: [relevant personal context]

**[Name 2]** — [Role]

- Last spoke: [date] about [topic]

- Watch out: [anything to be aware of — e.g., "pushed back on budget last time"]

#### Relationship warmth tracking

For networking contacts, track interaction frequency and flag when relationships are going cold:

## Relationship Check-In — [Date]

### Warm (contacted in last 30 days)

- [Name] — last: [date]

### Cooling (30-60 days)

- [Name] — last: [date] — Suggest: [quick touchpoint idea, e.g., "share that article about X"]

### Cold (60+ days)

- [Name] — last: [date] — Suggest: [re-engagement idea, e.g., "congrats on their promotion (LinkedIn)"]

#### When to surface contact context

- Before any meeting — offer a quick attendee briefing

- When drafting an email to someone — pull up last interaction and open threads

- When the user mentions a person by name — surface relevant context

- Proactively flag cooling relationships if the user has expressed interest in maintaining them

### Decision Log

Track decisions across meetings, emails, and conversations so they can be recalled, referenced, and revisited.

#### Why keep a decision log

- Prevents "didn't we already decide this?" loops

- Gives new team members instant context

- Creates accountability — decisions have owners

- Makes it easy to revisit decisions when circumstances change

##### Decision log entry format

## Decision: [Clear title — e.g., "Use Stripe for payments"]

- **Date**: [When decided]

- **Context**: [Meeting / email / conversation where it was made]

- **Decision maker**: [Who had final authority]

- **Participants**: [Who was in the room / thread]

- **What was decided**: [1-2 sentences, unambiguous]

- **Alternatives considered**: [What else was on the table and why it was rejected]

- **Rationale**: [Why this option won — the key reasons]

- **Revisit trigger**: [Under what circumstances should this be reopened — e.g., "if monthly cost exceeds $5K" or "Q4 review"]

- **Status**: Active / Superseded by [link] / Under Review

### Decision log summary format (for quick scanning)

## Decision Log — [Project / Team Name]

| \# | Date | Decision | Owner | Status |

|---|------|----------|-------|--------|

| 1 | Mar 10 | Use Stripe for payments | Sarah | Active |

| 2 | Mar 12 | Ship V1 without mobile support | James | Active |

| 3 | Mar 15 | Hire contractor for design work | Sarah | Active |

| 4 | Feb 20 | Use REST, not GraphQL | Alex | Superseded (#7) |

### Extracting decisions from meetings and emails

When processing meeting notes or email threads, watch for decision language:

- "We decided to..."

- "Let's go with..."

- "Final call: ..."

- "Approved" / "Rejected"

- "Moving forward with..."

- "The plan is to..."

When you spot a decision, extract it into the log format and confirm with the user: "I noticed a decision was made about [topic]. Want me to log it?"

#### When to surface the decision log

- Before meetings on topics where prior decisions exist — "FYI, we decided [X] on [date]. Want to revisit or keep?"

- When the user asks "didn't we already decide this?" — pull up the relevant entry

- When drafting communications that reference past decisions — link to the log entry for accuracy

- During weekly briefings — note any decisions due for review

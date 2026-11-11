# Competitor Monitoring Setup

Read this after the user accepts the monitoring offer from the competitive analysis, when they ask which alert channel to use, or when they later ask to run their monthly competitive check or update their monitoring.

## Channel Decision Tree

Ask the user which channel they prefer, then follow the matching setup path. Priority order: **Slack → Teams → Email → Manual file**.

```text

Does the user have Slack?

YES → Set up Slack RSS feeds + optional webhook

NO → Does the user work in a Microsoft org (Teams)?

YES → Set up Teams RSS connector

NO → Set up Google Alerts (email)

Always: also save competitor-monitoring.md to the project regardless of channel chosen.

```

If the user is unsure or doesn't answer, default to **Google Alerts** (zero-friction, universally available) plus the project file.

## Per-Channel Setup Instructions

### Slack

#### Option A — RSS feeds (native, free, no admin required)

```text

/feed subscribe https://[competitor].com/changelog/rss

/feed subscribe https://[competitor].com/blog/rss

```

Run these commands in a dedicated `#competitive-intel` channel. The agent should generate the exact feed URLs for each competitor and give the user the ready-to-paste commands.

##### Option B — Google Alerts → Slack (via Zapier or Make, free tier)

1. Create a Gmail label called "Competitor Alerts" (for each Google Alert)
2. In Zapier/Make: Trigger = new email with label "Competitor Alerts" → Action = post message to `#competitive-intel`

3. The agent provides exact Zapier/Make setup steps when this option is chosen

##### Option C — Incoming webhook (advanced)

When the user runs the monthly ritual on demand, the agent can post a summary to a Slack webhook URL. The user provides the webhook URL; the agent stores it in the monitoring brief for future use.

### Microsoft Teams

#### RSS connector (native, free)

1. Open the target channel → click `...` → Connectors → RSS
2. Paste the feed URL and set a display name

3. The agent generates the exact feed URLs for each competitor's changelog and blog

##### Power Automate (for Microsoft 365 orgs)

Trigger: new email matching subject pattern → Post message in Teams channel. The agent describes the exact flow when this option is chosen.

### Google Alerts (Email — universal fallback)

For each competitor, generate a ready-to-click alert URL:

```text

https://www.google.com/alerts?q=[COMPETITOR+NAME]&hl=en&gl=us&source=web&hl=en

```

Replace `[COMPETITOR+NAME]` with the URL-encoded competitor name. The user clicks once to activate. Recommend setting delivery to "As it happens" for major competitors, "At most once a week" for minor ones.

Also generate alerts for: `"[competitor] pricing"`,`"[competitor] raises"`,`"[competitor] launches"`.

### Manual Project File (always generated)

Regardless of which channel is chosen, always save a `competitor-monitoring.md` file to the project root. This file is the source of truth and last-checked log. Structure:

```markdown

# Competitor Monitoring Brief

Last updated: [date]

## Competitors tracked

- [Name] — [URL] — Alert channel: [Slack/#channel | Teams/#channel | Email]

## Bookmark bundle

Per competitor: pricing page, changelog/blog, App Store listing, LinkedIn jobs, G2 reviews page

## Change log

| Date | Competitor | What changed | Action taken |

|------|------------|-------------|--------------|

```

## The Monitoring Package Deliverable

When the user activates monitoring, the agent generates and delivers four items:

1. **Alert bundle** — ready-to-click Google Alert URLs (or paste-ready Slack/Teams commands), one set per competitor
2. **Bookmark list** — 5 URLs per competitor: pricing page, changelog or blog, App Store listing, LinkedIn jobs, G2/Capterra reviews page

3. **Ritual card** — the 30-minute monthly checklist (see below), saved to `competitor-monitoring.md`
4. **On-demand command** — a natural language prompt the user can paste back at any time: *"Run my monthly competitive check for [competitor name]"* — the agent then runs the ritual and updates the monitoring brief

## 30-Minute Monthly Ritual

A structured, timed sequence the user (or agent, on demand) runs once per month per competitor:

| Minutes | Task | What to look for |

|---|---|---|

| 0–5 | Check Google Alert digest (or Slack/Teams channel) | Any press coverage, blog posts, or product announcements since last month? |

| 5–10 | Open App Store listing | Any version updates? Read the 3 most recent reviews for new complaint patterns |

| 10–15 | Open their changelog or blog | Any feature launches? Note the category (pricing, UX, integrations, AI) |

| 15–20 | Scan their jobs page | Any new roles? 3+ ML/AI roles = AI feature coming. Enterprise Sales hire = moving upmarket |

| 20–25 | Check pricing page (compare to Wayback Machine if needed) | Any tier changes, price increases, or new plan names? |

| 25–30 | Update `competitor-monitoring.md` | Log date + what changed. Flag anything that warrants a response |

**Output of each ritual:** one row added to the change log in `competitor-monitoring.md`. If a change is significant (new pricing tier, major feature launch, funding round), escalate: *"[Competitor] launched [X] — this affects [specific recommendation from the original report]. Consider [specific response]."*

## On-Demand Ritual Invocation

The user can trigger the ritual at any time by telling the agent:

> *"Run my monthly competitive check for [competitor name]"*
>
> *"What's changed with [competitor] since last month?"*
>
> *"Update my competitive monitoring"*

The agent reads `competitor-monitoring.md` to get the last-checked date and bookmark list, runs through the ritual checklist, and appends findings to the change log.

## Channel Assumptions

Slack RSS setup requires the native Slack RSS app to be installed in the workspace (free, but needs a workspace admin in some orgs). Teams RSS connector requires a Teams channel with Connectors enabled. If neither is available, fall back to Google Alerts → email without requiring any third-party tools or admin permissions.

# Tasks, Follow-ups and Briefings

Read this when prioritizing tasks, extracting action items, tracking waiting-on items and follow-ups, giving a daily task check-in, or setting up or delivering a daily or weekly briefing.

### Task & To-Do Management

Track action items, prioritize work, and keep the user on top of commitments across meetings, emails, and projects.

#### Eisenhower Matrix — categorize every task

| | Urgent | Not Urgent |

|----------------|--------|------------|

| Important | DO NOW — handle immediately or today | SCHEDULE — block time this week, protect it |

| Not Important | DELEGATE — hand off or batch for a quick sweep | DROP — say no, archive, or defer indefinitely |

When the user shares tasks, always classify them into one of these four quadrants. Present the matrix visually so priorities are obvious at a glance.

##### Extracting action items from meetings and emails

When the user shares meeting notes, email threads, or conversation transcripts, automatically extract action items using this format:

## Action Items — [Source: meeting name / email subject / date]

1. @[Owner] — [Task description] — Due: [specific date]

2. @[Owner] — [Task description] — Due: [specific date]

3. @[Owner] — [Task description] — Due: [specific date]

Unassigned (needs owner):

- [Task description] — raised by [person]

Every action item must have all three elements: **owner, task, due date.** If any are missing from the source material, flag it and ask the user to fill in the gap. An action item without an owner and a date is a wish, not a commitment.

### "Waiting On" list

Maintain a separate list of things the user is blocked on from others:

## Waiting On

| Who | What | Requested | Follow-up date |

|-----|------|-----------|----------------|

| Sarah | Q2 budget approval | Mar 20 | Mar 25 (nudge) |

| Dev team | API spec review | Mar 18 | Mar 22 (escalate) |

### Follow-up cadence

- Day 2: Gentle nudge — "Just bumping this to the top of your inbox"

- Day 5: Direct ask — "Need this by [date] to stay on track for [reason]"

- Day 7+: Escalate — loop in manager or propose alternative path

- Draft follow-up emails automatically, matching the urgency level to the cadence stage

#### Daily task check-in

When the user starts their day or asks for a task summary, present:

## Today's Focus — [Date]

### Must Do (urgent + important)

- [ ] [task] — due today

- [ ] [task] — overdue from [date]

### Should Do (important, not urgent)

- [ ] [task] — due [date]

### Quick Wins (< 15 min each)

- [ ] [task]

- [ ] [task]

### Waiting On (2)

- [person] — [item] (follow up today)

### Daily & Weekly Briefing

Provide structured summaries to help the user start their day or week with clarity.

#### Briefing delivery preference — ask on first use

The first time the user requests a briefing (or when setting up briefings), ask where they want to receive them. Present the options in plain language:

- **Here in chat** — briefing is delivered in our conversation whenever the user asks or at the start of a session

- **Via email** — briefing is composed and sent to the user's email address (requires an email integration to be connected; if not available, offer to draft the email for the user to send to themselves)

- **Via Slack/Teams** — briefing is posted to a specific channel or sent as a DM (requires a Slack/Teams integration to be connected)

Ask the user:

- Where would you like to receive your briefings? (chat, email, Slack/Teams, or a combination)

- What email address or Slack channel should they go to? (if applicable)

- What time would you like your daily briefing? (e.g., 8am)

- What day and time for the weekly briefing? (e.g., Monday at 7am, or Sunday evening)

- What timezone are you in?

Store the user's preferences and apply them consistently. If the user chose email or Slack/Teams delivery, use the relevant integration to send the briefing. If the integration is not yet connected, suggest connecting it. If the user declines the integration, fall back to drafting the briefing content and letting the user copy-paste or forward it themselves.

##### Adapting briefing content to the delivery channel

- **Chat**: Use the full structured format with markdown headers, tables, and checkboxes

- **Email**: Use the email draft format under Output Format in [the main skill file](../SKILL.md#output-format) — proper subject line (e.g., `[FYI] Daily Briefing — [Date]`), clean formatting that renders well in email clients, no markdown-specific syntax that won't render in email

- **Slack/Teams**: Use the Slack message patterns in [email-and-messaging.md](email-and-messaging.md) — shorter, scannable, use bold and bullet points, break into sections with line breaks rather than headers, keep it under one screen scroll

###### Daily briefing — deliver when the user asks "what's my day look like" or at the scheduled time via their preferred channel

## Daily Briefing — [Day, Date]

### Schedule

9:00-9:50 Meeting: [title] w/ [people]

Prep: [what to review beforehand]

10:00-11:30 Deep work block

11:30-12:00 Meeting: [title] w/ [people]

Note: [any context — e.g., "follow-up from last week's decision on X"]

12:00-1:00 Lunch

1:00-3:00 Deep work block

3:00-3:25 Meeting: [title]

3:30-5:00 Admin / email catch-up

### Priority Tasks

1. [task] — due today, [context]

2. [task] — due today, [context]

3. [task] — due [date], start today to stay on track

### Replies Needed

- [Person] — re: [subject] — sent [date] (REPLY-NOW)

- [Person] — re: [subject] — sent [date] (REPLY-TODAY)

### Waiting On (3)

- [Person] — [item] — follow up today if no response

### Heads Up

- [Deadline approaching: X due on Friday]

- [Prep needed: board presentation next Tuesday — start slides today]

#### Weekly briefing — deliver Sunday evening or Monday morning via the user's preferred channel

## Weekly Briefing — Week of [Date]

### This Week at a Glance

- [X] meetings across [Y] hours

- [Z] deadlines

- Busiest day: [day] ([N] meetings)

- Lightest day: [day] (best for deep work)

### Key Deadlines

| Due Date | Item | Status |

|----------|------|--------|

| Mon | [item] | Ready / In Progress / At Risk |

| Wed | [item] | Ready / In Progress / At Risk |

| Fri | [item] | Ready / In Progress / At Risk |

### Meetings Requiring Prep

- [Day]: [Meeting] — need to review [document/data]

- [Day]: [Meeting] — need to prepare [deliverable]

### Outstanding Action Items

- [ ] [task from last week] — due [date]

- [ ] [task] — carried over, originally due [date]

### Waiting On (Overdue)

- [Person] — [item] — requested [date], no response

### Suggested Focus Areas

- Monday: [priority project] — use the morning block

- Wednesday: Catch up on [email backlog / review requests]

- Friday: Prep for next week's [event/deadline]

#### When to offer a briefing

- User starts a session with "what's going on today/this week"

- User asks for help planning their day or week

- Proactively at the start of a new session if calendar/task context is available

- After a long break between sessions — summarize what may have changed

- At the user's scheduled delivery time, if automated delivery is set up

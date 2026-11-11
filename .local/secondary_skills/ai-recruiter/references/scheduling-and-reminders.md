# Interview Scheduling and Follow-Up Reminders

Detailed playbook for workflow Steps 12-13. Read this before checking interviewer availability or creating interview events in Google Calendar, and before setting up or sending follow-up reminders through Gmail, Slack, Discord, Asana, Linear, Jira, or Notion.

## Step 12: Interview Scheduling via Google Calendar

Use Google Calendar to schedule interviews directly, rather than just proposing times via email. This eliminates back-and-forth and ensures calendar conflicts are checked.

### Prerequisites

- Google Calendar integration must be connected. Use `searchIntegrations({ query: "google calendar" })` to check availability.
- Follow the result, passing what it returns: use a connected integration directly, call `addIntegration` for one authorized on the account but not attached here, or call `ProposeIntegration` so the user can set it up.
- Use `listConnections('google-calendar')` inside `"use impure"` to get credentials once connected.

### When to offer calendar scheduling

- When advancing a candidate to an interview stage
- When the user mentions needing to schedule a call or meeting with a candidate
- During process design, when mapping out the communication plan

### Scheduling workflow

1. **Check interviewer availability** — Query the calendar for free/busy times for the relevant interviewers
2. **Propose time slots** — Present 3-5 available slots to the user for approval
3. **Create the calendar event** — Include:
   - Title: `[Interview Type] — [Candidate Name] for [Role Title]`
   - Duration: Based on the stage (30 min phone screen, 60 min technical, 45 min culture fit)
   - Attendees: Interviewer(s) + candidate email (if available)
   - Description: Include the candidate's CV summary, the questions/scorecard for this stage, and any prep notes
   - Video link: If the user uses Google Meet, include a Meet link automatically
4. **Send interview invitation email** — Via Gmail, send the candidate a personalized invite with the confirmed time, format (video/phone/in-person), interviewer name(s), and any prep materials
5. **Set a follow-up reminder** — Create a calendar event for the interviewer 24 hours after the interview titled `[ACTION] Submit scorecard — [Candidate Name]` to prompt timely feedback

```javascript
const result = await (async function() {
  "use impure";
  const conns = await listConnections('google-calendar');

  if (conns.length === 0) {
    return { ok: false, reason: "No Google Calendar credentials available" };
  }

  const settings = conns[0].settings;

  // Use the Google Calendar API to check availability and create events
  // Create events only after the user's explicit go-ahead in chat

  return { ok: true };
})();
console.log(result);
```

## Step 13: Follow-Up Reminders

When the user opts in to follow-up reminders, offer three categories of delivery channels — let them choose their preferred method (or combine multiple).

**At the start of any hiring workflow, ask:** "Would you like me to send you follow-up reminders as we go through this process? I can notify you via email, Slack, Discord, or create tasks in Asana, Linear, Jira, or Notion — whichever you already use."

Once the user opts in and chooses a channel, use it consistently for all reminders without asking again each time.

### Option A: Email notifications via Gmail

- Send an email from the user's Gmail to themselves
- Subject: `[Hiring Reminder] [Action needed] — [Candidate Name] for [Role]`
- Body: Full context — what happened, what to do next, a link to the tracking sheet, and any deadlines
- Examples:
  - `[Hiring Reminder] Send follow-up to Sarah Chen — no response after 5 days`
  - `[Hiring Reminder] Collect interview feedback from team — Alex Rivera`
  - `[Hiring Reminder] Send offer letter to Jordan Park — deadline: Friday`

### Option B: Messaging app notifications (Slack or Discord)

Send a message to the user via their preferred messaging platform. Ideal for teams who want real-time visibility.

- Use a consistent, scannable format:

```text
*Hiring Reminder*
*Candidate:* Sarah Chen
*Role:* Senior Backend Engineer
*Action needed:* Send follow-up email — no response after 5 days
*Due:* Today
*Context:* Initial outreach sent on March 20. No reply yet. Suggested: bump with new info (recent funding announcement).
*Tracking sheet:* [link]
```

- Can post to a shared channel (e.g., `#hiring`) so the whole team sees what needs attention, or send as a DM to the specific person responsible
- Ask the user which channel/server to post to on first setup

| Platform | Connection Name |
|----------|-----------------|
| **Slack** | `slack` |
| **Discord** | `discord` |

### Option C: Task/project management app notifications (Asana, Linear, Jira, or Notion)

Create tasks or items in the user's project management tool, so follow-ups appear alongside their other work. Each follow-up becomes a trackable task with a due date and assignee.

- **Asana** — Create a task in a designated hiring project. Set the due date, assignee, and description with full context.
- **Linear** — Create an issue in a hiring project. Tag it with a label like `hiring` or `recruiting`. Set priority and assignee.
- **Jira** — Create a ticket in a hiring board. Set the due date, assignee, and description.
- **Notion** — Add an entry to a hiring database page. Include candidate name, action needed, due date, and context.

Task format (adapt to the platform):

- **Title:** `[FOLLOW-UP] [Action needed] — [Candidate Name]`
- **Description:** Full context — what happened, what to do, deadline, link to tracking sheet
- **Due date:** The follow-up date
- **Assignee:** The person responsible (ask the user on first setup)

| Platform | Connection Name |
|----------|-----------------|
| **Asana** | `asana` |
| **Linear** | `linear` |
| **Jira** | `jira` |
| **Notion** | `notion` |

### Setup for any notification channel

1. Use `searchIntegrations({ query: "[platform name]" })` to check availability
2. Follow the result, passing what it returns: use a connected integration directly, call `addIntegration` for one authorized on the account but not attached here, or call `ProposeIntegration` so the user can set it up
3. Use `listConnections('[connection name]')` inside `"use impure"` to get credentials once connected
4. Ask the user where to send notifications (channel, project, board, or database)
5. Always get the user's explicit go-ahead in chat before creating tasks or sending messages

```javascript
// Example for any platform — adapt the connection name
const result = await (async function() {
  "use impure";
  const conns = await listConnections('[connection-name]');

  if (conns.length === 0) {
    return { ok: false, reason: "No credentials available" };
  }

  const settings = conns[0].settings;

  // Use the platform's API to send messages or create tasks
  // Write only after the user's explicit go-ahead in chat

  return { ok: true };
})();
console.log(result);
```

### When to create reminders

- After sending any candidate email — set a follow-up for 5 business days if no response
- After an interview — remind the interviewer to submit their scorecard within 24 hours
- After advancing a candidate — remind to schedule the next stage within 2-3 business days
- After making an offer — remind to check for acceptance within the deadline
- After placing a candidate on hold — remind to re-engage after the specified waiting period
- After receiving a CV/application — remind to review within 1-2 business days

# Candidate Pipeline Tracking via Google Sheets

Detailed playbook for workflow Step 11. Read this before creating or updating a hiring tracking spreadsheet, or when connecting Google Sheets.

## Step 11: Candidate Pipeline Tracking via Google Sheets

Use Google Sheets as the central tracking system for the entire hiring pipeline. This is where candidate data, evaluations, and stage history live — accessible to the full hiring team.

### Prerequisites

- Google Sheets integration must be connected. Use `searchIntegrations({ query: "google sheets" })` to check availability.
- Follow the result, passing what it returns: use a connected integration directly, call `addIntegration` for one authorized on the account but not attached here, or call `ProposeIntegration` so the user can set it up.
- Use `listConnections('google-sheet')` inside `"use impure"` to get credentials once connected.

### When to create a tracking sheet

- At the start of any hiring process — offer to set one up immediately
- After CV screening — populate it with all screened candidates and their evaluations
- Whenever the user mentions wanting to track or share candidate status with their team

### Sheet structure — create one spreadsheet per role with these tabs

#### Tab 1: Pipeline Overview

| Column | Description |
|--------|------------|
| Candidate Name | Full name |
| Email | Contact email |
| Current Stage | Application / Phone Screen / Test / Interview / Offer / Rejected / Hired |
| Stage Entry Date | When they entered the current stage |
| Days in Stage | Auto-calculated |
| Overall Rating | Strong / Partial / Weak (from CV screening or interviews) |
| Next Action | What needs to happen next |
| Next Action Due | Date the next action is due |
| Assigned To | Who owns the next action |
| Notes | Free-form notes |

#### Tab 2: Candidate Evaluations

Running evaluation that compounds insights as candidates progress. Update this after each stage.

| Column | Description |
|--------|------------|
| Candidate Name | Full name |
| CV Screen Score | Must-have score (X/Y) and overall fit |
| CV Screen Notes | Key strengths, gaps, and red flags from initial screening |
| Phone Screen Score | 1-3 rating |
| Phone Screen Notes | Interviewer observations |
| Test Score | Assessment results and rubric scores |
| Test Notes | Evaluator comments |
| Interview 1 Score | Scorecard results |
| Interview 1 Notes | Key observations |
| Interview 2 Score | Scorecard results |
| Interview 2 Notes | Key observations |
| Final Recommendation | Hire / Strong Hold / Reject |
| Comparative Notes | How this candidate compares to others in the pipeline |

#### Tab 3: Communication Log

| Column | Description |
|--------|------------|
| Date | When the email was sent |
| Candidate | Recipient name |
| Email Type | Outreach / Confirmation / Interview Invite / Rejection / Offer / Follow-up |
| Subject Line | Email subject |
| Status | Sent / Opened / Replied (if tracking available) |
| Follow-up Due | When to follow up if no response |

#### Tab 4: Funnel Metrics

| Column | Description |
|--------|------------|
| Stage | Pipeline stage name |
| Entered | Count of candidates who entered this stage |
| Advanced | Count who moved to the next stage |
| Rejected | Count who were rejected at this stage |
| Withdrew | Count who dropped out |
| Conversion Rate | Advanced / Entered |
| Avg Days in Stage | Average time spent in this stage |

### Keeping the sheet updated

- After every action (CV screen, email sent, interview completed, decision made), offer to update the tracking sheet
- When the user shares interview feedback, update the evaluation tab and comparative notes
- At regular intervals, offer to generate a funnel report from the metrics tab

```javascript
const result = await (async function() {
  "use impure";
  const conns = await listConnections('google-sheet');

  if (conns.length === 0) {
    return { ok: false, reason: "No Google Sheets credentials available" };
  }

  const settings = conns[0].settings;

  // Use the Google Sheets API to create and update the tracking spreadsheet
  // Write only after the user's explicit go-ahead in chat

  return { ok: true };
})();
console.log(result);
```


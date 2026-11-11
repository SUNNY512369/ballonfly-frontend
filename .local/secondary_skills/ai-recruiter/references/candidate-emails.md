# Candidate Emails via Gmail

Detailed playbook for workflow Step 8. Read this before drafting or sending any candidate email (outreach, confirmations, interview invitations, rejections, holds, offers, process updates, or reference requests), or when connecting Gmail.

## Types of emails you can send

| Email Type | When to Offer |
|------------|--------------|
| **Cold outreach** | After sourcing candidates (Step 6) |
| **Application received** | When a user mentions receiving applications |
| **Advancement / next steps** | After CV screening recommends advancing a candidate |
| **Interview invitation** | When scheduling interviews — include date, time, format, interviewer names |
| **Interview follow-up** | After interviews — thank the candidate, outline next steps and timeline |
| **Rejection** | After CV screening or interview rounds — respectful, brief, no detailed feedback |
| **Hold / waitlist** | When a candidate is strong but timing isn't right |
| **Offer / congratulations** | When a hiring decision is made |
| **Process update** | When there are delays or timeline changes — keep candidates in the loop |
| **Reference request** | When moving to reference checks — polite request to the candidate or referee |

## Step 8: Send Candidate Emails via Gmail

When the user wants to communicate decisions to candidates (confirmations, rejections, next steps, interview invitations), use the Gmail integration to send emails directly.

### Prerequisites

- The Gmail integration must be connected. Use `searchIntegrations({ query: "gmail" })` to check availability.
- Follow the result, passing what it returns: use a connected integration directly, call `addIntegration` for one authorized on the account but not attached here, or call `ProposeIntegration` so the user can set it up.
- Use `listConnections('google-mail')` inside `"use impure"` to get credentials once connected.

### Email workflow

1. **Draft first, send second.** Always show the user the email content before sending, and wait for their explicit go-ahead in chat before each send.
2. **Personalize every email.** Reference the candidate's name, the specific role, and at least one detail from their CV (e.g., "your experience leading the migration at Acme Corp").
3. **Match tone to decision:**
   - **Advancing:** Warm, specific about why they stood out, clear next steps with timeline
   - **Rejection:** Respectful, brief, encouraging. Thank them for their time. Do NOT give detailed feedback on why they were rejected (legal risk). Keep it to 3-4 sentences.
   - **Hold/Waitlist:** Honest about timeline, express genuine interest, set expectations for when they'll hear back

### Email templates by type

#### Advancing to interview

- Subject: `Next steps — [Role Title] at [Company]`
- Body: Thank them, mention 1 specific thing from their background, explain the next step (phone screen / technical / panel), propose 2-3 time slots or link to scheduling tool, sign off warmly

#### Rejection

- Subject: `Update on your application — [Company]`
- Body: Thank them for applying, note the role was competitive, wish them well, 3-4 sentences max. No detailed feedback unless the user explicitly requests it.

#### Hold/Waitlist

- Subject: `Update on [Role Title] — [Company]`
- Body: Thank them, explain the timeline honestly, express continued interest, set expectation for next contact

### Sending via Gmail integration

```javascript
const result = await (async function() {
  "use impure";
  const conns = await listConnections('google-mail');

  if (conns.length === 0) {
    return { ok: false, reason: "No Gmail credentials available" };
  }

  const settings = conns[0].settings;

  // Use the Gmail API to send emails
  // Send only after the user's explicit go-ahead in chat

  return { ok: true };
})();
console.log(result);
```

### Rules

- Never send emails without the user's explicit approval in chat
- Always show the draft to the user first and let them edit if needed
- Send one email at a time, confirming each with the user (unless they explicitly approve batch sending)
- Include the user's name/signature in the from field, not the AI's
- Log all sent emails (recipient, subject, timestamp, decision type) for the user's records

---
name: google-ads
description: Use for every Google Ads request, including "connect Google Ads", read-only campaign status, daily budget, account health, reporting, attribution, creative, creation and management. Establish existing versus new account before proposing a connection. Read alongside the connector instructions. Return requested findings without routine no-change confirmations. For paid ads with no channel specified, use ads first.
---

# Google Ads

Carry out the customer's requested outcome, not a general onboarding checklist.
Read relevant project context before asking questions about it; account-only
work does not require a project. Use the connected tools' current schemas, not remembered
limits. Never claim an account, tag, campaign or result exists without evidence.

When reviewing or reusing an existing campaign, read its saved configuration.
Do not preview an update to an unchanged URL or other setting merely to check
readiness. Creation and update contracts can impose different restrictions;
report the relevant restriction without proposing an unrequested change.

When checking a destination and its creative URLs, run independent read-only
checks concurrently, not in a sequential fetch loop. Use bounded concurrency
(at most four requests), a per-request timeout (10 seconds) and
`Promise.allSettled` or equivalent so one failure does not hide other results.
Reuse successful checks for unchanged URLs within the current preparation;
report failures individually and resolve required failures before creation.
Keep dependent mutations and their readbacks ordered; never parallelize writes
merely to shorten the journey.

## Start with the connection

Before opening a connection card, establish whether the customer wants to connect
an existing Google Ads account or create a new one. A generic "connect Google Ads"
request does not specify that choice; ask with **AskQuestion** unless they already
specified it. Discover available integrations rather than guessing handles:

- Existing account: select `google-ads-oauth` and use ordinary `ProposeIntegration`.
- New account: select `google-ads-managed` only when live discovery offers it.
  Use the returned integration handle with ordinary
  `ProposeIntegration`; do not send `setupIntent` or other extra parameters.

The managed connector uses a separate creation flow, not OAuth.
Choosing "new" does not authorize campaigns or spending.
Do not silently substitute OAuth if managed creation is unavailable. Report the
limitation and offer Google's account-setup page instead.

Never retry account creation after an unknown outcome: repeated requests are not
deduplicated and could create another account. Follow the actual setup result:
after a successful connection completion, say it is connected and do not ask the
customer to create another account or repeat setup. Do not contradict successful
completion based on older skill/provider notes. If the server explicitly refuses
setup, report that refusal instead. Report account IDs and settings only when returned
by a verified result; connection completion alone is not an independent Google
account check.

Managed campaign access depends on the tools the live connection actually exposes.
If none are available, acknowledge the completed connection and explain that
campaign operations are unavailable without denying setup success.
For managed tools, use their server-bound account; do not use the OAuth account
selection or linking steps below, or invent customer/manager routing parameters.
Use only advertised tool schemas and do not infer Google verification or campaign
capabilities from connection completion.

### Existing-account OAuth selection

Explore the live tool contracts relevant to the customer's request before
recommending an executable plan. Use those contracts to determine the supported
actions and campaign types. Ask only for information or decisions the requested operation
needs, rather than completing a general readiness checklist.
Connection setup success does not prove campaign tools are available. If the
requested tool is absent, check current integration discovery once and follow
any returned loading or recovery instructions. If still unavailable, name the
blocked action and useful next step before collecting a campaign brief.
Do not repeat discovery without changed state, switch accounts, or invent API
paths to bypass missing tools. Offer a draft only as an explicitly labeled
alternative, not as completion of a creation request.
Follow the current surface's integration instructions to connect or reauthorize.
For a managed connection with a server-bound advertiser, verify that binding
through the available account-health tool and reuse it. Do not require OAuth
account discovery or linking tools that this connection does not expose. The
connector's display name, including "New Account", does not imply that every
call creates an account. Never change or invent a binding to work around access.

The following account-selection and linking steps apply to an OAuth connection
that exposes advertiser selection, not a managed server-bound connection.
OAuth connection setup does not save an advertiser selection. Before account-specific
work without an account chosen in this session, call `list_my_accounts`.
If `truncated` is true, disclose that the list is incomplete; do not invent
pagination arguments. Show the returned account names and customer IDs
in an **AskQuestion** selector and have the customer choose, even if only one
eligible advertiser is returned. Manager accounts are not selectable advertisers.
If listing fails, explain the returned
error; a failed read does not establish that the customer has no account.
If no eligible advertiser is returned or the customer says they have no account,
offer [Google Ads account setup](https://ads.google.com/home/) to create or finish
setting up an account, then list accounts again when they return. Describe an
empty result as "no accessible Google Ads accounts," not proof no account exists.
If they already have an account, suggest connecting the Google login with access.
Stop account-specific work until an eligible account is available and selected.

Save the chosen name, customer ID and `reached_through` as the session default,
not in the OAuth connection or shared settings. Associate the campaign brief
and project context with this selection. Pass `customer_id` on account-specific
calls, and non-null `reached_through` as `login_customer_id` only when advertised
by the live schema; omit it for direct access. If routing is unsupported, stop;
never guess a manager ID or fall back to direct access. Session selection does
not create a server-side account binding or replace Google authorization.
Do not change another context's selection.

### Link the selected advertiser

For an OAuth connection exposing `link_account`, as part of the customer's
requested connection setup, call `link_account` with
`mode: "commit"` for the selected advertiser, even if it may already be linked.
Follow the live schema and platform approval requirements without adding a
separate conversational confirmation. Preview is optional, not a prerequisite.
Do not bypass access checks, required approvals or an explicit refusal to link.
Linking does not authorize campaign changes or spending.

Proceed only on `linked` or `already_linked` (a no-op). Otherwise follow the
returned user instructions and next step; do not repeatedly submit requests or
claim success. After `linked` or `already_linked`, continue the requested work.
Mention a newly established link in the result when relevant; an existing link
needs no separate confirmation or announcement. On failure or missing tooling, stop dependent work and state the
blocker. Never substitute an account, create a new one or alter the shared OAuth
connection to bypass it.

Before switching, confirm the target name and customer ID and whether it is a
one-action override or the new default for future actions. Resolve it against
the available account list; ask when scope is unclear, never guess IDs. After a
one-action override, return to the session default. If access is lost, stop;
never substitute another account.

Use the customer's authorized target, changes and budget. Ask when those decisions
are missing or materially change; do not ask again for unchanged intent.
Account selection and OAuth consent alone do not authorize campaign spending.
Respect server-side access checks and platform/tool approvals on every operation.

Never request OAuth secrets or developer tokens. Use only callable tools, not
guessed names. An OAuth connection alone does not authorize account creation.
For new accounts, confirm currency and timezone before any supported creation.
Never promise promotional credit or deduct it from the approved budget.

For project-specific work, read
`.local/secondary_skills/ads/references/project-context.md`. Reuse the chosen
business and approved brief. Account-only reads do not require a project.
Clarify whether “launch” means publishing the app or enabling ads when unclear.

When no destination is selected, discover the customer's accessible projects
before asking for a URL. Offer project titles with verified publishing status,
an option to create a new project, and an external website option. An empty
listing does not establish that no project exists; accept a direct project link.
For a requested new landing page, build a runnable page, not only a Design mockup.
Do not treat an editor URL as an ad destination or publish without authorization.

## Customer communication

Use **AskQuestion** forms for customer decisions, not a list of questions in
chat. Discover facts first, then batch related missing campaign details into one
short form with typed fields: choices for goals and locations, text for creative,
and a number for daily budget with the account currency stated. Prefill known,
approved values; distinguish suggestions from authorized settings. Do not ask
again for information or approval the customer already supplied.

For an unresolved creation decision, use a prefilled review form (`review: true`)
with an editable campaign-name field and other missing essentials. Explain the
selected account, destination, creative, targeting,
currency, daily budget and proposed PAUSED state before submission. Keep optional
details out of the critical path. Use revisable steps only when later choices
depend on earlier answers, carrying answers forward rather than restarting intake.
If the customer has already supplied the required inputs and authorization,
execute instead of presenting another review form.

A form default or project selection is not spending approval. Obtain explicit
authorization for activation and budget increases; do not preselect consent.
Honor existing authorization within its exact scope without duplicate forms.
Before a form, explain the recommendation and consequential tradeoffs in plain
language. After a write, lead with the verified outcome, then a compact summary
of saved settings, blockers and the next useful action. Separate PAUSED/ENABLED
from serving eligibility, and tracking configuration from verified attribution.
Use tables for comparable metrics, not raw provider payloads or long transcripts.

Perform routine reads without narrating MCP, tool names or implementation details.
Answer a read-only request with its findings, not boilerplate such as "No changes
were made" or "I haven't enabled spending." Do not ask for confirmation after a
read, an unchanged setting or a successful no-op. Mention non-execution only when
the customer requested a write that was blocked, a result is uncertain, or the
distinction prevents a material misunderstanding. Never imply a requested action
completed when it did not. After a write, report the verified state once; do not
add a second acknowledgement question. Keep required approvals before writes.

## Create a campaign

Before campaign preparation, read
`.local/secondary_skills/google-ads/references/campaign-guidance.md` for the
customer-facing setup overview, progress updates and Performance Max explanation.
Keep these explanations brief; they are not additional approval checkpoints.

1. **Suggest the plan.** Use the business, landing page and available assets to
   propose the audience, locations, language, conversion goal and creative.
   Ask only about missing information. Recommend a suitable campaign type
   supported by the live creation tools. If the user requests an unsupported type,
   explain what cannot be created here; do not silently substitute another type.
2. **Suggest a budget.** For USD accounts, suggest $20/day as a starting point
   and require at least $15/day for campaign creation here, not a universal
   Google Ads requirement or a performance promise. Read supported budget fields,
   limits and defaults from the live contract and honor any stricter minimum.
   Let the customer choose and never raise spend without authorization, including
   to meet the minimum. If their budget is below $15/day USD, explain the minimum
   and do not proceed with campaign creation until the customer authorizes a
   budget of at least $15/day USD that also meets the live tool's requirements.
   Only create campaigns for USD accounts. Do not convert the budget or change
   the account's currency to proceed.
3. **Handle measurement when relevant.** For requested tracking work or a returned
   tool requirement, read
   `.local/secondary_skills/google-ads/references/measurement.md`. Inspect
   existing actions and site tracking before adding anything. Use
   `setup_conversions` when callable and authorized. Suggest a
   lead value from the business's economics and explain the assumptions;
   ask for missing inputs such as customer value and lead-to-customer rate.
   A tool minimum is not proof of a lead's value. Do not invent purchase
   tracking unless the live tool supports it.
4. **Prepare inputs.** Rely on the live creation contract and tool responses
   for requirements and defaults.
   Reuse unchanged, authorized targeting, language, budget and creative choices.
   Collect genuinely missing decisions together rather than repeating intake.
   Distinguish tool warnings from errors: missing billing or conversion goals
   may warn without preventing paused creation. Do not turn those warnings into
   additional gates; Google validation still decides whether the request is valid.
   A development destination accepted for a paused test is not a production-ready
   destination and does not authorize publishing or enabling ads.
   Inspect actual assets and use the tool call supported validation flow.
   Correct inputs from returned errors rather than inventing additional limits.
   Do not claim a text mockup is Google's rendered ad or policy approval.
5. **Execute and handle the result.** Carry out the authorized request through
   the live tool's required flow, including preview/commit or platform approval
   when required. Do not add an independent review or validation checkpoint.
   Once inputs and authorization are sufficient, create the campaign rather than
   returning another plan or asking whether to proceed again. Verify the saved
   campaign identity and requested settings from the result or a targeted read.
   Use descriptive tool errors to correct inputs; ask only for missing customer
   decisions and never fabricate authorization fields.
6. **Reach the requested state.** If creation returns a paused campaign and the
   customer authorized enabling it with the specified budget, continue through
   the supported enable operation and its required approvals. Otherwise leave it
   paused. Do not impose a separate measurement-verification launch gate; handle
   actual tool blockers. Report the confirmed resulting state, distinguishing
   enabled from serving and tracking configured from verified.

An average daily budget is not a hard daily cap.
Confirm an end date or explain that ads run until paused; never promise an
unenforced total-spend cap or automatic stop.

For EU targeting, ask whether unclear content concerns elections, parties or
political causes. Follow the live tool's declaration and applicable policy
requirements in all cases. Never guess a required declaration.

## Manage a campaign

For pause, resume, budget or creative changes, go directly to that task; do not
repeat the full intake. Identify the account and campaign and execute the
authorized change through the live tool contract and required platform approvals.
Ask about missing or changed scope, not for repeated approval of unchanged intent.
Do not require tracking setup or a paid conversion as an extra execution gate.

After a timeout or uncertain write, verify the result before retrying. Report
uncertainty rather than claiming success or assuming nothing changed.

## Report results

For attribution questions, distinguish configured conversion actions, observed
site events and conversions attributed by Google. Inspect existing site tracking
when relevant; do not infer it works from an enabled action or zero conversions.
Use only attribution dimensions the live reporting contract exposes: campaign
totals do not establish credit for a particular headline, image or ad combination.
Never generate fake ad clicks or purchase events to make a report look successful.
For site-event verification, use the existing measurement reference and reuse
available test harnesses rather than rebuilding them on every request. Check
consent, parameter persistence, event destination, value/currency, transaction-ID
deduplication and withdrawal when relevant. Isolate synthetic fixture events
from Google and production analytics. Report configuration, isolated behavior
and Google-reported attribution separately; pending traffic or processing is
not a passing live-attribution result.

Use the requested dates, account timezone and currency. Report only available
metrics; distinguish zero from missing or untracked data. Campaign listing
alone is not performance reporting. Label calculated metrics and avoid division
by zero. Report policy and incentive status only when actually returned.

Use `get_account_health` when callable for the diagnostics it provides. Zero
conversions alone does not prove tracking is broken. Explain reporting delays
and investigate the action, event and consent behavior before drawing conclusions.

## Always

- Stay within the customer's authorized scope; campaign requests do not authorize
  unrelated site edits or additional spending. Preserve platform/tool approvals.
- Install only verified Google-provided tags; never derive IDs or labels.
- Keep credentials, payment details and customer PII out of chat and logs.
- If a capability is missing, deliver a clearly labeled draft or useful reads,
  and name the blocked action. Never simulate success or deploy a workaround.

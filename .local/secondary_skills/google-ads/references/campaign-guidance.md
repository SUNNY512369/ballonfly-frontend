# Make campaign setup understandable

Use for creation requests, not routine reporting or edits. Follow the live
contracts for supported campaign types, requirements and defaults.

## Explain the path, then carry out the request

After discovering capabilities and existing project context, give a short
overview before preparing assets: what you can reuse, what is genuinely missing,
the proposed or authorized budget, and the remaining steps to the requested
paused or enabled state. Explain how the customer can check spend and results
using reporting available here. Do not promise a dashboard or monitoring that
does not exist. Do not turn the overview into another approval question.
Use plain Markdown: at most two sentences for the overview or PMax explanation,
and one sentence for each progress update. Expand only if the customer asks.

For example, adapt to the actual state:
“I'll reuse your website's product details and images, prepare the missing ad
text, then create the campaign paused at your approved $20/day average budget.
I'll report what was saved and what's left before ads can run. You can ask here
for spend and results once reporting is available.”
Do not call an average daily budget a hard daily cap.

Prefill from verified project/page content and reuse suitable existing assets.
Identify suggested copy as a draft; do not invent business claims. Generate
only missing campaign assets needed for the request, explaining their purpose
before starting substantial work. A campaign request is not a request to build
a new app, contact form or landing page. Keep optional site improvements out of
setup unless requested; if a live tool requires a site change, explain the
specific gap and obtain any missing authorization for that change.

At meaningful milestones, briefly state what is complete, what is next and any
real blocker. Use customer terms such as “ad text prepared” or “campaign created
and paused,” not tool names. Do not narrate every read or repeat the whole plan.
Distinguish prepared assets from a saved campaign, and enabled from actually
serving. Continue within existing authorization without repeated confirmations.

When activity-board progress cards are available, use them to show the current
campaign-creation stage rather than repeating progress in chat. Read the current
board and update one campaign-scoped item, preserving unrelated work and its ID:
“Preparing campaign details and assets,” then “Creating the campaign,” then
“Campaign created — paused” or “Campaign enabled,” only as results confirm.
Put the stage in the item's detail and the next useful action in the card.
Follow the surface's board-state rules; a confirmed campaign result does not
automatically mean the customer has accepted the work. Keep a blocked stage
visible with the specific action needed. Never label enabled as serving without
evidence, mark future stages complete, or make a card an extra approval gate.
Use the available `readActivityBoard` and `appendProgressNote` callbacks according
to their contracts; if unavailable, use a one-line Markdown status instead.

Finish with the confirmed campaign state, saved budget, remaining action if any,
and how to request available spend and performance reports or pause the campaign.
Do not present unavailable metrics as zero or promise results.

## Explain Performance Max when it is proposed

Explain once, in plain language, when the live contract supports PMax and it is
recommended or selected. Adapt to the customer's familiarity:

“Google combines your headlines, descriptions and images into different ads
across Search, YouTube and other Google channels, optimizing toward your goal,
such as leads or sales. We prepare the inputs and settings; Google decides which
combinations to serve.”

It optimizes toward conversions or conversion value, not merely maximum
exposure, and does not guarantee leads or sales. Search themes and audience
signals, when supported, guide learning; they are not a fixed keyword list or
a promise that ads appear only for those searches or audiences.

Distinguish combining supplied assets from generating new ones. Describe
additional text generation, video creation or final URL expansion as enabled
only when the actual settings or tool results establish that. Explain relevant
effects, such as Google creating text from the site or choosing another landing
page, without claiming these options are available through our integration
merely because Google supports them.

PMax can include Search inventory but is not a Search-only campaign. If the
customer requests Search-only or exact control over a final ad, explain the
difference and available options; do not silently substitute PMax. Capability
discovery still decides what can be created.

Source: [Google Ads — About Performance Max](https://support.google.com/google-ads/answer/10724817).

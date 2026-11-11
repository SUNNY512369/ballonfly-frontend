# Resolve the business or project to promote

Read before campaign preparation, and reuse the resulting brief for edits and
project-specific reporting. This is separate from selecting a Google Ads
customer account or campaign. An account name is not a project reference.
Account-only discovery/status requests do not require a project picker.

## Resolve once, from strongest context first

1. Reuse the initial prompt and any approved brief: named business/product,
   explicit project, URL, audience, goal, spend and assets. Do not make the user
   repeat explicit intent or select an already unambiguous project again.
2. Classify a supplied URL before using it. A Replit project/editor link is a
   project reference, not an advertising destination: use the user-supplied
   reference unchanged for supported project inspection, then obtain the
   project's actual public deployment/landing page. Never send ad traffic to
   an editor, project-management page or login page. Resolve the published URL
   using the lookup below before asking the user; do not deploy or edit the
   site automatically.
   For a supplied public website/app URL, retrieve that page read-only with
   available web tools and preserve it as the proposed landing page. Distinguish
   observed page facts from the user's intended offer, audience and advertising
   geography. A published URL is not an editor reference, proof of ownership,
   or permission to edit the site. If retrieval fails, say which details are
   unverified and ask only for necessary gaps; do not invent page content.
3. Resolve a named project or offer available projects for selection only when
   the target is missing or ambiguous. Show returned titles and enough context
   to distinguish candidates, not a new-project creation flow.


Use the current project's instructions, accessible product content, deployment
metadata and assets if it is the unambiguous target. If the user specifies a
different project or site, do not silently substitute the current project.
Use available platform project-discovery tools for a named target or picker;
pass returned references unchanged. If discovery is unavailable here, say so
and ask for the project/editor link or use the explicitly supplied public URL
as a site-only target. Never derive an editor reference from an app URL.


4. If both project and public landing-page URL are supplied and appear unrelated, explain the
   mismatch and confirm which business/destination to promote. Do not replace
   the explicit URL with a project's default deployment without confirmation.
5. Bind an existing campaign to its already known project/site and Ads account.
   A campaign's landing page alone is not evidence of project ownership. For
   pause/status requests, resolve only the context needed to identify the
   correct campaign; do not demand a fresh creative/offer questionnaire.

## Look up the published destination

For a selected project without an explicit landing-page URL:

Call `getDeploymentInfo({})` only when the selected project is the current
project. It cannot look up another project named in the prompt; for another
project, use its accessible metadata or ask for its public URL instead.

Check callback availability before calling. The lookup has no project argument
and reads the active project target, not a project mentioned in the prompt.
Do not treat a missing URL in project discovery or source files as evidence that
the project is unpublished.

When the lookup succeeds and reports `isDeployed` with public visibility,
retrieve its `primaryUrl` with available web tools and reuse it as the proposed
destination. Preserve an explicit customer-supplied destination instead of
replacing it. Use `additionalUrls` only when needed to resolve a destination
ambiguity; never construct a hostname from a project title.

If the lookup is unavailable, denied, or fails, explain that the URL could not
be verified, not that the project is unpublished. Ask for a public URL only
when accessible metadata and existing context cannot resolve it. An unpublished
or private project needs a public destination; do not publish it or change its
visibility as part of this read.

## Brief to carry between flows

Maintain a compact project/campaign-scoped record, with these logical fields.
This is a handoff shape, not an implemented storage API or file path:

| Field | Contents |
|---|---|
| Scope | Workspace/authorized integration, selected project reference or site-only identity, Ads customer ID and campaign ID when known |
| Business | Promoted product/service, business name, offer/pricing and key claims |
| Destination | Exact landing page and relevant conversion point |
| Intent | Intended audience, geographic scope and language, campaign goal and customer-selected campaign type; distinguish planning from supported execution |
| Spend | Daily budget, currency and any explicitly approved change |
| Creative | Brand/logo, source assets, asset usage rights/approval and creative review state |
| Measurement | Existing conversion actions, measurement source, event-verification evidence, campaign-goal linkage and known gaps |
| Provenance | Per-field source and observation time; user-specified/user-confirmed intent versus observed facts versus proposed defaults |
| Review | Brief revision, outstanding questions, exact reviewed settings and approval scope |

Example: "Promote my pottery classes at this URL, $25/day in Austin" supplies
product, destination, USD only if the currency was explicit or confirmed,
budget amount and intended city. The site's Spanish copy is an observation,
not permission to target Spanish speakers or all Spanish-speaking countries.
Ask about missing currency/language only when needed for the next action.

## Reuse without leaking context

- Use an existing authorized project/campaign-scoped persistence mechanism if
  exposed. Verify it wrote successfully before claiming saved context. If none
  exists, keep a scoped brief in this conversation and disclose that cross-session
  reuse is unavailable; do not invent a callback, database or hidden file.
- Never store this record in personal `profile.md` or global cross-project
  memory. Do not put account IDs, budgets or campaign intent in shared project
  instructions merely to make them persistent.
- Key reuse to the workspace/integration, project/site and Ads customer/campaign
  together. Clear incompatible account/campaign linkage and approval on a scope
  switch. Do not reuse another project's assets, targeting or budget.
- On later edits or reports, reuse confirmed fields. Refresh live Ads status
  and verify the linkage; ask only about ambiguity or material changes to
  product, landing page, offer, audience, geography, language, goals, assets or
  spend. New scope or changed settings require a new mutation approval.
- A brief approval authorizes preparation, not upload, linking, campaign
  creation, activation, spending or a site edit.

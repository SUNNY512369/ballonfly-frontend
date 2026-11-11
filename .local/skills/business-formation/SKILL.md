---
name: business-formation
description: Register a business, form a company or LLC, or incorporate through Stripe Atlas, even when no provider is named. Clarify requests to "set up my business" or "make it official". Not for website signup, domains, business licenses, or adding payments.
---

# Business formation

## Check fit

Stripe Atlas's `atlas_company_formation` starts or resumes a **Delaware C corporation or LLC** formation ([Stripe docs](https://docs.stripe.com/mcp#tools)).

- Clarify ambiguous business setup before proposing formation. Answer informational questions without starting an application; existing-entity tax registration and payment setup do not require reincorporation.
- Ask the formation jurisdiction if unknown; do not infer it from residence or substitute Delaware for another jurisdiction without agreement.
- Respect the user's provider and entity preferences. Do not choose an entity type or give personalized legal/tax advice; suggest qualified advice when needed.
- Check Stripe's [application requirements](https://docs.stripe.com/atlas/signup) and [restricted businesses](https://support.stripe.com/questions/stripe-atlas-restricted-business-categories) before starting; Stripe determines eligibility.

## Discover and connect

Use **Stripe MCP**, not the app-scoped Stripe merchant connector, Stripe Link, or the payment-implementation workflow. No app, SDK, database, or project handoff is needed.

Read the `integrations` skill for discovery, connection, loading, and credential recovery. Search for "Stripe MCP company formation Atlas", select the MCP route, and reuse an authorized connection. Respect a declined connection.

Read the connected provider's generated skill for `atlas_company_formation`, including its schema and side effects. Use only the callback actually exposed in this session; its name depends on the connection.

## Start or resume with the user

- Do not assume the first call is read-only. Before sharing formation details or creating/updating an application, explain the action and obtain approval unless already authorized; ask if side effects are unclear.
- Let Stripe collect identity documents, tax identifiers, payment details, and signatures in its secure flow, not chat. Preserve provider review steps; accepting terms, signing, paying fees, and submitting filings each require explicit authorization.
- Resume an existing application where supported. After an uncertain write, check status before retrying to avoid duplicate applications.
- Report the returned stage; an application link is not proof of incorporation.

## Missing tools and failures

A connected Stripe account does not guarantee Atlas availability or eligibility. If the tool is absent or permission-denied, report Stripe's actual response without guessing account-role requirements or repeatedly reconnecting. Offer [Stripe Atlas](https://stripe.com/atlas) as a manual fallback and state whether anything was submitted.

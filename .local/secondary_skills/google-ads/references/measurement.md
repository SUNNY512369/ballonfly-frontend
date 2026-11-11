# Google Ads website measurement

Use this reference after selecting the account and intended conversion action.
Creating or changing an action and editing a website require their respective
approvals. Reuse existing suitable Google tag or Google Tag Manager setup.

## Obtain the account-specific instructions

Prefer snippets returned for the selected action by the connected tools.
Google documents querying conversion action settings and tag snippets through
its API; that does not imply the connected MCP exposes the query. Inspect the
live schema first and use only authorized, available reads. Verify the conversion
owner, including manager-owned cross-account tracking, without bypassing the
connection's actual authorization constraints.

If the tool cannot retrieve snippets, guide the customer to the selected
conversion action's tag setup in Google Ads. Use Google's current instructions:

- [Google tag and event snippets](https://support.google.com/google-ads/answer/7548399)
- [Conversion actions and tag snippet retrieval](https://developers.google.com/google-ads/api/docs/conversions/getting-started#inspect-conversion-actions)
- [Verify conversion actions with Tag Assistant](https://support.google.com/google-ads/answer/10989978)

Do not derive a tag ID or conversion label from the Ads customer ID, campaign ID
or project ID. Do not add a second tag installation when an existing tag/GTM
container can be configured appropriately.

## Illustrative examples, not install-ready snippets

For a site without an existing tag, Google's documented pattern is:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-CONVERSION_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'AW-CONVERSION_ID');
</script>
```

An event snippet identifies the selected conversion action:

```javascript
gtag('event', 'conversion', {
  send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL'
});
```

These placeholders must be replaced with verified Google-provided values before
any authorized installation. Use the actual action's returned snippet and
approved value/currency settings, not these examples as universal configuration.
For a lead, fire only after successful submission, not every submit-button
click or failed request. For purchase tracking, require a supported purchase
action and approved dynamic value/currency and transaction-ID handling; the
lead-only setup tool does not establish that support. Never send customer PII
in event parameters or URLs.

Respect the site's consent management and applicable Google consent requirements
before loading/firing tags. Use the existing framework/GTM integration; do not
paste duplicate script blocks across SPA routes or bypass consent to get a test
to pass.

## Describe measurement evidence

Report the confirmed measurement state: configured, verified firing, or recording
conversions. Don't claim more than the evidence supports. Missing independent
verification does not block campaign creation or launch; follow the live tool's
requirements.

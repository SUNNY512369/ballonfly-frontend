# URL-parameter invoice template (Approach A)

Read this when building the standalone HTML template (`client/public/invoice-template.html`) that serves many clients from one file.

This is the cleanest pattern for subscription/SaaS invoices. Every field that varies per client is a query param; everything that belongs to the seller is hardcoded.

## Supported parameters

| Param | Description | Default |
|-------|-------------|---------|
| `client` | Client / company name | "Client Name" (shown in amber as warning) |
| `email` | Client email address | empty |
| `inv` | Invoice number | `PREFIX-YYYY-0001` |
| `date` | Invoice date (ISO: YYYY-MM-DD) | today |
| `due` | Due date (ISO: YYYY-MM-DD) | today + 30 days |
| `period` | Service period label | next calendar month |
| `amount` | Line item amount | plan default |
| `plan` | Plan name label | "Pro" |
| `stripe` | Stripe payment link URL | placeholder (shown dimmed) |

## Example parameterized URL

```text
https://nido.com.do/invoice-template.html
?client=Familia+García
&email=garcia@email.com
&inv=NiDO-2026-0014
&date=2026-04-01
&due=2026-05-01
&period=April+2026
&amount=35
&plan=Pro
&stripe=https://buy.stripe.com/abc123
```

## URL parsing boilerplate

```javascript
function parseParam(name, fallback) {
  const v = new URLSearchParams(window.location.search).get(name);
  return (v && v.trim()) ? v.trim() : fallback;
}

function parseDate(param, fallback) {
  const raw = new URLSearchParams(window.location.search).get(param);
  if (raw && raw.trim()) {
    const d = new Date(raw.trim() + 'T12:00:00'); // noon avoids TZ off-by-one
    if (!isNaN(d)) return d;
  }
  return fallback;
}
```

## Always show the shareable URL in the UI

Add a URL display bar above the invoice so the user can see and copy the full parameterized link:

```html
<div class="print-bar">
  <div class="url-display" id="url-display" onclick="copyLink()" title="Click to copy">
    <svg><!-- link icon --></svg>
    <span id="url-text">loading…</span>
  </div>
  <button class="btn-copy" onclick="copyLink()">Copy Link</button>
  <button class="btn-print" onclick="window.print()">Download / Print PDF</button>
</div>
```

```javascript
// Show the actual full URL so user can copy and send it
document.getElementById('url-text').textContent = window.location.href;
```

The URL bar should be hidden in `@media print`.

## Stripe payment link pattern

Make the Stripe URL a query param so each invoice can have a unique checkout link:

```javascript
const stripeUrl = parseParam('stripe', 'https://buy.stripe.com/your-link');
const stripeEl = document.getElementById('stripe-link');
stripeEl.href = stripeUrl;

// Visually dim the link if it's still a placeholder
if (stripeUrl === 'https://buy.stripe.com/your-link') {
  stripeEl.style.opacity = '.5';
  stripeEl.title = 'Add ?stripe=YOUR_LINK to set the real payment URL';
}
```

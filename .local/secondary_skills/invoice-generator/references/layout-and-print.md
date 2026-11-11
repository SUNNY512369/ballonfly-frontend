# Invoice page layout, auto-scale, and print styles

Read this before writing the invoice markup and CSS, for either approach. It covers the page boundary and auto-scale logic, the section layout, and print styles.

## Page cutoff / auto-scale logic

This is the most important implementation detail. Use a **two-layer structure**:

1. **`.invoice-page`** — fixed `height: 1056px` (Letter) or `height: 1122px` (A4), `overflow: hidden`. This is the page boundary.
2. **`.inv-scaler`** — inner wrapper, `min-height: 1056px`, `display: flex; flex-direction: column; transform-origin: top left`. This holds all content and gets scaled.

### CSS

```css
.invoice-page {
  width: 816px; /* 8.5in at 96dpi */
  height: 1056px; /* 11in at 96dpi — Letter */
  overflow: hidden;
  position: relative;
}

.inv-scaler {
  width: 100%;
  min-height: 1056px; /* Fills page by default so footer stays at bottom */
  display: flex;
  flex-direction: column;
  transform-origin: top left;
}
```

### JavaScript scaleToFit function

```javascript
function scaleToFit() {
  const page = document.querySelector('.invoice-page');
  const scaler = document.querySelector('.inv-scaler');
  if (!page || !scaler) return;

  // Reset any existing transform so we measure true content height
  scaler.style.transform = 'none';
  scaler.style.width = '100%';

  const pageH = page.clientHeight; // 1056px
  const contentH = scaler.scrollHeight;

  if (contentH > pageH) {
    const scale = pageH / contentH;
    scaler.style.transformOrigin = 'top left';
    scaler.style.transform = `scale(${scale})`;
    // Compensate horizontal shrink so content stays full-width visually
    scaler.style.width = `${100 / scale}%`;
  }
}

// Run on load, after fonts resolve, on resize, and via safety timeouts
scaleToFit();
document.fonts.ready.then(scaleToFit);
window.addEventListener('resize', scaleToFit);
setTimeout(scaleToFit, 300);
setTimeout(scaleToFit, 1000);
```

**Why `min-height` on `.inv-scaler`?** Without it, `flex: 1` on `.inv-body` does nothing (no constrained parent height), and the footer won't stick to the bottom of short invoices. With `min-height: 1056px`, the scaler always fills the full page — footer stays at the bottom — and only grows taller if content genuinely overflows, at which point `scaleToFit` shrinks it back.

## Layout structure

```html
<div class="invoice-page">
  <div class="inv-scaler">
    <!-- Teal/brand header bar -->
    <div class="inv-header">
      Logo + "INVOICE" title + invoice number
    </div>

    <!-- Accent stripe (thin colored bar below header) -->
    <div class="accent-stripe"></div>

    <!-- Main content -->
    <div class="inv-body">
      <!-- Two columns: From (seller) / Bill To (client) -->
      <div class="parties">...</div>

      <!-- Invoice date / service period / due date / payment terms -->
      <div class="dates-row">...</div>

      <!-- Line items table -->
      <table>Description | Plan | Qty | Rate | Amount</table>

      <!-- Subtotal / Tax / Total -->
      <div class="totals-section">...</div>

      <!-- How to pay (Stripe link, bank details, contact email) -->
      <div class="payment-box">...</div>

      <!-- Footer: seller brand + late fee policy -->
      <div class="inv-footer">...</div>
    </div><!-- /inv-body -->
  </div><!-- /inv-scaler -->
</div><!-- /invoice-page -->
```

## Print styles

```css
@page { size: letter; margin: 0; }

@media print {
  body { background: #fff; padding: 0; }
  .print-bar { display: none; } /* Hide URL bar and buttons */
  .invoice-page {
    width: 100%;
    height: 100vh;
    box-shadow: none;
    overflow: hidden;
  }
}
```

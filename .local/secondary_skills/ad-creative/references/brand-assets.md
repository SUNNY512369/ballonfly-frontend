# Brand Colors and Logo Extraction

Read during brand research, before writing subagent tasks: it covers extracting real brand colors from the site's CSS and extracting, verifying, and embedding the brand's actual logo.

## Extract real brand colors from the site (mandatory)

Do not trust web search results for colors -- they are frequently wrong. Instead, fetch the actual CSS from the brand's website:

```bash
curl -s -L "https://brand.com" | grep -iE '(theme-color|TileColor|mask-icon.*color)' | head -5
curl -s -L "https://brand.com" | tr -d '\n' | grep -oP 'href="[^"]*\\css[^"]*"' | head -3
curl -s "https://brand.com/path/to/style.css" | grep -oP '#[0-9a-fA-F]{3,8}' | sort -u
```

## Brand Logo Extraction

Always use the brand's actual logo -- never substitute plain text for a logo.

**Step 1: Extract the SVG directly from the brand's website.** This is the most reliable method -- the actual logo is already embedded in their HTML:

```bash
curl -s -L "https://brand.com" | tr -d '\n' | grep -oP '<svg viewBox="[^"]*"[^>]*>.*?</svg>' | head -1 > /tmp/brand-logo.svg
wc -c /tmp/brand-logo.svg
```

Should be over 1KB for a real logo.

**Step 2: Verify the extracted SVG path data is complete.** SVG path data can be silently truncated during shell extraction. Always verify the max coordinates fit within the viewBox:

```bash
node -e "
const fs = require('fs');
const svg = fs.readFileSync('/tmp/brand-logo.svg', 'utf8');
const dMatch = svg.match(/d=\"([^\"]+)\"/);
if (dMatch) {
  const d = dMatch[1];
  console.log('Path data length:', d.length);
  console.log('Last 80 chars:', d.slice(-80));
  const nums = d.match(/[\d.]+/g).map(Number);
  const maxX = Math.max(...nums.filter((_, i) => i % 2 === 0));
  console.log('Max X:', maxX);
}
"
```

If path data length is under ~2000 characters for a wordmark logo, the data was likely truncated. Re-extract with a larger buffer.

**Step 3: Embed inline.** Embedding the SVG directly in the HTML avoids file permission issues, eliminates loading delays, and scales perfectly:

```html
<svg viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg"
  style="height:5vh;width:auto;">
  <path fill-rule="evenodd" clip-rule="evenodd" d="..." fill="white"/>
</svg>
```

Use `fill="white"` on dark backgrounds, `fill="#BrandDarkColor"` on light backgrounds.

**Step 4: Position the logo top-left, not centered.** The logo should sit in the top-left corner as part of the visual hierarchy. Do not center-align logos -- centered layouts look generic and reduce brand recognition.

**Fallback: If the website doesn't have an inline SVG**, search for `[brand] logo SVG site:wikimedia.org OR site:brandfetch.com`. As a last resort, use a logo + wordmark pattern with the brand's font.

## Logo image files

**If using an image file for the logo**, always use both max-width and max-height together:

```css
.logo-img {
  max-width: 38vw;
  max-height: 12vh;
  width: auto;
  height: auto;
  object-fit: contain;
}
```

Never use `width: Xvw; height: auto` alone on a square logo -- at width 38vw, a square image is also 38vh tall and will overflow its container into content below.

Logo images have built-in padding. The visible logo mark may only occupy 50-70% of the image dimensions. Size the image larger than you'd expect.

### Logos without transparent backgrounds

| Scenario | Strategy |
|---|---|
| Ad bg color matches logo bg exactly | Use that logo version -- backgrounds blend seamlessly |
| White ad background | Use white-background logo + mix-blend-mode: multiply |

```css
.logo-img { mix-blend-mode: multiply; }
```

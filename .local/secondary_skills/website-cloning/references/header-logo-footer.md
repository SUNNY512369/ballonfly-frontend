# Logo, Header, and Footer Extraction Scripts

Read this during Phase 1 when you reach `SKILL.md` sections 1.7 (SVG logo), 1.9 (header deep extraction) and 1.10 (footer links).

## SVG Logo Search

Search `raw.html` for the inline SVG near logo references. Use the real `<path>` elements it finds; never substitute an SVG `<text>` element.

```bash

# Search raw HTML for SVG near logo references

python3 -c "

with open('clone-data/raw.html') as f:

html = f.read()

# Search around 'logo' class references

import re

for m in re.finditer(r'logo', html[:15000], re.IGNORECASE):

idx = m.start()

# Look for SVG nearby

svg_start = html.find('<svg', max(0, idx-200))

if svg_start != -1 and svg_start < idx + 500:

svg_end = html.find('</svg>', svg_start) + 6

print(html[svg_start:svg_end])

break

"

```

## Header Deep Extraction

Captures the banner text, banner background and text colors, logo position (left, center or right), nav links, and right-side account, rewards, search, cart and wishlist elements:

```python

header_info = page.evaluate("""

() => {

const header = document.querySelector('header');

if (!header) return null;

// Banner/announcement bar

const banner = document.querySelector('[class*="banner"], [class*="announcement"], [class*="uni-banner"]');

const bannerBg = banner ? getComputedStyle(banner.querySelector('[class*="col"], div') || banner).backgroundColor : null;

// Logo position

const logo = header.querySelector('svg, [class*="logo"] img, [class*="logo"] svg');

const logoRect = logo?.getBoundingClientRect();

const headerRect = header.getBoundingClientRect();

// Nav links

const navLinks = [...header.querySelectorAll('nav a, [class*="nav"] a')].map(a => a.innerText.trim()).filter(t => t && t.length < 30);

// Right-side elements (account, rewards, search, cart, wishlist)

const rightElements = [...header.querySelectorAll('[class*="loyalty"], [class*="rewards"], [class*="account"], [class*="cart"], [class*="wishlist"]')];

return {

bannerText: banner?.innerText?.trim(),

bannerBgColor: bannerBg,

bannerTextColor: banner ? getComputedStyle(banner).color : null,

logoPosition: logoRect ? (logoRect.left < headerRect.width / 3 ? 'left' : logoRect.left < headerRect.width * 2/3 ? 'center' : 'right') : 'unknown',

navLinks: navLinks.slice(0, 10),

rightSideText: rightElements.map(el => el.innerText?.trim()).filter(t => t),

rightSideHTML: rightElements.map(el => el.innerHTML?.slice(0, 300)),

};

}

""")

```

## Footer Link Extraction

Extract all footer links separately; the footer component needs them:

```python

footer_data = page.evaluate("""

() => {

const footer = document.querySelector('footer');

if (!footer) return null;

return {

text: footer.innerText,

bgColor: getComputedStyle(footer).backgroundColor,

links: [...footer.querySelectorAll('a')].map(a => ({

text: a.innerText.trim(), href: a.getAttribute('href')

})).filter(l => l.text)

};

}

""")

```

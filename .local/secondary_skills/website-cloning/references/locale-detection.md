# Locale Detection Script

Read this when the target URL has a locale path (for example `/es-do`, `/fr`, `/de`, `/ja`). Run it after `page.wait_for_timeout(8000)` so client-side JavaScript has time to localize the page, then follow the language rules in `SKILL.md` section 1.2.

It extracts the visible text from the banner, nav links, loyalty/rewards UI and header, plus `<html lang>` and the final URL:

```python

locale_info = page.evaluate("""

() => ({

bannerText: document.querySelector('[class*="banner"], [class*="announcement"]')?.innerText?.trim(),

navLinks: [...document.querySelectorAll('nav a, .main-nav a')].map(a => a.innerText.trim()).filter(t => t).slice(0, 8),

loyaltyText: document.querySelector('[class*="loyalty"], [class*="rewards"]')?.innerText?.trim(),

headerText: document.querySelector('header')?.innerText?.trim()?.slice(0, 500),

htmlLang: document.documentElement.lang,

url: window.location.href

})

""")

```

# Canvas Layout and Export

Read when placing finished ad iframes on the canvas, or when the user wants PNG exports at specific pixel sizes.

## Canvas Layout

Place ad iframes side-by-side in a row for easy comparison. Use square iframes (600x600) so they fit on the canvas without clipping. Space them with ~50px gutters:

```text
x=0, y=0: [Iframe: Angle 1] (600x600)
x=650, y=0: [Iframe: Angle 2] (600x600)
x=1300, y=0: [Iframe: Angle 3] (600x600)
```

**For portrait/stories ads (9:16):** Use 608x1080 iframes:

```text
x=0, y=0: [Iframe: Story 1] (608x1080)
x=658, y=0: [Iframe: Story 2] (608x1080)
x=1316, y=0: [Iframe: Story 3] (608x1080)
```

**For multi-format output** (same angle in multiple sizes): Stack formats vertically per angle:

```text
x=0, y=0: [Iframe: Angle 1 -- Square] (600x600)
x=0, y=650: [Iframe: Angle 1 -- Portrait] (450x600)
x=650, y=0: [Iframe: Angle 2 -- Square] (600x600)
x=650, y=650: [Iframe: Angle 2 -- Portrait] (450x600)
```

**For carousel ads:** Place cards in sequence left-to-right:

```text
x=0, y=0: [Iframe: Card 1] (600x600)
x=650, y=0: [Iframe: Card 2] (600x600)
x=1300, y=0: [Iframe: Card 3] (600x600)
x=1950, y=0: [Iframe: Card 4] (600x600)
```

Do not add text labels above iframe shapes -- iframes already display their componentName in the title bar. Set componentName to something descriptive like "Angle 1: Outcome -- Think deeper. Get further."

**With landing page mock-ups** (optional -- include when the user wants to see the full click-through experience): Place the landing page iframe next to each ad:

```text
x=0, y=0: [Iframe: Angle 1 Ad] (600x600)
x=650, y=0: [Iframe: Angle 1 Landing] (1280x720)
x=0, y=650: [Iframe: Angle 2 Ad] (600x600)
x=650, y=650: [Iframe: Angle 2 Landing] (1280x720)
```

The landing page should look like where the ad actually leads -- hero section echoing the ad's message, value props, social proof, and a CTA. Not a wireframe.

## Export

Ads use vw/vh sizing so they adapt to any viewport. For export at specific pixel dimensions:

```bash
npx playwright screenshot artifacts/mockup-sandbox/public/ads/angle1.html --viewport-size=1080,1080 -o angle1-1080.png
npx playwright screenshot artifacts/mockup-sandbox/public/ads/angle1.html --viewport-size=1080,1350 -o angle1-portrait.png
npx playwright screenshot artifacts/mockup-sandbox/public/ads/story1.html --viewport-size=1080,1920 -o story1.png
```

The user can also screenshot each iframe directly from the canvas, or open the HTML files in a browser at the desired size.

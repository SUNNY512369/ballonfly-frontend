# Ad HTML Layouts and Images

Read before writing or reviewing ad HTML: it has the mandatory viewport sizing, the 4-element direct-response structure, and the image-first layout used for awareness/launch ads and user-provided images.

## Viewport-Relative Sizing (mandatory)

```css
html, body {
  margin: 0; padding: 0;
  width: 100vw; height: 100vh;
  overflow: hidden;
}
```

All internal sizing must use vw/vh. No fixed pixel dimensions on containers.

## Ad HTML Structure (mandatory pattern)

Every ad must follow this exact structure -- 4 elements, no more:

```html
<div class="ad">
  <div class="logo"><!-- SVG or img --></div>
  <div class="middle">
    <div class="headline">Hero text here</div>
    <div class="benefit">One short benefit line.</div>
    <div class="cta">Verb-first CTA</div>
  </div>
  <span class="footer">brand.com</span>
</div>
```

```css
.ad {
  width: 100vw;
  height: 100vh;
  background: #SOLID_COLOR;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 6vh 7vw;
  box-sizing: border-box;
}

.middle {
  display: flex;
  flex-direction: column;
  gap: 3vh;
}
```

Do not add icons, stats rows, feature grids, badges, dividers, or any decorative elements. If you are tempted to add a 5th element, move that information to the primary text instead.

## Image Guidance

### When to use generated images

- Awareness/launch campaigns -- the hero image IS the ad, with text overlaid on a bottom gradient
- When the user explicitly requests photo-based or image-heavy ads

### When NOT to use images (default for direct-response)

- Standard direct-response ads use flat solid color backgrounds with bold typography
- The 4-element rule (Logo, Hero text, Benefit, CTA) works best without competing with a background image

### If using a hero image (awareness/launch mode only)

Use the `media-generation` skill for hero images. Copy to `artifacts/mockup-sandbox/public/images/` after generation, fix permissions with `chmod 644`, and reference via `/__mockup/images/[filename].png`.

Image prompt strategy:

- Lead with a specific, tangible subject (object, scene, or person)
- Specify lighting (studio, dramatic, golden hour, Rembrandt)
- Specify camera quality ("shot on Hasselblad," "editorial photography")
- Add negative prompts: "text, words, letters, logos, watermark, blurry, low quality, cartoon, illustration"
- Each ad should use a different visual metaphor -- same brand, different visual world

Image-first HTML structure (awareness/launch only):

```css
.ad {
  width: 100vw; height: 100vh;
  position: relative; overflow: hidden;
}

.hero-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}

.gradient-overlay {
  position: absolute; bottom: 0; width: 100%;
  height: 50vh;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
}

.content {
  position: absolute; bottom: 0; left: 0;
  padding: 6vh 7vw;
}
```

**If the user provides their own images:** Use the user's images instead of generating new ones. Copy from `attached_assets/` to `artifacts/mockup-sandbox/public/images/`, fix permissions with `chmod 644`, and reference via `/__mockup/images/[filename]`. Use the awareness/launch image-first layout structure above.

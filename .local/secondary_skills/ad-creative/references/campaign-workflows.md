# Campaign-Specific Workflows

Read the matching section when the request is for carousel, retargeting, user-provided images, multiple sizes, awareness/launch, seasonal, app install, or refreshed ads, or when the user provides performance data. These adjust the core methodology in `SKILL.md`; they do not replace it.

## Carousel Ads

When the user asks for carousel ads (Instagram, Facebook, X/Twitter):

1. Each card should be a self-contained visual -- assume viewers swipe quickly.
2. Use a **consistent structural layout** across cards (same typography placement, same logo position) with **varying content/colors** per card. This "same but different" effect rewards swiping.
3. For Instagram/Facebook carousels: 1080x1080 per card, 2-10 cards.
4. For X/Twitter carousels: 1080x1080 per card, 2-6 cards with optional headline/URL per card.
5. Launch one subagent per card in parallel. Include the card number and total count so the subagent can create a coherent sequence.
6. Arrange cards left-to-right on the canvas so the user can see the swipe flow.

## Retargeting / Remarketing Ads

When the user asks for retargeting ads:

1. Adjust copy for **warm audiences** who already know the brand -- don't introduce the brand, remind them.
2. Use retargeting-specific angles: Reminder, Incentive, Social Proof, Scarcity, Objection Handling (see Step 3b in `SKILL.md`).
3. Consider dynamic elements: "Still interested in [product]?", "Your cart is waiting", etc.
4. Shorter, more direct copy -- they already know you.

## User-Provided Images

When the user uploads their own product photos or brand images:

1. Copy from `attached_assets/` to `artifacts/mockup-sandbox/public/images/`.
2. Run `chmod 644` on all copied files.
3. Use the awareness/launch image-first layout (full-bleed image with gradient overlay and text on top).
4. Do NOT generate new images -- use the user's images as-is.
5. Adapt the text overlay colors to work with the specific image's brightness/contrast.

## Multi-Format Output

When the user needs the same ad in multiple sizes:

1. Create one HTML file per size variant (e.g., `angle1-square.html`, `angle1-portrait.html`, `angle1-landscape.html`).
2. The HTML structure stays the same -- vw/vh sizing handles the adaptation. But adjust font sizes and padding for extreme aspect ratios (landscape needs smaller headline vw, portrait can go bigger).
3. Stack formats vertically per angle on the canvas for easy comparison.
4. Test each format at its target pixel dimensions to verify nothing clips or overflows.

## Awareness / Launch Campaigns

When the user asks for a launch, teaser, or brand awareness campaign:

1. Switch to awareness mode (see Step 3 in `SKILL.md`).
2. Use the `media-generation` skill to generate hero images -- each ad should use a different visual metaphor.
3. Use image-first layout with gradient overlay.
4. No CTA button on the image. ~10-15 words max.
5. For multi-card campaigns, maintain identical text layout and logo placement across cards while varying the hero visual and color palette.

## Seasonal / Holiday Ads

When the user asks for holiday or seasonal ads:

1. Use the standard methodology but adjust angles for urgency and timeliness.
2. Incorporate seasonal colors subtly -- don't overwhelm the brand identity. The brand's colors should still dominate; seasonal colors are accents.
3. Include time-bound CTAs: "Order by Dec 15 for guaranteed delivery", "48-hour flash sale".
4. Consider the platform's ad approval timeline -- submit 3-5 days before the holiday.

## App Install Ads

When the user asks for app install ad creatives:

1. CTA should be app-specific: "Download Free", "Get the App", "Try It Free".
2. Consider showing a device mockup or screenshot (if the user provides one).
3. For Google App Campaigns: supply landscape (1200x628), portrait (1200x1500), and square (1200x1200) images.
4. Keep the value proposition ultra-clear -- users decide in 1-2 seconds whether to install.

## Refreshing Existing Ads

When the user wants to update or refresh existing ads without performance data:

1. Review the existing ads (ask the user to share them or describe them).
2. Keep the same brand identity and overall strategy.
3. Freshen: new headline variations, new background colors, new angles that weren't tested.
4. Do NOT change what's working -- if the user says "these are doing fine, just want fresh versions," keep the structure and vary the copy/colors.

## Iterating from Performance Data

When the user provides performance data:

1. **Analyze winners**: Identify winning themes, structures, word patterns, and character utilization in top performers (by CTR, conversion rate, or ROAS).
2. **Analyze losers**: Identify themes that fall flat and common patterns in underperformers.
3. **Generate new variations**: Double down on winning themes, extend winning angles, test 1-2 new unexplored angles, avoid patterns from underperformers.
4. **Document the iteration**: Track what was learned, what's being tested, and what angles were retired.

Present the analysis to the user before building new ads:

```text
## Performance Analysis

### Winners (keep and extend)
- Pain point angles performing 2.3x above average CTR
- Headlines with specific numbers ("75% faster") outperform vague claims

### Losers (retire)
- Curiosity angles underperforming -- audience is solution-aware, not problem-aware
- Long headlines (over 25 chars) getting truncated on mobile

### New Test Plan
- 2 new pain point variations (doubling down on winner)
- 1 social proof angle (untested category)
- Retire all curiosity angles
```

### Create Image

Embed an image on the canvas.

From an external URL:

```javascript
await applyCanvasActions({ actions: [
  {
    type: "create",
    shapeId: "hero-image",
    shape: {
      type: "image",
      x: 0, y: 0, w: 800, h: 600,
      src: "https://example.com/hero.png",
      altText: "Hero banner image"
    }
  }
] });
```

From a local file (copy to `.canvas/assets/`, resolve domain, use port 5904):

```javascript
// First, in a shell: mkdir -p .canvas/assets && cp assets/hero.png .canvas/assets/hero.png
// Then resolve domain: echo $REPLIT_DOMAINS  (e.g. abc123.replit.dev)

await applyCanvasActions({ actions: [
  {
    type: "create",
    shapeId: "hero-image",
    shape: {
      type: "image",
      x: 0, y: 0, w: 800, h: 600,
      src: "https://<resolved-domain>:5904/hero.png",
      altText: "Hero banner image"
    }
  }
] });
```

### Align and Distribute Shapes

Prefer `create-auto` for new iframes that just need automatic placement. Use `align` (2+ shapes) and `distribute` (3+ shapes) for manual placement or cleanup.

**When to use:**

- New iframes that just need automatic placement -- use one `create-auto` action to place them together and avoid existing shapes.
- Row or column of 3+ non-iframe items you are placing together (cards, thumbnails) -- `align` one axis, `distribute` the other.
- Pair of shapes you are placing together and want to share an edge (e.g. before/after side-by-side) -- `align` only; do not `distribute` 2 shapes.
- Cleaning up a group of shapes the user already placed and explicitly asked to be lined up -- all of them will move.

**When NOT to use:** to place a new shape next to existing user content without moving that content, do not pass the existing shape into `align` -- `align` moves every shape in `shapeIds`. Read the anchor's position with `getCanvasState`, then compute the new shape's coordinates from the anchor: share the aligned axis (e.g. `y: anchor.y` for tops) and offset the other by `anchor.x + anchor.w + gap` (or `anchor.y + anchor.h + gap`) -- keep the `anchor.x`/`anchor.y` term so the new shape lands beside the anchor, not at the origin.

**Rule of thumb (3+ iframe placeholders):** if you're chaining `x3 = x2 + w + gutter`, `x4 = x3 + w + gutter`, stop -- use `create-auto`. For manual non-iframe placement, place shapes at approximate positions and line them up with `align`/`distribute` in the same batch. `align` modes: `left` snaps all shapes to the leftmost x; `right` to the max right edge; `top` to the minimum y; `bottom` to the max bottom edge; `center-horizontal`/`center-vertical` snap to the mean center.

Recipe: three mockup iframes:

```javascript
await applyCanvasActions({ actions: [
  {
    type: "create-auto",
    shapeIds: ["minimal", "bold", "playful"],
    names: ["Minimal", "Bold", "Playful"],
    shape: { type: "iframe", w: 1280, h: 900, state: "building" }
  }
] });
```

Recipe: column of cards -- align left, distribute vertically:

```javascript
await applyCanvasActions({ actions: [
  { type: "align",      shapeIds: ["card-1", "card-2", "card-3", "card-4"], alignment: "left" },
  { type: "distribute", shapeIds: ["card-1", "card-2", "card-3", "card-4"], direction: "vertical" }
] });
```

Recipe: annotate an existing shape without moving it. Search both `focusedShapes` and `blurryShapes`; on a large board the anchor can be omitted from both (overflow lands in `peripheralClusters`, which has no per-shape data), so re-query with `focusArea`. Do NOT pass the anchor into `align`, that would move it:

```javascript
const find = (s) => s.shapeId === "pricing-card";
const locate = (st) => st.focusedShapes.find(find) ?? st.blurryShapes.find(find);
let card = locate(await getCanvasState());
if (!card) card = locate(await getCanvasState({ focusArea: { x: 1800, y: 100, w: 600, h: 400 } }));
if (!card) throw new Error("pricing-card not on canvas");
await applyCanvasActions({ actions: [
  { type: "create", shapeId: "pricing-label", shape: { type: "text", x: card.x + card.w + 40, y: card.y, w: 240, h: 40, text: "Pricing card v2" } }
] });
```

Do not follow `align`/`distribute` with a manual `move` on any of the same shapes in the same batch -- it undoes the alignment. To rigidly translate a laid-out row or column (preserving gutters), read current positions via `getCanvasState` and issue one `move` per shape with the same delta applied. Re-running `align`/`distribute` recomputes the layout from scratch, not a translation.

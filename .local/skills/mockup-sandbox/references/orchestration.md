
## Subagent Orchestration

For design variation tasks (2+ alternatives of the same component or page), use DESIGN subagents to parallelize work. The parent agent orchestrates setup, building placeholders, and canvas layout; subagents handle individual variant creation and mark iframes live when done. Multi-page fan-out (building separate pages in parallel) should only be used when the user explicitly requests multiple pages.

### Building placeholders

Every mockup request -- whether handled directly or via subagents -- should show immediate visual feedback on the canvas using the iframe `state` field. When creating a new iframe for a component that doesn't exist yet, set `state: "building"`. The canvas renders a native building indicator -- no URL is needed at this point.

**Flow for new components (0 -- 1):**

1. Read the canvas state to find empty space
2. Immediately place iframe(s) with `state: "building"` and `componentName` at the expected sizes
   - **Empty-canvas only:** if the canvas was empty before this batch, follow the placement with a `focusCanvasShapes` on the new placeholder IDs in the same execution. See [Place and build](../SKILL.md#4-place-and-build) for the precise emptiness check.
3. Proceed with component development.
   - For direct builds, set the iframe `state: "live"` once the component is ready, then screenshot the component to confirm it renders.
   - For subagent builds, ask the subagent to set the iframe `state: "live"` AND verify with a screenshot before reporting -- broken iframes are invisible to the user until someone checks. The subagent's prompt has the screenshot tool mechanics; the parent only needs to include a verification instruction in the task (e.g. "Screenshot the preview to verify it renders before reporting").
4. Check the system logs for iframe-related issues, fix any problems, and restart the workflow once all components are created.

**Flow for modifying existing components:**

1. Set `state: "modifying"` on the iframe before editing
2. Edit the component file in place
3. Set `state: "live"` on the iframe when done

**Building iframe example:**

```json
{
  "type": "create",
  "shapeId": "pricing-bold",
  "shape": {
    "type": "iframe",
    "x": 600, "y": 100, "w": 500, "h": 450,
    "state": "building",
    "componentName": "Bold Pricing Card"
  }
}
```

Then once the component is built, `update` the placeholder's shapeId to set the URL and mark it live **with 3 `suggestedActions` in that same update**, with each changed property inside `updates`:

```json
{
  "type": "update",
  "shapeId": "pricing-bold",
  "updates": {
    "url": "https://<dev-url>/__mockup/preview/pricing-cards/Bold",
    "componentPath": "artifacts/mockup-sandbox/src/components/mockups/pricing-cards/Bold.tsx",
    "state": "live",
    "suggestedActions": [
      { "id": "checkout-page", "label": "Turn this pricing overview into a focused checkout flow", "category": "new page / flow extension", "content": { "kind": "prompt", "prompt": "Create a new frame that expands this pricing overview into a complete checkout flow with order details, payment fields, and a clear confirmation action" } },
      { "id": "dark-editorial", "label": "Reimagine this page as a bold dark editorial spread", "category": "extreme reimagining", "content": { "kind": "prompt", "prompt": "Create a new variant of this design as a bold, editorial dark-mode magazine spread" } },
      { "id": "cinematic-hero", "label": "Give the hero richer and more cinematic imagery", "category": "imagery refresh", "content": { "kind": "prompt", "prompt": "Generate a new variant with a moodier, cinematic hero using dramatic lighting and a more immersive composition" } }
    ]
  }
}
```

### Suggested next steps (required when marking a design frame live)

Every design frame must carry 3 `suggestedActions` by the time it goes `state: "live"` — attach them in that same update (ideally also up front on the still-`building` frame so the cards appear immediately), for every live design frame including each fan-out variant and any frame spawned from a clicked suggestion. They render as one-click ghost-frame cards beside the frame; clicking one drops a new building frame and sends that prompt with the frame as context. A live design frame without them is a bug.

Each suggestion is an object: `content` (`{ "kind": "prompt", "prompt": "…" }`, the hidden execution prompt sent verbatim when clicked), a required user-facing `label` (the card body, ≤60 chars), an optional freeform `category` style hint, and an authored short `id` slug (used for accept/dedup/telemetry). Author them with the **design-exploration** skill's principles (`pkg/agent-skills/skills/design-exploration/SKILL.md`):

- **Write each `label` as one brief sentence describing the concrete change to the selected frame.** The user sees the original frame beside this sentence, so summarize what the proposed variant will change. Do not use a short title or category-like phrase, and do not copy or expose the full execution prompt.
- **Phrase each prompt as a self-contained "new frame/variant" request.** A clicked suggestion arrives as an ordinary message with the source frame as context — nothing flags it as a branch — so the prompt must clearly ask for a NEW frame ("Create a new variant of this design that …", "Generate a new frame exploring …"), never an in-place edit of the selected frame.
- **Direct refinements to copy, never edit.** When a suggestion refines an existing component ("add a vinyl section"), the prompt must say to copy the source into a new component file and change the copy — e.g. "Create a new variant of this design, as a new component file (do not modify existing files), that adds …". Whoever executes it may run in parallel with other agents reading the same source file.
- **Comprehend the frame first** — its function, content, interaction, and visual structure — before generating suggestions.
- **Each suggestion is a distinct design hypothesis**, not three reskins of the same page.
- Default to **≥2 of 3 being net-new big swings** — a new page/screen the design implies, or an extreme reimagining (radically different art direction or layout) — with at most one incremental refinement. For image-heavy designs, make one a "new variant with regenerated imagery" prompt.
- **Account for sibling frames and existing canvas frames** so suggestions diverge instead of colliding (e.g. don't have two variants both propose a light/dark toggle).


### When to use subagents

Use subagents when the task involves **2+ design variants** of the same component or page. Also use a single DESIGN subagent for any single-page app or full-page mockup (landing pages, homepages, portfolios, etc.) -- the DESIGN subagent produces higher-quality visual output, unless the user asks you to handle it yourself. For a single small component (card, button, form) or a modification to an existing mockup, do the work directly.

**Do not create multiple pages unless the user explicitly asks.** When the user says "design a dashboard" or "build a CRM", build it as a single page -- do not proactively split it into Dashboard, UserList, Settings, etc. Only fan out into multiple page files when the user specifically requests separate pages (e.g., "design a CRM with dashboard, users, and settings pages").

**Single-page apps are single components.** When the user asks for a landing page, homepage, or any single-page app, create it as **one component file** -- do not split sections (hero, features, pricing, footer, etc.) into separate component files or separate screens. A landing page is one scrollable page rendered in one iframe, unless the user explicitly asks for separate screens or sections as independent components. For landing pages and similar content-rich pages, prioritize generating images (hero visuals, product shots, background art, illustrations) -- placeholder boxes and generic imagery make landing pages look unfinished. Use `generateImage` to create custom visuals that match the page's mood and brand direction.

**Which kind?** Use design subagents (`config: { $kind: "design" }`) for all mockup creation work. DESIGN subagents are tuned for creative visual output -- they produce better, more diverse designs when given a brief mood/direction rather than prescriptive specs. Do not use GENERAL subagents for mockup component creation; they lack the design sensibility and carry unnecessary overhead (task lists, context management).

**For extract and graduate workflows, use GENERAL subagents** if parallelization is needed. These are engineering tasks (import graph tracing, production code transformation) -- DESIGN subagents lack the codebase navigation skills they require. See the companion skills for details.

| Scenario | Subagents? | Specialization | Pattern |
| --- | --- | --- | --- |
| "Design a pricing card" | No | -- | Direct |
| "Design a landing page" | Yes (1) | DESIGN | Single DESIGN subagent (one file) |
| "Design a single-page app" | Yes (1) | DESIGN | Single DESIGN subagent (one file) |
| "Make the header bigger" | No | -- | In-place modification |
| "Extract my existing component" | If parallelizing | GENERAL | Direct or fan-out (mockup-extract) |
| "Graduate / apply this mockup to my app" | If parallelizing | GENERAL | Direct or fan-out (mockup-graduate) |
| "Redesign my navbar with 2 options" | Yes | DESIGN | Variants fan-out |
| "Show me 3 options for the hero" | Yes | DESIGN | Variants fan-out |

### Pattern: Direct (no subagent)

Use for single small components (cards, buttons, forms) or modifications to existing mockups. For single full-page mockups (landing pages, homepages, single-page apps), delegate to a single DESIGN subagent instead -- unless the user asks otherwise. Follow the standard setup steps (Steps 3-6), with building placeholders for instant feedback.

```text
Parent: Place iframe(s) with state: "building" on canvas
    -- Create component file
    -- Restart workflow
    -- Update iframe with URL + state: "live"
    -- presentArtifact with shapeIds
```

For modifications to existing mockups, set `state: "modifying"` on the iframe, edit the file in place, then set `state: "live"` when done. **Do not** create a new file for modifications. If the user wants to preserve the old version for comparison, *then* duplicate the file into a new variant first.
**Applying or switching a design system on an existing mockup is not an in-place edit.** When the user applies a design system to a mockup that currently lives in the default entry (`src/components/mockups/`) or under a *different* design system's entry, the mockup must end up under the target design system's entry -- re-home it, don't just restyle it where it sits. (If the mockup already lives under the target design system's entry, this is an ordinary in-place edit -- skip the move.) This applies whether the design system already existed or you created/imported it earlier this turn.

1. Wire the target design system's entry if `artifacts/mockup-sandbox/src/ds/<ds-slug>/` does not exist yet -- follow [Design-system entries and switching](../SKILL.md#3-design-system-entries-and-switching).
2. Create the rebuilt mockup at `artifacts/mockup-sandbox/src/ds/<ds-slug>/mockups/<ComponentName>.tsx`, importing the design system's own components from `@workspace/<ds-slug>/*`.
3. Repoint **every** canvas frame that renders the old file -- one component file can back several frames (e.g. the responsive mobile/tablet/desktop comparison), so check for siblings first -- setting each frame's `url` to `https://${REPLIT_DOMAINS}/__mockup/src/ds/<ds-slug>/#/<ComponentName>` and its `componentPath` to the new `artifacts/mockup-sandbox/src/ds/<ds-slug>/mockups/<ComponentName>.tsx`. A brand-new entry (step 1) needs the workflow restart; an existing entry picks up the new file automatically via `import.meta.glob`.
4. Delete the mockup's previous file only once no frame still references it.

This is the one case where you replace a mockup's file with a new file under a different entry instead of editing in place.

**Exploring a suggested action is not a modification.** When the work comes from a clicked ghost-frame suggestion, or any "iterate on this frame" / "what else could this be?" request, create a **new** component file and a **new** frame for the explored direction — do not edit the source frame's file or overwrite its `url`/contents in place. The source frame is the user's reference point and must stay intact. In-place modification (above) is only for an explicit "change *this* frame" request.

**Never delete a reserved building frame.** A `state: "building"` iframe you did not create this turn is a reserved slot the client placed (e.g. from a clicked ghost-frame suggestion) for this loop or the next one. Fill it with an `update` if it's the slot for your current work; never delete one as "stray"/leftover cleanup. You may only delete building placeholders you created earlier this same turn and chose not to fill.

### Pattern A: Design variants (fan-out)

Use when the user wants multiple visual options for the same component or page.

```text
Parent: Place iframes with state: "building" on canvas (one per variant, in a row)
Parent: Establish requirements, seed each variant direction
    -- DESIGN subagent: "Minimal" variant
    -- DESIGN subagent: "Bold" variant
    -- DESIGN subagent: "Gradient" variant
Parent: Check system logs, fix issues and restart workflow once all subagents complete
```

**Parent responsibilities:**

1. Run the design-exploration comprehension steps (analyze component, identify constraints, select variation axes) and compose a structured design brief
2. Create the folder (e.g., `mockups/pricing-cards/`)
3. Place iframes with `state: "building"` in a horizontal row on the canvas, one per variant, with stable shape IDs. For 3+ variants, place them at rough positions and use `align` (top) + `distribute` (horizontal) in the same batch rather than hand-computing gutters.
4. Seed each subagent with: the design brief, target file path, shape ID to update, dev URL, and the specific design hypothesis for this variant. **Tell each subagent not to edit `index.css`** -- multiple subagents run in parallel and will overwrite each other's changes.
5. After all subagents complete: restart workflow, call `presentArtifact` with all shape IDs.

**Subagent task format:**

```text
Create a mockup component at artifacts/mockup-sandbox/src/components/mockups/pricing-cards/Bold.tsx

## Design Brief

Component analysis: A pricing card that presents a subscription tier to help users
compare plans and choose one. Displays plan name, price, feature list, and a CTA.

Fixed constraints: Must include plan name, monthly price, feature list, and CTA button.
Data shape stays consistent across variants.

Variation axes:
- Content hierarchy (what leads the user's eye)
- Visual treatment (mood and material quality)

## This Variant's Hypothesis

Name: Bold
Hypothesis: High-contrast, large typography, and strong color blocking to create urgency
and confidence. Foregrounds the price as the dominant visual element with features
as supporting evidence.

Each variation should be a distinct design hypothesis. Do not produce variations that
differ only in color, font, or spacing unless the brief specifically calls for
aesthetic exploration.

The exported function name must match the filename: export function Bold().
Use Tailwind + shadcn/ui.

## CSS rules
Do NOT edit index.css -- other subagents are running in parallel and will overwrite
your changes. All styles must be self-contained within your component:
- Use Tailwind utility classes and inline styles for all visual styling
- For custom fonts, use Google Fonts <link> tags in a wrapper <div> or inline @import
- If you need CSS custom properties or @keyframes, create a _group.css in the
  component folder and import it in your .tsx file

When done, update the canvas iframe to show the real preview:
  Shape ID: pricing-bold
  URL: https://<dev-url>/__mockup/preview/pricing-cards/Bold
  componentPath: artifacts/mockup-sandbox/src/components/mockups/pricing-cards/Bold.tsx
  state: "live"
  suggestedActions: 3 follow-up suggestion cards, in this same "live" update (see "Suggested next steps (required when marking a design frame live)" above for how to author them)
```

**Parent responsibilities:**

1. Place iframes with `state: "building"` on the canvas with stable shape IDs
2. Create the project folder and `_shared/` subfolder
3. Build shared layout components (`AppLayout.tsx` with a content slot, `Navbar.tsx`, `Sidebar.tsx`, etc.)
4. Fan out DESIGN subagents for each page, passing `_shared/` file paths, shape ID, and dev URL. **Tell each subagent not to edit `index.css`** -- multiple subagents run in parallel and will overwrite each other's changes.
5. After all subagents complete: restart workflow, call `presentArtifact` with all shape IDs.

**Multi-page subagent task format (only when user explicitly requests multiple pages):**

```text
Create a mockup page at artifacts/mockup-sandbox/src/components/mockups/crm-dashboard/Dashboard.tsx

This is the main dashboard page of a CRM application. Import the shared layout:
  import { AppLayout } from "./_shared/AppLayout";

Wrap your page content inside <AppLayout>. The layout already renders the nav and sidebar --
you only need to build the page content area.

User constraints: Show key metrics (revenue, users, conversion), recent activity feed,
and a quick-actions panel.

The exported function name must match the filename: export function Dashboard().
Use Tailwind + shadcn/ui.

## CSS rules
Do NOT edit index.css -- other subagents are running in parallel and will overwrite
your changes. All styles must be self-contained within your component:
- Use Tailwind utility classes and inline styles for all visual styling
- For custom fonts, use Google Fonts <link> tags in a wrapper <div> or inline @import
- If you need CSS custom properties or @keyframes, create a _group.css in the
  component folder and import it in your .tsx file

When done, update the canvas iframe to show the real preview:
  Shape ID: crm-dashboard
  URL: https://<dev-url>/__mockup/preview/crm-dashboard/Dashboard
  componentPath: artifacts/mockup-sandbox/src/components/mockups/crm-dashboard/Dashboard.tsx
  state: "live"
  suggestedActions: 3 follow-up suggestion cards, in this same "live" update (see "Suggested next steps (required when marking a design frame live)" above for how to author them)
```

### Pattern C: Multi-page with multiple variant directions

Use when the user wants to compare multiple complete design directions for a multi-page application ("show me 2 different takes on this CRM").

Each variant gets its own folder with its own `_shared/` components. One DESIGN subagent builds an entire variant (shared components + all pages), giving it full creative control over the design direction.

```text
Parent: Place iframes with state: "building" in a variant -- page grid on canvas
Parent: Define page list, seed each variant direction
    -- DESIGN subagent: Build entire crm-minimal/
    -- DESIGN subagent: Build entire crm-bold/
    -- DESIGN subagent: Build entire crm-playful/
Parent: Checked the system logs and restart the workflow once all components are created

```

```text
mockups/
-- crm-minimal/
--   -- _shared/
--   --   -- AppLayout.tsx
--   --   -- Navbar.tsx
--   -- Dashboard.tsx
--   -- UserList.tsx
--   -- Settings.tsx
-- crm-bold/
--   -- _shared/
--   --   -- AppLayout.tsx
--   --   -- TopNav.tsx
--   -- Dashboard.tsx
--   -- UserList.tsx
--   -- Settings.tsx
```

**Canvas layout for variant -- page grids:**

Arrange as a matrix with text label shapes for headers. Variants as rows, pages as columns:

```text
              Dashboard       UserList        Settings
Minimal       [iframe]        [iframe]        [iframe]
Bold          [iframe]        [iframe]        [iframe]
Playful       [iframe]        [iframe]        [iframe]
```

Use `geo` text shapes for row and column headers. Space iframes with ~50px gutters.

**Subagent task format:**

```text
Build a complete multi-page mockup variant at artifacts/mockup-sandbox/src/components/mockups/crm-minimal/

Direction: Minimal and restrained -- lots of whitespace, muted colors, thin borders, subtle typography.

Pages to create: Dashboard.tsx, UserList.tsx, Settings.tsx

First create a _shared/ subfolder with shared layout components (AppLayout, Navbar, Sidebar or
similar). Then create each page file importing from _shared/ for visual consistency.

Each exported function name must match its filename. Use Tailwind + shadcn/ui.

When done, update the canvas iframes to show real previews (set state: "live" on each):
  Shape ID: crm-minimal-dashboard -- URL: https://<dev-url>/__mockup/preview/crm-minimal/Dashboard
  Shape ID: crm-minimal-userlist -- URL: https://<dev-url>/__mockup/preview/crm-minimal/UserList
  Shape ID: crm-minimal-settings -- URL: https://<dev-url>/__mockup/preview/crm-minimal/Settings
Attach 3 suggestedActions to each iframe in its same "live" update (see "Suggested next steps (required when marking a design frame live)" above).
```

**Important:** The multi-page pattern above should only be used when the user explicitly requests separate pages. If the user says "design a CRM" or "design a dashboard" without specifying separate pages, build everything as a single page component.

### General orchestration rules

1. **Always place building iframes first.** Before starting any component work, create iframes with `state: "building"` at the expected positions and sizes. No URL is needed yet -- the canvas shows a native building indicator. Skip this only for in-place modifications (set `state: "modifying"` on the existing iframe instead).

2. **Subagents mark their own iframes live.** The parent places building iframes with stable shape IDs, then tells each subagent which shape ID to update and the dev URL to use. Subagents set the real preview URL and `state: "live"` when their component is ready. This gives progressive reveal -- iframes light up as subagents finish, rather than all at once.

3. **Parent restarts the workflow once after all subagents complete** -- not once per subagent. A single restart discovers all new components and the iframes load the real content.

4. **Verify paths before delegating.** Before passing file paths to subagents, list `artifacts/mockup-sandbox/` to confirm `src/components/mockups/` exists and pass the verified full path. Getting this wrong means files land in a directory the Vite plugin never scans.

5. **Tell subagents the image path convention.** Always include this in the subagent task: "Place all images in `artifacts/mockup-sandbox/public/images/` and reference them as `<img src="/__mockup/images/filename.jpg" />`. Do NOT put images in `src/assets/` and reference them by URL path -- Vite does not serve `src/` as static assets and they will 404. For `generateImage`, use `outputPath` starting with `artifacts/mockup-sandbox/public/images/`."

6. **Tell subagents the social-post constraints.** When delegating social post work, pass the artwork-only and edge-to-edge constraints explicitly in the task -- subagents otherwise default to building full post chrome with a padded presentation wrapper. Include: "Build only the post artwork itself (no platform interface UI -- no avatar/username header, like/comment/share row, caption block, or feed frame) and render it edge-to-edge: `h-screen w-full`, no page padding, no background matting, no drop shadow, no wrapper decoration."

7. **Give subagents creative freedom.** Subagents produce better designs when given high-level requirements, not prescriptive specs. Pass:
   - Target file path and exported function name
   - Shape ID + dev URL for iframe update
   - Shared file paths to import (for multi-page projects)
   - Functional requirements only (what the page must contain, not how it should look)
   - A brief mood/direction seed (1-2 words: "minimal", "bold and dark", "warm editorial")

   Do NOT pass specific color values, font choices, spacing values, detailed layout instructions, CSS class names, or references to other variants. The subagent has its own design sensibility -- constraining it to exact specs produces generic results and defeats the purpose of generating diverse alternatives.

   **Exception:** For multi-page apps (only when the user explicitly requests multiple pages), the parent defines the design system in `_shared/` and the subagent works within it. Creative freedom applies to page content and layout, not the shared chrome.

8. **Match the config kind to the task type.** Use `config: { $kind: "design" }` for creative mockup creation (building new components, designing variants) -- it's tuned for visual output and produces better, more diverse designs. Use `config: { $kind: "general" }` for engineering tasks (extract, graduate) -- it's built for codebase navigation, dependency tracing, and architecture-aware transformations. Never use design for extract/graduate or general for mockup creation.

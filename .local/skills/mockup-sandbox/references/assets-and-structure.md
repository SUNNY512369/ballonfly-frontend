
## Architecture

```text
artifacts/mockup-sandbox/                              # Isolated from main app
-- package.json                      # Dependencies (React, Tailwind, shadcn/ui, cartographer)
-- vite.config.ts                    # Vite config
-- mockupPreviewPlugin.ts            # Vite plugin for component discovery + automatic 404 rescan
-- tsconfig.json                     # TypeScript config for tsgo type checking
-- components.json                   # shadcn/ui config
-- .npmrc
-- index.html
-- src/
    -- main.tsx                      # Entry point
    -- App.tsx                       # Landing page
    -- index.css                     # Tailwind v4 styles
    -- .generated/
    --   -- mockup-components.ts      # Auto-generated component registry
    -- components/
    --   -- ui/                       # 50+ shadcn/ui components (pre-installed)
    --   -- mockups/                  # YOUR MOCKUP COMPONENTS GO HERE (built-in default look)
    -- lib/
    --   -- utils.ts
    -- hooks/
```

## Folder Structure

The folder structure in `mockups/` automatically organizes components:

```text
components/mockups/
-- pricing-cards/           # Single-component variants
--   -- _group.css           # Group-level tokens + fonts (optional)
--   -- Minimal.tsx          # imports './_group.css'
--   -- Bold.tsx             # imports './_group.css'
--   -- Gradient.tsx         # imports './_group.css'
-- crm-dashboard/           # Multi-page project (only when user explicitly requests multiple pages)
--   -- _shared/             # Shared layout (not preview targets)
--   --   -- AppLayout.tsx
--   --   -- Navbar.tsx
--   --   -- Sidebar.tsx
--   -- _group.css
--   -- Dashboard.tsx
--   -- UserList.tsx
--   -- Settings.tsx
-- login-forms/
--   -- Simple.tsx
--   -- Dark.tsx
-- QuickIdea.tsx            # Ungrouped (loose files)
```

Files prefixed with `_` are not preview targets by convention. `_shared/` holds helper components imported by sibling page files. `_group.css` holds group-level CSS overrides -- tokens, font `@import`s, `@font-face` blocks -- that every component in the group explicitly imports (see [Fonts](#fonts)).

## Working with Assets

### Icons

`lucide-react` is pre-installed with 1000+ icons:

```tsx
import { ShoppingCart, Star, ArrowRight } from "lucide-react";

<ShoppingCart className="w-6 h-6 text-gray-600" />
```

### Images

Two approaches -- **do not mix them**:

#### Option 1: Public folder (URL reference)

Place images in `artifacts/mockup-sandbox/public/images/` and reference by URL path:

```tsx
<img src="/__mockup/images/hero.png" alt="Hero" />
```

#### Option 2: Import via `@/assets/` (bundled by Vite)

Place images in `artifacts/mockup-sandbox/src/assets/` and import them:

```tsx
import heroImg from "@/assets/hero.png";

<img src={heroImg} alt="Hero" />
```

The `@` alias maps to `artifacts/mockup-sandbox/src/`, so `@/assets/hero.png` resolves to `artifacts/mockup-sandbox/src/assets/hero.png`.

**Important -- pick one approach per image and do not cross them:**

- Files in `src/assets/` **must** be imported (`import img from "@/assets/hero.png"`). Referencing them by URL path (`<img src="/src/assets/hero.png" />`) will 404 -- Vite does not serve `src/` files as static assets.
- Files in `public/images/` are served as-is at `/__mockup/images/--`. Do not import them.

For mockups, **prefer Option 1 (public folder)** -- it is simpler and avoids the most common mistake.

To generate images for mockups, use the `media-generation` skill:

```javascript
await generateImage({
    prompt: "Modern product photo of wireless headphones",
    outputPath: "artifacts/mockup-sandbox/public/images/headphones.png",
    summary: "wireless headphones product photo"
});
```

Then reference: `<img src="/__mockup/images/headphones.png" />`.

**Path warning:** The `outputPath` must start with `artifacts/mockup-sandbox/public/` -- NOT just `public/`. The main app's public folder is not served by the mockup dev server. Using `outputPath: "public/images/hero.png"` (without the `artifacts/mockup-sandbox/` prefix) will 404 in mockup iframes.

### Fonts

**Bundled fonts.** `index.html` preloads 25+ Google Font families. Use them directly in any component:

```tsx
<h1 className="font-['Playfair_Display']">Heading</h1>
```

**Custom fonts.** For fonts outside the bundled set, add a non-blocking `<link>` tag to `artifacts/mockup-sandbox/index.html`. Do not use CSS `@import url(...)` -- it is render-blocking and will delay all Tailwind styles until the font finishes downloading.

```html
<!-- in artifacts/mockup-sandbox/index.html <head> -->
<link rel="stylesheet" media="print" onload="this.media='all'"
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&display=swap">
```

Then use it in components:

```tsx
<h1 className="font-['Cormorant_Garamond'] text-6xl">Heading</h1>
```

Or override the default font via a CSS variable in a component's own CSS file:

```css
/* editorial-hero/tokens.css */
:root { --font-serif: 'Cormorant Garamond', serif; }
```

Missing fonts fail silently -- no console error, no build failure, just a fallback font with the wrong weight and width. Verify typography visually.

## Adding Packages

The `packager_install_tool` only works for the main project. To add packages to the mockup sandbox:

1. Edit `artifacts/mockup-sandbox/package.json` directly and add the dependency
2. Run `npm install` from the `artifacts/mockup-sandbox/` directory
3. Restart the "artifacts/mockup-sandbox: Component Preview Server" workflow to pick up the change

## shadcn/ui Components

All shadcn/ui components are pre-installed and ready to use:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

**Available components:** accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, button-group, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, empty, field, form, hover-card, input, input-group, input-otp, item, kbd, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip

## Component Best Practices

- **One preview entry point per file** -- each file should export one top-level component that the preview route resolves as the preview target. But define as many local helper components inside the file as you need -- a `Dashboard.tsx` with internal `StatsCard`, `ActivityFeed`, and `QuickActions` components all composed into one exported `Dashboard` function is ideal. This keeps mockups self-contained and readable without file sprawl.
- **Match the CSS wrapper to the content type** -- see the [Iframe Sizing Guide](../SKILL.md#iframe-sizing-guide) for how to pair component CSS with iframe dimensions.
- **Use design tokens for the baseline** -- When recreating the app's existing look or building the "Current" version, use semantic color classes like `bg-background`, `text-foreground`, `text-muted-foreground` so the mockup matches the main app's theme. When creating design variations, use whatever colors express the variant's visual direction -- hardcoded colors like `bg-indigo-950`, `text-amber-200` are expected and necessary. That's the whole point of exploring alternatives.
- **Use realistic data** -- show how the component looks with real content, not lorem ipsum.
- **Name clearly** -- use descriptive names that communicate the variant's design hypothesis (e.g., `ComparisonTable.tsx`, `ProgressiveDisclosure.tsx`, `FeatureLed.tsx`). For simple aesthetic variants, names like `Minimal.tsx` or `DashboardDark.tsx` are fine.
- **Include states** -- create separate mockup files for loading, empty, and error states.

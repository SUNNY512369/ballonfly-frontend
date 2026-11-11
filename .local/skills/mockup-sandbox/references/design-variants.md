
## Design Variation Guidelines

When the user asks for variations, alternatives, "show me options," or any request that implies divergent exploration (e.g., "try 3 different approaches," "what else could this be?"), read {{skill("design-exploration")}} first. It provides a structured comprehension -- brief -- delegation workflow that produces meaningfully diverse output instead of superficial reskins.

When asked to generate variations, your first task is to **understand the design before changing it**.

### Step 1: Analyze the component

Read the source code and determine:

- **Purpose:** What user need does this component serve? What task does it support?
- **Constraints:** What must stay fixed? (data shape, required actions, accessibility, brand)
- **Degrees of freedom:** What could meaningfully change without breaking the component's purpose?

### Step 2: Select variation axes based on the analysis

Choose 2-3 axes that would give the user the most insight into their solution space. Axes ordered from most impactful to least:

1. **Structural:** Different layouts, information hierarchies, component compositions (e.g., pricing as cards vs. comparison table vs. progressive disclosure)
2. **Content strategy:** What's foregrounded vs. backgrounded, information density, copy approach (e.g., feature-led vs. social-proof-led vs. price-led)
3. **Interaction model:** Different interaction patterns, progressive disclosure, state handling (e.g., modal vs. inline expansion vs. dedicated page)
4. **Conceptual:** The underlying metaphor or mental model (e.g., dashboard-as-cockpit vs. dashboard-as-feed vs. dashboard-as-scorecard)
5. **Visual treatment:** Typography, color, spacing, depth, mood (e.g., minimal vs. bold vs. editorial)

Default to higher-impact axes unless the user specifically requests aesthetic exploration (e.g., "try different color schemes" or "explore visual styles"). For visually-driven or structurally simple components (cards, heroes, buttons), aesthetic variation is a strong first-round choice alongside structural variation.

### Step 3: Generate variations as distinct design hypotheses

Each variation should represent a meaningfully different answer to the question "how should this component work?" Variations should be diverse enough that the user can identify emerging preferences and narrow their direction.

### Process notes

- Functionality and data shape should stay consistent across variants (same API contract)
- Layout, hierarchy, content emphasis, and visual treatment ARE all fair game
- Name variants descriptively by their design hypothesis (e.g., `ComparisonTable.tsx`, `ProgressiveDisclosure.tsx`) not just their aesthetic (e.g., `Bold.tsx`)
- Create each variant as an independent component

# Meal Plan Web App

Design and data rules for the React + Vite web app that delivers every meal plan. Read this before building or changing the app.

## Design Philosophy: Mobile-First

Most people use a meal planner in the kitchen (cooking), at the grocery store (shopping), or in bed (planning). **Design for a phone screen first, then scale up.**

- **Single-column layout** on mobile — no multi-column calendar grids that require horizontal scrolling
- **Day selector** as a horizontal scrollable pill bar at the top (not a 7-column grid)
- **Meal cards** are full-width, showing meal name, time, calories, and protein at a glance — tap to expand for full detail
- **Bottom navigation** for section switching (Plan / Shop / Prep)
- **Sticky headers** for context while scrolling

## Core Layout: Dashboard + Day View

1. **Dashboard (home)** — overview of the current week:
   - Progress card (weight goal, deficit, timeline)
   - Day selector (horizontal pills showing day name + total kcal)
   - Macro rings/charts for selected day (protein, carbs, fat vs targets)
   - Meal cards for selected day (compact: name, time, kcal, protein — tap to drill in)
   - Weekly averages card at the bottom
2. **Day detail** — drill into a specific day:
   - Macro summary bar (4-up: kcal, P, C, F with targets)
   - Expanded meal cards showing all food items with portions
   - Per-meal macro breakdown (color-coded: protein=green, carbs=amber, fat=blue)
3. **Shopping list tab** — aggregated by store section:
   - Checkboxes for each item (state persists during session)
   - Progress counter (checked/total)
   - Organized by store section (Proteins, Dairy, Produce, Grains/Pantry, Nuts/Oils)
4. **Prep guide tab** — Sunday meal prep session:
   - Hero card explaining the prep concept and total time
   - Numbered steps with time estimates and descriptions
   - Organized as a cooking flow (what to do while waiting for passive cook times)

## Multiple Options & Cycling

- **Meal swaps** — for each meal slot, offer 2–3 alternatives the user can click to swap in. Show a small "swap" icon on each meal card that reveals alternatives in a dropdown or modal.
- **Rotation plans** — if the user wants variety (e.g., "don't repeat the same dinner twice in 2 weeks"), build a 2-week rotation with different week tabs.
- **High/low day cycling** — for carb cycling or calorie cycling plans, label each day (e.g., "High Day — 2,400 kcal" vs "Low Day — 1,800 kcal") and color-code the day header accordingly.

## UI/UX Requirements

- **Clean, appetizing design** — health-focused color palette (greens, warm neutrals), rounded cards, readable portions
- **Mobile-first** — single column on mobile, expanding gracefully on desktop
- **Tap to expand** — meal cards expand on tap to show full ingredient list and nutrition detail
- **Bottom navigation** — persistent bottom nav bar for Plan / Shop / Prep (hidden on detail/drill-in pages)
- **Sticky headers** — keep context (day name, section title) visible while scrolling

## Data Architecture

Embed all plan data as JSON in the app (no backend needed):

```typescript
interface MealPlan {
  weeks: Week[];
  profile: {
    goal: string;
    currentWeight: number;
    targetWeight: number;
    bmr: number;
    tdee: number;
    target_kcal: number;
    deficit: number;
    macros: Macros;
    projectedWeeks: number;
  };
  shoppingList: ShoppingSection[];
  prepGuide: PrepStep[];
}

interface Week {
  label: string;
  days: Day[];
}

interface Day {
  name: string;
  label?: string; // "High Day", "Rest Day", "Meal Prep Day", etc.
  target_kcal: number;
  meals: Meal[];
}

interface Meal {
  slot: string; // dynamic: "lunch", "snack", "dinner", "evening", "meal-1", etc.
  name: string;
  items: { food: string; portion: string }[];
  macros: Macros;
  alternatives?: Meal[];
}

interface Macros {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  kcal: number;
}

interface ShoppingSection {
  section: string;
  items: { item: string; qty: string }[];
}

interface PrepStep {
  step: string;
  time: string;
  description: string;
}
```

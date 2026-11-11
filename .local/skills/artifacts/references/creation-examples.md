## Examples

<!-- BEGIN_EXAMPLES -->
### Mobile app (`expo`)

```javascript
const result = await createArtifact({
    artifactType: "expo",
    slug: "my-app",
    previewPath: "/",
    title: "My App",
    description: "A mobile companion app for tracking daily tasks on the go. Lets the user add and check off tasks, organize them by project, and see what is due today at a glance."
});
const expoPort = result.ports.expo;
const expoWorkflow = result.workflows.expo; // "artifacts/my-app: expo"

// Expo is scaffolded under artifacts/my-app
// and API work should be added to the shared api-server.
//
// Immediately before building Expo UI, inspect the current Artifacts state.
// Use an explicitly passed design system when present. Otherwise, default to an
// available design system. With several, prefer one consumed by the sibling,
// then one implied by the request, and ask only if still ambiguous. Follow its
// docs/AGENTS.md, docs/consuming-expo.md, and docs/migrating-expo.md; import it
// directly and delete the Expo scaffold's local theme files. Only when no design
// system exists,
// wait for the sibling web build and sync its tokens into the local theme. See
// multi-artifact-creation.md "Visual Consistency" for the full sequence.
await presentArtifact({ artifactId: result.artifactId });
```

Then call `SuggestUserAction({ action: "deploy", message: "The app is ready to publish." })` to recommend publishing the app.

### Dashboard scaffold with chart/table defaults (`data-visualization`)

```javascript
const result = await createArtifact({
    artifactType: "data-visualization",
    slug: "sales-dashboard",
    previewPath: "/sales-dashboard/",
    title: "Sales Dashboard",
    description: "An interactive dashboard visualizing monthly sales by region from the uploaded sales data. Includes trend charts, per-region breakdowns, and a sortable table of top-performing products."
});

// Recharts, PapaParse, and TanStack React Table are pre-configured
// Build the dashboard in artifacts/sales-dashboard following the
// data-visualization skill.
await presentArtifact({ artifactId: result.artifactId });
```

Then call `SuggestUserAction({ action: "deploy", message: "The dashboard is ready to publish." })` to recommend publishing the app.

Creates a data visualization dashboard with Recharts (charts), PapaParse (CSV parsing), and TanStack React Table (data tables) pre-configured.
<!-- END_EXAMPLES -->

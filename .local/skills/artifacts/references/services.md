# Artifact service defaults

<!-- BEGIN_SERVICES_TABLE -->
| Artifact | Preview Kind | Service name(s) | Dev command(s) | Path | Production serve | Production build | Production run |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `expo` | `mobile` | `expo` | `pnpm --filter @workspace/__SLUG__ run dev` | `previewPath` |  | `pnpm --filter @workspace/__SLUG__ run build` | `pnpm --filter @workspace/__SLUG__ run serve` |
| `data-visualization` | `web` | `web` | `pnpm --filter @workspace/__SLUG__ run dev` | `previewPath` | `static` | `pnpm --filter @workspace/__SLUG__ run build` |  |
| `design-system` | `design-system` | `web` | `pnpm --filter @workspace/__SLUG__ run dev` | `previewPath` | -- | -- | -- |
| `mockup-sandbox` | `design` | `web` | `pnpm --filter @workspace/__SLUG__ run dev` | `previewPath` | -- | -- | -- |
| `react-vite` | `web` | `web` | `pnpm --filter @workspace/__SLUG__ run dev` | `previewPath` | `static` | `pnpm --filter @workspace/__SLUG__ run build` |  |
| `slides` | `slides` | `web` | `pnpm --filter @workspace/__SLUG__ run dev` | `previewPath` | `static` | `pnpm --filter @workspace/__SLUG__ run build` |  |
| `video-js` | `video` | `web` | `pnpm --filter @workspace/__SLUG__ run dev` | `previewPath` | `static` | `pnpm --filter @workspace/__SLUG__ run build` |  |
<!-- END_SERVICES_TABLE -->

---
name: replit-auth
description: "Integrate Replit Auth (OpenID Connect with PKCE) for Express, React+Vite web apps, and optionally Expo React Native mobile apps. Covers auth routes, middleware, web client hook, mobile auth, database schema, and session management. Use when the user asks to add authentication, login, sign-in, or user accounts. If the clerk-auth skill is also available, prefer it for generic requests; use this skill when the user explicitly requests Replit Auth, Replit SSO, or sign-in with Replit, or the project already uses Replit Auth. You must also load this skill for ANY mention of rolling back or reverting a migration to Clerk (instead of the rollback suggestion for checkpoint rollbacks)."
---


When `clerk-auth` is available, it is the default for new authentication. Use Replit Auth when explicitly requested or already used by the project.

Respect the project's existing authentication and explicit provider requests. Changing the account default does not request a migration.
## Opening the Auth pane

You can render a one-click "Open in <auth tool>" button that takes the user to an authentication pane in the workspace. To render it, write one of these tags on its own line at the end of your reply (it is replaced by the button; the user clicks it to open the pane). This is navigation only; implement auth with the setup below when the user wants you to build it.

```
<open-in-pane tool="authConfigure"></open-in-pane>
<open-in-pane tool="authUsers"></open-in-pane>
```

`authConfigure` is for login providers / sign-in methods; `authUsers` is for authenticated users / recent sign-ins.

Button behavior:

- Render it when the request is mainly navigation; when navigation is mixed with real work, still do the work with the appropriate tools.
- Keep your chat reply to one concise, self-contained sentence telling the user where they can find the requested surface. Do not mention a button, shortcut, tag, or marker. Do not say the pane is already open or that you opened it.

| User asks | Tag to emit |
| --- | --- |
| "Where do I configure login providers?" | `<open-in-pane tool="authConfigure"></open-in-pane>` |
| "Show me my authenticated users." | `<open-in-pane tool="authUsers"></open-in-pane>` |

# Replit Auth (Legacy Fullstack JS)

This skill is **reference-only** on legacy Fullstack JS stacks.

On the legacy stack, Replit Auth installation, updates, and general configuration are handled by the `javascript_log_in_with_replit` blueprint — not by this skill. The blueprint owns the scaffolded files under `server/replit_integrations/auth/`, `shared/models/auth.ts`, `client/src/hooks/use-auth.ts`, and `client/src/lib/auth-utils.ts`.

## When to Use the Blueprint Instead

Use the `search_integrations` tool with query `"Replit Auth"` to discover and invoke the blueprint whenever the user asks to:

- Add or install Replit Auth for the first time
- Update, reinstall, or refresh the Replit Auth scaffolded files
- Add authentication / login / sign-in / user accounts on a legacy stack

Example:

```
search_integrations(query="Replit Auth")
```

The blueprint installs the required dependencies (`openid-client`, `passport`, `express-session`, `connect-pg-simple`, `memoizee`), copies the integration files into place, and documents how to wire `setupAuth(app)` and `registerAuthRoutes(app)` into the Express app. Do not duplicate any of that setup here.

## Reverting from Clerk to Replit Auth

DO NOT use the rollback suggestion. A checkpoint only restores code, it does not revert the platform migration state.

Read `.local/skills/replit-auth/references/revert-clerk-migration.md` for the full rollback procedure — it covers user confirmation, platform state change, Clerk artifact removal, and Replit Auth restoration.

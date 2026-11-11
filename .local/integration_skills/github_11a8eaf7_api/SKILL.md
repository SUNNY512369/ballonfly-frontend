---
name: github_11a8eaf7_api
description: "GitHub from this Repl's code through the connectors SDK, as github_11a8eaf7_api."
handle: "github_11a8eaf7_api"
route: api
connectorName: "github-source-control"
permissions:
  - "project"
  - "read:org"
  - "read:user"
  - "repo"
  - "user:email"
---

# GitHub

## How to call

Application code reaches this connection through the Replit connectors SDK.

From CodeExecution, call `listConnections("github-source-control")` inside a `"use impure"` function, then the connection's `proxyFetch(path, init)`, or `getClient()` when `hasClient` is true; the `query-integration-data` skill shows the pattern. It returns every connection of this connector attached to this Repl; with more than one, pick the account by its `displayName`.

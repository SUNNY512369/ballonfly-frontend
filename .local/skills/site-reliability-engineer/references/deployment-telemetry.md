# Deployment Telemetry

The read-only tools available for investigating a production issue. Call them
from CodeExecution.

Read this alongside `root-cause-analysis.md`: that file is the method, this one
is the instrument panel.

## Two Log Readers — Use the Right One

There are two runtime-log callbacks and they are not interchangeable:

- **`getDeploymentLogs`** — the cloud provider's logs through Skyplane. Severity
  and revision filters, cursor pagination. **This is the one you want.** It is
  gated on the same Statsig decision as this skill, so if you can read this file
  you can call it.
- `fetchDeploymentLogs` — the older pid2-backed reader. It belongs to the
  `deployment` skill's publish-failure path. It takes RE2 regex and Unix
  millisecond timestamps, so its parameters do **not** transfer. Do not use it
  here.

## Time and Window Rules

Every tool below takes **ISO-8601 strings**, not Unix timestamps:

- `startTime` is inclusive, `endTime` is exclusive.
- `endTime` may be at most **30 days** after `startTime`. A wider window is
  rejected, and nothing reaches back further than that.

```javascript
const end = new Date();
const start = new Date(end.getTime() - 6 * 60 * 60 * 1000); // 6 hours
const window = { startTime: start.toISOString(), endTime: end.toISOString() };
```

## getDeploymentInfo()

Current deployment state. Call this first, always. It decides whether the
investigation is worth running at all.

**Returns:**

- `success` (bool) — `false` means the deployments service is unreachable.
  Report "deployment status unavailable"; do not conclude there is no deployment.
- `isDeployed` (bool) — `false` means nothing is published. Stop and report that.
- `primaryUrl` (str) — production URL. Empty when undeployed.
- `additionalUrls` (list[str]) — other public URLs (verified custom domains).
- `deploymentType` (str) — `"autoscale"`, `"vm"`, `"static"`, `"scheduled"`, `""`.
- `hasSuccessfulBuild` (bool) — `true` only when the current build succeeded.
- `visibility` (str) — `"public"`, `"private"`, `"password"`, or `""`.

Several of these end an investigation before you read a log line — see "Read
Deployment State First" in `root-cause-analysis.md`.

## getDeploymentLogs({ startTime, endTime, minSeverity, messageQuery, revisionId, pageSize, cursor })

Runtime logs from the deployed app, **newest first**.

**Parameters:**

- `startTime` / `endTime` (str, required) — ISO-8601, 30-day max span.
- `minSeverity` (str, optional) — `"debug"`, `"info"`, `"warning"`, `"error"`,
  `"critical"`. Returns that level **and above**.
- `messageQuery` (str, optional, ≤256 chars) — **case-insensitive substring**,
  not a regex. `"(?i)(error|exception)"` matches nothing; it is treated as
  literal text. To cover several terms, make several calls.
- `revisionId` (str, optional) — only entries from one deployment revision.
- `pageSize` (int, optional) — 1–100.
- `cursor` (str, optional) — from a previous page's `nextCursor`.

**Returns:** `{ success, logs, entryCount, truncated, nextCursor? }` on success,
`{ success: false, error }` otherwise.

- `truncated` — output was cut, either trailing entries dropped or a long
  message sliced. **Check this.** Reasoning over a truncated page produces a
  wrong answer.
- `nextCursor` — absent on the last page and when whole entries were dropped.

### Using it well

**Prefer `minSeverity` over `messageQuery`.** Severity is a real filter; the
substring match is literal and easy to get wrong. Start with
`minSeverity: "error"` over the window and read what comes back.

**Use `revisionId` to test a deploy directly.** Take the revision from
`listDeploymentBuilds`, pull errors for that revision alone, then the one
before. That answers "did this deploy break it" without inferring from
timestamps.

**Substring terms that actually work:** `"Traceback"`, `"ECONNREFUSED"`,
`"OOM"`, `"timeout"`, `"unauthorized"`, `"cannot find module"`. One term per
call.

## getSupportedDeploymentMetrics()

Discovery. Call this **before** `queryDeploymentMetrics` — metric availability
depends on deployment type, and a guessed metric name is rejected.

**Returns:** `{ success, supportsEndpointMetrics, metrics[] }`, each metric with
`metric`, `displayName`, `description`, `unit`, `kind`, `supportedAggregations`,
`defaultAggregation`, `supportedResultShapes`, `minStepSeconds`.

`supportsEndpointMetrics` tells you whether `getDeploymentEndpointMetrics` will
serve this deployment.

Metric names are lowercase proto enum names:

- `http_request_count`
- `http_request_latency`
- `http_response_4xx_count`
- `http_response_5xx_count`
- `http_availability`
- `compute_cpu_utilization`
- `compute_memory_utilization`
- `compute_startup_latency`
- `compute_uptime`
- `compute_instance_count`
- `network_egress_bytes`
- `storage_disk_usage_bytes`
- `storage_disk_utilization`
- `log_error_count`

`log_error_count` counts application log entries classified at error severity or
higher. Query it only when discovery returns it. Use `getDeploymentLogs` to read
the messages behind the count.

Aggregations: `sum`, `avg`, `min`, `max`, `count`, `latest`, `p50`, `p95`, `p99`.
Units: `count`, `percent`, `bytes`, `seconds`, `milliseconds`,
`bytes_per_second`, `count_per_second`, `none`.

## queryDeploymentMetrics({ startTime, endTime, stepSeconds, queries })

Time series or aggregate values for up to 10 metrics in one batch.

**Parameters:**

- `startTime` / `endTime` (str, required) — ISO-8601, 30-day max span.
- `stepSeconds` (int, optional) — window size, minimum 60, must be a multiple of
  60. Defaults to a step yielding at most 120 windows across the batch; the hard
  cap is 500 points total.
- `queries` (array, 1–10 required) — each `{ metric, aggregation?, resultShape? }`.
  - `aggregation` defaults to the metric's `defaultAggregation`.
  - `resultShape` is `"time_series"` (default, one point per window) or
    `"value"` (one aggregated point for the whole interval).

**Returns:** `{ success, stepSeconds?, results[] }` where each result is
`{ metric, aggregation, points: [{ time, value }] }`.

```javascript
const metrics = await queryDeploymentMetrics({
    ...window,
    queries: [
        { metric: "http_response_5xx_count", resultShape: "time_series" },
        { metric: "http_request_count", resultShape: "value" },
        { metric: "http_request_latency", aggregation: "avg" },
    ],
});
```

**Batch rather than loop.** Ten metrics in one call cost one round trip and
share a step, so the series line up on the same time axis. Ten separate calls
may not.

**Use `value` to confirm, `time_series` to locate.** One aggregated number
answers "did this happen"; the series tells you when it started.

## getDeploymentEndpointMetrics({ startTime, endTime, limit })

Per-endpoint breakdown. Check `supportsEndpointMetrics` first.

**Parameters:** `startTime` / `endTime` (required, ISO-8601), `limit` (optional,
1–100, defaults to 25).

**Returns:** `{ success, endpoints[] }`, each with `endpoint`, `requestCount`,
`avgLatencyMs?`, `p50LatencyMs?`, `p95LatencyMs?`, `p99LatencyMs?`,
`response4xxCount`, `response5xxCount`.

This is what turns "the app is slow" into "`/api/orders` is at 4.2s p95 while
everything else is under 200ms". When a symptom names a route, start here.

Paths are normalized (`/api/orders/123` → `/api/orders/:param`) and latencies
are milliseconds; percentiles are approximate. A single endpoint carrying most
of the 5xx count or a p95 far above its siblings points directly at the code
path to inspect.

## listDeploymentBuilds({ limit })

Recent builds — the deploy history. Use it to find what changed.

**Parameters:** `limit` (int, optional) — 1–100, default 10.

**Returns:** `{ success, builds }`, each with `id`, `status`, `provider`,
`timeCreated`, `timeUpdated`, `user`.

`timeCreated` against your symptom window is the correlation that matters, and
the build id is what you feed to `revisionId` in `getDeploymentLogs`.

## getDeploymentBuild({ buildId, skipLogs })

One build in detail, including build logs.

**Parameters:** `buildId` (str, required), `skipLogs` (bool, optional — pass
`true` when you only need status and timing).

**Returns:** `{ success, build }` with `id`, `status`, `provider`,
`timeCreated`, `timeUpdated`, `suspendedReason?`, `user`,
`machineConfiguration?`, and `logs` (array of strings, may contain ANSI escapes).

Build logs explain *what changed*, not why a live app is failing. A build that
failed outright is the caller's problem, not yours — see `root-cause-analysis.md`.

## Failure Handling

Every tool returns `{ success: false, error }` rather than throwing. Two cases
to distinguish:

- **Skyplane unavailable** — infrastructure is not answering. Report that the
  telemetry is unavailable; do not conclude the app is healthy.
- **Authorization denied** — fails closed and is never retried. Report it and
  stop. Calling again will not help.

"I could not read the telemetry" is a legitimate result. Silence or an invented
conclusion is not.

## Output Budget

Your stdout observation is capped around 4K per call. Long log pages and dense
series get truncated, and a truncated dump you then reason about is a wrong
answer waiting to happen.

Slice before printing. Print the lines you will quote and the numbers you will
cite, not everything you fetched. For logs, check `truncated` in the result
rather than trusting what reached stdout.

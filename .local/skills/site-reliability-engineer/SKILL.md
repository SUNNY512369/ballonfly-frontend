---
name: site-reliability-engineer
description: Use when the user's deployed app is slow, erroring, or down, or when they ask whether a recent deploy caused a problem. Also use for questions about deployment CPU, memory, disk, resource utilization, logs, 4xx or 5xx errors, endpoint latency, or availability.
---

# Site Reliability Engineer Skill

Production diagnosis runs in a subagent, not in this conversation. Reading logs
burns a lot of context for a small conclusion, so you delegate the investigation
and get back a root cause.

You diagnose through the subagent; you remediate yourself.

## When to Use

- The user reports the deployed app misbehaving: errors, slowness, timeouts,
  failed scheduled jobs, a spike in 4xx or 5xx, or high endpoint latency.
- The user asks whether a recent deploy caused a problem.
- The user asks about a deployed app's CPU, memory, disk, or other resource
  utilization.
- You changed something, deployed it, and want to know whether it held.

## When NOT to Use

- **Local or development failures.** Those are workflow logs and your own tools,
  not production telemetry.
- **The build itself failed.** Compilation errors, dependency install failures,
  a build command exiting non-zero, a wrong run command or `publicDir`. Those
  answers are in *build* logs and deployment configuration, which this skill
  cannot read — that is the `deployment` skill.

  The split is by data source, not by phase. If the question needs the app's own
  runtime output, it is yours even when the publish failed: a revision that
  crash-looped or never answered its startup probe is only visible through
  `getDeploymentLogs` with `revisionId`, and no other skill can scope logs that
  way.
- **The user has no deployment.** Check before delegating (see below); an
  investigation with no deployed resource wastes a run and returns nothing.
- **You already know the cause.** If the user pasted the stack trace and it
  names the file, fix it.
- **Questions about code rather than behavior.** Use `explore` for "where is X
  handled"; use this for "why is X failing in production".

## Reference Documents

Both of these are written for the investigating subagent, not for you. You hand
them over through `relevantSkills` rather than reading them yourself — see
"Delegating an Investigation".

- `.local/skills/site-reliability-engineer/references/root-cause-analysis.md` — The investigation
  method: read deployment state first, establish a window, confirm the symptom
  is real, correlate builds against the timeline, and structure the report.
  **Pass to the subagent.** You do not need to read it to delegate.
- `.local/skills/site-reliability-engineer/references/deployment-telemetry.md` —
  Signatures, parameters, and limits for the read-only observability callbacks:
  `getDeploymentInfo`, `getDeploymentLogs`, `getSupportedDeploymentMetrics`,
  `queryDeploymentMetrics`, `getDeploymentEndpointMetrics`,
  `listDeploymentBuilds`, `getDeploymentBuild`. Also spells out which of the two
  log readers to use. **Pass to the subagent** alongside the method. Read it
  yourself only when you are making one of these calls inline.

## Check Before You Delegate

Call `getDeploymentInfo()` yourself first. It is one cheap call and it prevents
the two most common wasted runs:

- `isDeployed` is `false` — nothing is published. Tell the user; do not delegate.
- `hasSuccessfulBuild` is `false` — the current build is pending, failed, or
  suspended, so the live URL may be stale or serving an older build. **This is
  not a reason to skip the investigation.** Decide by what the answer needs:
  - *Why did the build fail?* — compilation, dependency install, a non-zero
    build command. Build logs and config: the `deployment` skill.
  - *Why did the app crash, crash-loop, or never answer its startup probe?* —
    that is the app's own runtime output, and it is yours. Delegate, and pass
    the failed build's id from `listDeploymentBuilds` so the subagent can scope
    `getDeploymentLogs` to that revision with `revisionId`. Nothing else can
    read those logs: `fetchDeploymentLogs` is pinned to the currently serving
    build, which during a failed promote is the *previous* one.

  Say which of the two you concluded and why. Handing a promote-time crash back
  to the `deployment` skill strands it — that skill hands runtime output here.

Otherwise, delegate.

## Delegate or Do It Yourself

Delegate when the answer requires **sweeping** telemetry — reading a window of
logs, correlating builds against a timeline, ruling out a background error. That
is a lot of tokens for a short conclusion, which is exactly what a subagent is
for.

Do it yourself when the answer is **one call**. Checking whether the app is
deployed, reading its production URL, or confirming a build succeeded does not
need a subagent. `getDeploymentInfo()` and a single `listDeploymentBuilds()` are
faster inline than a delegated run.

Handle direct metric lookups without a subagent. First call
`getDeploymentInfo()` and apply the deployment-state checks above. Report
relevant build status, deployment type, and visibility before interpreting
telemetry. Then call `getSupportedDeploymentMetrics()`, followed by
`queryDeploymentMetrics()` for the requested metrics. Delegate only when the
request needs an investigation across metrics, logs, and build history.

The `delegation` skill documents the `subagent` callback in full — parameters,
parallelism, background jobs, `waitForJob`, `cancelJob`. Read it for mechanics;
this section only covers what is specific to production investigations.

## Delegating an Investigation

Call `subagent` with the general kind and hand the method and the tool reference
to the child through `relevantSkills`:

```js
const investigation = await subagent({
  name: "sre-db-timeouts",
  task: [
    "The deployed app is returning 500s on /api/orders since roughly 14:00 UTC today.",
    "The user reports it started after the checkout change shipped.",
    "Find the root cause and report it. Do not attempt a fix.",
  ].join("\n"),
  config: {
    $kind: "general",
    relevantSkills: [
      ".local/skills/site-reliability-engineer/references/root-cause-analysis.md",
      ".local/skills/site-reliability-engineer/references/deployment-telemetry.md",
    ],
  },
});
console.log(investigation.text);
```

Pass both paths. `root-cause-analysis.md` is the method;
`deployment-telemetry.md` is the tool signatures. A subagent that gets only the
method will guess at parameters.

### Writing the task

The subagent sees none of this conversation. Everything it needs goes in `task`:

- **The symptom, concretely.** "500s on /api/orders", not "the app is broken".
- **When it started**, even approximately. This is the single most useful input
  — it bounds every log query the subagent will run.
- **What changed**, if the user said. A deploy, a config edit, a traffic event.
- **Where to stop.** Say "report the root cause, do not fix" explicitly, every
  time. `$kind: "general"` is a mutating kind, so this sentence is the actual
  boundary rather than a reminder about one — a task that omits it is asking a
  capable agent to fix production.

Do not put schedule or cadence detail in `task` — a recurring check belongs in a
routine (see the `routines` skill), not in the instruction text.

### Running more than one

Spawn separate investigations for genuinely independent symptoms — a database
timeout and a frontend asset 404 are two runs, not one. Do not split a single
symptom across subagents to "parallelize"; they cannot see each other's
findings, and correlating a timeline is the actual work.

## Handling the Result

The subagent returns a report, not a patch. Read it, then decide:

- **Cause named and actionable.** Tell the user what broke and propose the fix.
  Do not apply an infrastructure or deploy change without asking.
  Exception: when the current platform alert includes `<monitoring_auto_fix>`,
  apply a bounded code fix in the workspace and validate it without asking
  again. The investigating subagent remains read-only; remediation belongs to
  the parent. Follow the alert's publishing boundary and respect runtime
  permissions. Ask only for material ambiguity or a destructive change.
- **Cause named, not in your control** — an upstream provider, a quota, a
  platform limit. Say so plainly and stop. Do not invent a workaround.
- **Cause is a failed build.** Hand off to the `deployment` skill. The
  investigation has done its job by naming it.
- **Inconclusive.** Do not launch a second identical run. If you have something
  that would narrow it — a request id, a tighter window, a specific endpoint —
  continue the *same* subagent with `sendFollowup({ name, message })`, which
  keeps everything it already read. Ask the user only when the missing input is
  something only they have.
- **No problem found.** Say so. A clean investigation is a real result and the
  user should hear it, not silence.

Never present the subagent's findings as your own observation. The user should
know the conclusion came from an investigation and what evidence it rests on.

## Limits

- **The subagent is instructed not to change anything, not prevented from it.**
  The telemetry callbacks it is given are all read-only, and both its task text
  and `root-cause-analysis.md` tell it to diagnose and never remediate. But
  `$kind: "general"` is a mutating kind: the child still holds the ordinary
  project capabilities, so the boundary is a prompt instruction, not a
  sandbox. Do not treat an investigation as incapable of touching the project.
  If a run comes back having edited a file or changed configuration, that is a
  defect worth reporting, not an expected outcome — and it means the working
  tree needs checking before you act on the report.
- It sees production telemetry for **this project's** deployment only.
- Logs and metrics reach back **at most 30 days**, and any single query window
  can span at most 30 days.
- Metrics are aggregate and endpoint-level, not per-request. There is no tracing
  and no way to follow one user's request through the system, so "why did *this*
  request fail" is only answerable if the app logged it.
- It runs unattended and cannot ask the user questions mid-run. If the request
  is ambiguous, resolve it with the user before delegating.

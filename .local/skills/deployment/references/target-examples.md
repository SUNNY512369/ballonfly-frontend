# Deployment targets and production commands

## autoscale (Recommended Default)

Use for stateless websites and APIs that don't need persistent server memory.

- **Best for:** Web applications, REST APIs, stateless services
- **Behavior:** Scales up/down based on traffic, only runs when requests arrive
- **State:** Use databases for persistent state (not server memory)
- **Cost:** Most cost-effective for variable traffic

```javascript
await deployConfig({
    deploymentTarget: "autoscale",
    run: ["gunicorn", "--bind=0.0.0.0:5000", "app:app"]
});
```

## vm (Always Running)

Use for applications that need persistent server-side state or long-running processes.

- **Best for:** Discord/Telegram bots, WebSocket servers, web scrapers, background workers
- **Behavior:** Always running, maintains state in server memory
- **State:** Can use in-memory databases, local files, or external databases

```javascript
await deployConfig({
    deploymentTarget: "vm",
    run: ["python", "bot.py"]
});
```

## scheduled

Use for cron-like jobs that run on a schedule.

- **Best for:** Data processing, cleanup tasks, periodic reports, batch jobs
- **Behavior:** Runs on configured schedule, not continuously
- **Note:** Do NOT use for websites or APIs

```javascript
await deployConfig({
    deploymentTarget: "scheduled",
    run: ["python", "daily_report.py"]
});
```

## static

Use for client-side websites with no backend server.

- **Best for:** Static HTML sites, SPAs (React, Vue, etc.), documentation sites
- **Behavior:** Serves static files directly, no server-side processing
- **Note:** The `run` command is ignored; must specify `publicDir`

```javascript
await deployConfig({
    deploymentTarget: "static",
    build: ["npm", "run", "build"],
    publicDir: "dist"
});
```
## Run Command Examples

Use production-ready servers, not development servers:

```toml
# Python with Gunicorn
run=["gunicorn", "--bind=0.0.0.0:5000", "--reuse-port", "main:app"]

# Python with Streamlit
run=["streamlit", "run", "main.py"]

# Node.js
run=["node", "server.js"]

# Multiple processes with bash
run=["bash", "-c", "gunicorn --reuse-port -w 4 -b 0.0.0.0:8000 app:app & npm run dev"]
```

## Build Command Examples

Only use build commands when compilation is needed:

```toml
# TypeScript/bundler
build=["npm", "run", "build"]

# Multiple build steps
build=["bash", "-c", "make assets && make compile"]

# Rust
build=["cargo", "build", "--release"]
```

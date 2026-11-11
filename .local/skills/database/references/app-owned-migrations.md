# App-owned database migrations

The database skill points here. With app-owned migrations, the app owns its
schema: migration files are committed to the repository, and the app applies
the pending ones when it starts. This is true in development and in
production. Publish still creates the production database, but it never
compares schemas, applies SQL, or copies development data into production.

## When this applies

A project uses app-owned migrations only when one of these is true:

- `viewEnvVars` shows `REPLIT_DATABASE_MIGRATIONS=app`.
- It is a pnpm workspace with `lib/db`, and it is creating its first tables
  now: `SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'`
  returns 0 on the development database. Do the one-time setup below first.

Every other project keeps Publish-managed schema changes, including any project
whose database already has tables: follow the database skill's Publish rules,
and do not declare the variable or follow this file. Converting such a project
breaks its next publish: Publish already created its production tables, so the
app's first migration would try to create them again and the app would not
start. If the user asks to convert one, explain that this is not supported yet.

## Rules

- Never run `drizzle-kit push`, `push`, `push-force`, or `db:push` against any
  database. Another skill or an older script that says to push means
  "generate a migration and apply it" here.
- Never change the schema with `executeSql` DDL (`CREATE`, `ALTER`, `DROP`).
  Read-only queries and development data fixes are fine.
- Every schema change follows the same loop: edit the Drizzle schema, generate
  a migration, read the generated SQL, apply it to the development database,
  and commit the schema and the migration together.
- Never edit or delete a migration after it is committed. A published app may
  already have applied it. Fix mistakes with a new migration.
- Do not write deploy build steps, startup DDL, or scripts that target the
  production database. The app's startup migration is the only path to
  production.
- Migrations only add or loosen. Never drop, rename, or change the type of a
  table or column, even when the user asks to (see "Only additive changes").
- The project must declare `REPLIT_DATABASE_MIGRATIONS=app` (setup step 1).
  Publish reads it to leave the production schema to the app. Without it,
  Publish applies its own schema changes and the app's startup migration then
  repeats them, so the published app fails to start.

## One-time setup (pnpm workspace)

Do this once, when the project creates its first tables (see "When this
applies"), before generating the first migration.

1. Declare app-owned migrations in the shared environment. Do not edit
   `.replit` by hand.

   ```javascript
   await setEnvVars({
     environment: "shared",
     values: { REPLIT_DATABASE_MIGRATIONS: "app" },
   });
   ```

   Check it with `viewEnvVars` before telling the user to publish. Never remove
   it later: once the app has migrated a production database, Publish must
   keep leaving that schema to the app.
2. In `lib/db/drizzle.config.ts`, set `out: "./migrations"` next to the existing
   `schema` and `dialect` settings. Keep the rest of the file unchanged.
3. In `lib/db/package.json`, replace the `push` and `push-force` scripts:

   ```json
   {
     "scripts": {
       "generate": "drizzle-kit generate --config ./drizzle.config.ts",
       "migrate": "drizzle-kit migrate --config ./drizzle.config.ts"
     }
   }
   ```

4. Add `lib/db/src/migrate.ts` and export `runMigrations` from the package
   index. The advisory lock keeps several production instances that start at
   once from applying the same migration twice. Drizzle records applied
   migrations in `drizzle.__drizzle_migrations`, the same table
   `drizzle-kit migrate` uses in development.

   ```typescript
   import { drizzle } from "drizzle-orm/node-postgres";
   import { migrate } from "drizzle-orm/node-postgres/migrator";
   import pg from "pg";

   // Any fixed number; every instance of this app must use the same one.
   const MIGRATION_LOCK_ID = 727_001;

   // The advisory lock belongs to one database session, which a connection
   // pooler does not keep. Neon names its pooled endpoint `<endpoint>-pooler`.
   function directConnectionString(url: string): string {
     const parsed = new URL(url);
     parsed.hostname = parsed.hostname.replace("-pooler.", ".");
     return parsed.toString();
   }

   export async function runMigrations(migrationsFolder: string): Promise<void> {
     const client = new pg.Client({
       connectionString: directConnectionString(process.env.DATABASE_URL!),
     });
     await client.connect();
     try {
       await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_ID]);
       await migrate(drizzle(client), { migrationsFolder });
     } finally {
       await client.end();
     }
   }
   ```

   Closing the connection releases the session lock, so no explicit unlock is
   needed. The app's own queries can keep using `DATABASE_URL` as is.

5. In the API server entrypoint, `await runMigrations(...)` before
   `app.listen`. If migrating throws, log the error and exit with a non-zero
   code so the failure is visible instead of serving requests against an old
   schema. Pass an absolute path to `lib/db/migrations`. When the server is
   bundled, `import.meta.url` points at the bundle, so resolve the folder
   from the workspace root, not from the source file.
6. Make `scripts/post-merge.sh` run `pnpm --filter @workspace/db run migrate`
   instead of `push-force`.
7. Run the production build and start command locally once and confirm the
   server finds the migrations folder and starts.

## Changing the schema

```bash
pnpm --filter @workspace/db run generate --name add_due_date_to_tasks
# read lib/db/migrations/<new file>.sql before applying it
pnpm --filter @workspace/db run migrate
```

Pass flags straight after the script name. pnpm forwards a literal `--`, so
`run generate -- --name x` fails.

Restart the API server workflow afterwards; it applies nothing new in
development because `migrate` already did, but it proves startup still works.

### Only additive changes

Each migration only adds or loosens: new tables, new columns that are nullable
or have a default, new indexes, new enum values, and adding a default to an
existing column. Never drop `NOT NULL`: the previous version may read the
column and would get `NULL` where it expects a value. While a publish runs, the previous version of the app can
still be serving and writing against the same database, so everything it reads
and writes must keep working.

- To rename a column or table, rename it in code only and keep its database
  name, for example `name: varchar("title")` or
  `export const tasks = pgTable("todos", ...)`. `generate` then produces no
  migration.
- To remove a column, stop using it in code and keep it in the schema. If it
  is `NOT NULL` without a default, add a `.default(...)` the previous version
  can read in the same change, because the new code no longer writes it. Keep
  `.notNull()`.
- Do not copy or derive data between columns in a migration; the previous
  version keeps writing the old column while the new one is published.
- Tell the user when something stays in the database, and that removing it is
  a separate, manual change.

`drizzle-kit generate` stops to ask whether a change is a rename whenever a
schema edit removes something and adds something. The shell has no terminal,
so it fails with `Interactive prompts require a TTY`. That error means the edit
removed something from the database schema; restore it.

## Seeding

Seed development data with a script or `executeSql` inserts after the
migrations are applied. Do not put seed data in migrations unless production
needs the same rows, such as fixed lookup values.

## When something is wrong in production

Production problems are fixed with a new migration and a re-publish. The app
applies it on startup. Use `executeSql({ environment: "production" })` only for
read-only checks, such as
`SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at`.

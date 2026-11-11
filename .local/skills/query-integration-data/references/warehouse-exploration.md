# Warehouse schema exploration

Before querying, follow the billing safeguards in [the entrypoint](../SKILL.md#critical-warehouse-queries-are-billed-per-byte-scanned).

### When to Use Parallel Exploration

Use this pattern when ALL of the following are true:

- The target is a **warehouse** connection (`bigquery`, `snowflake`, or `databricks`)
- The initial INFORMATION_SCHEMA query returns **15+ tables**
- The user's question is **not about a specific known table** (e.g., they're asking a broad question like "what's our revenue trend?" or "show me customer data")

If the schema has fewer than 15 tables, serial exploration is fast enough -- just query tables one-by-one.

### 4-Step Parallel Workflow

**Step 1: Schema Discovery** -- Run a single `executeSql` call to get the full table list.

```javascript
// BigQuery
const tables = await executeSql({ sqlQuery: `SELECT table_schema, table_name, row_count FROM \`project.region-us\`.INFORMATION_SCHEMA.TABLES WHERE table_schema NOT IN ('INFORMATION_SCHEMA') ORDER BY table_schema, table_name`, target: "bigquery" });

// Snowflake
const tables = await executeSql({ sqlQuery: `SELECT TABLE_SCHEMA, TABLE_NAME, ROW_COUNT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA NOT IN ('INFORMATION_SCHEMA') ORDER BY TABLE_SCHEMA, TABLE_NAME`, target: "snowflake" });

// Databricks
const tables = await executeSql({ sqlQuery: `SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('information_schema') ORDER BY table_schema, table_name`, target: "databricks" });
```

`INFORMATION_SCHEMA.TABLES` is a metadata read and is essentially free. Sampling rows
from the tables it returns is **not** free -- see the next step.

**Step 2: Group Tables** -- Partition the table list into 2-4 clusters:

- By schema/dataset name (e.g., `analytics.*`, `sales.*`, `marketing.*`)
- By name prefix (e.g., `dim_*`, `fact_*`, `stg_*`)
- By estimated relevance to the user's question (most-likely-relevant tables first)

**Step 3: Launch Parallel Subagents** -- Start one general subagent per group: (see delegation skill)

```javascript
const exploreWarehouseTask = `Explore these warehouse tables to answer: "${userQuestion}"

Connection: Use executeSql({ sqlQuery: "...", target: "bigquery" }) -- always pass target.
Dialect: BigQuery (use backtick quoting for project.dataset.table)

Tables to explore:
- analytics.events
- analytics.sessions
- analytics.conversions

For each table:
1. Run: SELECT column_name, data_type, is_partitioning_column FROM \`project.dataset\`.INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'TABLE_NAME'
2. Identify the partition / cluster column from step 1 (e.g. event_date, _PARTITIONTIME).
3. Sample rows -- project exact columns, scope by partition, and LIMIT.
   NEVER \`SELECT *\` on a fact table on a billed warehouse -- \`LIMIT 5\` does not
   undo the bytes scanned by selecting every column.
   Pattern: SELECT <subset of columns from step 1>
            FROM \`project.dataset.TABLE_NAME\`
            WHERE <partition_col> >= CURRENT_DATE() - 7
            LIMIT 5

Return your findings in this exact format:

## Table Relevance
| Table | Relevant? | Why |
|-------|-----------|-----|
| ... | Yes/No | Brief reason |

## Column Details (relevant tables only)
| Table | Column | Type | Notes |
|-------|--------|------|-------|
| ... | ... | ... | Key field, foreign key, metric, etc. |

## Suggested Join Conditions
- table_a.id = table_b.a_id (describe relationship)

## Key Findings
- Bullet points about data patterns, date ranges, notable values`;
const group1 = subagent({
  name: "explore-warehouse",
  task: exploreWarehouseTask,
  config: { $kind: "general", relevantFiles: ['.local/skills/database/SKILL.md'] },
});

// Launch additional subagents for other groups (2-4 total)
const group2 = subagent({ /* same pattern, different tables, config: { $kind: "general" } */ });
const groupResults = await Promise.all([group1, group2]);
for (const groupResult of groupResults) {
  console.log(groupResult.text);
}
```

**Step 4: Synthesize and Query** -- Await the schema-discovery subagents. Once they complete, read their outputs, combine the relevant tables/columns, and write the final SQL query.

### Dialect-Specific Notes

| Dialect | Table Quoting | INFORMATION_SCHEMA Path | Sample Query (project columns + partition + LIMIT) |
|---------|--------------|------------------------|------------------------------------------------------|
| BigQuery | `` `project.dataset.table` `` | `` `project.dataset`.INFORMATION_SCHEMA.COLUMNS `` | `` SELECT col_a, col_b FROM `p.d.t` WHERE event_date >= CURRENT_DATE() - 7 LIMIT 5 `` |
| Snowflake | `"DATABASE"."SCHEMA"."TABLE"` | `DATABASE.INFORMATION_SCHEMA.COLUMNS` | `SELECT col_a, col_b FROM "DB"."SCH"."TBL" WHERE event_date >= DATEADD(day, -7, CURRENT_DATE) LIMIT 5` |
| Databricks | `` `catalog.schema.table` `` | `catalog.information_schema.columns` | `` SELECT col_a, col_b FROM `c.s.t` WHERE event_date >= current_date() - INTERVAL 7 DAY LIMIT 5 `` |

**Do NOT** use `SELECT *` in the sample query column above. `LIMIT 5` does not undo
the cost of reading every column for the matched rows on a billed warehouse.

### Tips

- Each subagent should run 3-6 SQL queries (column metadata + sample data per table)
- Keep subagent count to 2-4 -- more than 4 has diminishing returns
- The structured markdown output format ensures consistent, scannable results
- After synthesis, write a single well-commented SQL query that answers the user's question

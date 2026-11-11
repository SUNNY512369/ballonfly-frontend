# Development schema workflow

These calls use the development database by default. For managed production
schema changes, follow [the Publish rules](database-migrations-on-publish.md)
instead of running DDL against production.

```javascript
// 1. Create schema
await executeSql({
    sqlQuery: `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `
});

// 2. Insert data (using parameterized query)
await executeSql({
    sqlQuery: "INSERT INTO users (email) VALUES ($1)",
    params: ['user@example.com']
});

// 3. Query data
const result = await executeSql({ sqlQuery: "SELECT * FROM users" });
console.log(result.output);
```

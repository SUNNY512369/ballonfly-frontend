# Connection and output examples

Follow the credential boundaries and connection-resolution rules in [the entrypoint](../SKILL.md) before running these examples.

## Fetch and use credentials in one impure call

```javascript
const result = await (async function() {
  "use impure";
  const conns = await listConnections('linear');
  const client = await conns[0].getClient();   // initialized SDK client — no import, no raw token handling
  return { connectionId: conns[0].id, clientReady: Boolean(client) };
})();
console.log(result);
```

## Proxy API call

```javascript
const result = await (async function() {
  "use impure";
  const conns = await listConnections('linear');
  const res = await conns[0].proxyFetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ viewer { id name } }' }),
  });
  return await res.json();
})();
console.log(result);
```

## Output formatting

```javascript
const fs = await import('node:fs');   // Node built-in — always available, no install needed

// Simple
console.log(`Answer: 42 issues created this week`);

// Tabular results - write CSV to .agents/outputs/
fs.mkdirSync('.agents/outputs', { recursive: true });
fs.writeFileSync('.agents/outputs/results.csv', csvContent);
console.log(`Exported 500 records to .agents/outputs/results.csv`);

// Write
console.log(`Created issue ENG-123: "Fix login bug"`);
console.log(`Updated 5 contacts`);
console.log(`Deleted message ID abc123`);
```

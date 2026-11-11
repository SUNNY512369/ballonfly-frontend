## Clarifying Questions

**Before write operations, gather required information.** Many APIs require IDs or specific values that the user may not know.

### When to Ask

Ask clarifying questions when the user's request requires:

- **Entity selection**: "Which project should this issue be created in?"
- **User assignment**: "Who should be assigned? Let me list the team members..."
- **Required fields**: "What priority - urgent, high, medium, or low?"
- **Ambiguous references**: "I found 3 projects matching 'backend'. Which one?"

### Pattern: Fetch Options First

For write operations, often run a read query first to get valid options:

```javascript
// User says: "Create a Linear ticket assigned to John"
// Problem: Need John's user ID, not just name

const result = await (async function() {
  "use impure";
  const conns = await listConnections('linear');
  const client = await conns[0].getClient();   // returns an initialized LinearClient — no import needed
  // Step 1: List users to find John's ID
  const users = await client.users();
  const matches = users.nodes
    .filter(u => u.name.includes('John'))
    .map(u => ({ id: u.id, name: u.name }));
  return { matches };
})();
console.log(result);

// Step 2: If ambiguous, ASK the user
// "I found John Smith and John Doe. Which one?"

// Step 3: After the user chooses, pass the selected JSON ID into a new
// "use impure" function that creates the issue.
```

### Common Multi-Step Patterns

| Action                     | First fetch...            |
| -------------------------- | ------------------------- |
| Create issue with assignee | List team members         |
| Create issue in project    | List projects             |
| Set status/priority        | Get valid workflow states |
| Add to channel             | List channels             |
| Assign to team             | List teams                |

## Running Code in the Sandbox

All connector credential work runs inside `"use impure"` functions in the `codeExecution` sandbox. Keep clients and credentials inside that function, and return only JSON-serializable results.

### Read Operations

Query data and return results:

```javascript
const result = await (async function() {
  "use impure";
  const conns = await listConnections('linear');
  const client = await conns[0].getClient();

  const issues = await client.issues({ first: 10 });
  return issues.nodes.map(issue => ({
    identifier: issue.identifier,
    title: issue.title,
    state: issue.state?.name ?? null,
  }));
})();
console.log(result);
```

### Write Operations

Create, update, or delete data:

```javascript
const result = await (async function(teamId, issueId, doneStateId) {
  "use impure";
  const conns = await listConnections('linear');
  const client = await conns[0].getClient();

  const created = await client.createIssue({ teamId, title: "Fix login bug" });
  await client.updateIssue(issueId, { stateId: doneStateId });
  await client.deleteIssue(issueId);

  return { created: created.issue?.identifier ?? null, updated: issueId, deleted: issueId };
})(team.id, issueId, doneState.id);
console.log(result);
```

### Multi-Step Operations

Keep clients and credentials inside `"use impure"` calls. Return JSON IDs or summaries, then pass those JSON values into the next impure function when another API call is needed:

```javascript
// Call 1: Get credentials and list teams
const result = await (async function() {
  "use impure";
  const conns = await listConnections('linear');
  const client = await conns[0].getClient();

  const teams = await client.teams();
  const team = teams.nodes[0];
  const users = await client.users();
  const assignee = users.nodes.find(u => u.name === 'John');

  return {
    team: { id: team.id, name: team.name },
    assignee: assignee ? { id: assignee.id, name: assignee.name } : null,
  };
})();
console.log(result);
```

```javascript
// Call 2: copy literal IDs from Call 1's output into a new impure function
const selectedTeamId = 'team-id-from-call-1-output';
const selectedAssigneeId = 'assignee-id-from-call-1-output';

const created = await (async function(teamId, assigneeId) {
  "use impure";
  const conns = await listConnections('linear');
  const client = await conns[0].getClient();

  const issue = await client.createIssue({
    teamId,
    ...(assigneeId === null ? {} : { assigneeId }),
    title: 'New feature request',
    description: 'Details here...',
  });

  return { identifier: issue.issue?.identifier ?? null, title: 'New feature request' };
})(selectedTeamId, selectedAssigneeId);
console.log(created);
```

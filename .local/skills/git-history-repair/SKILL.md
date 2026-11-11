---
name: git-history-repair
description: Repair a git repository that is missing commits or objects. Read this when git output shows "Failed to traverse parents of commit", "Could not read <sha>", "missing commit/tree/blob object", "bad object", "unable to read <sha>", or "object file ... is empty". Not for merge conflicts, detached HEAD, lock files, or authentication errors.
---

# Repairing missing git history

These errors mean git's history is missing an object. The user's files are fine.

If the error names a SHA, branch or tag you passed yourself, first run `git -c core.commitGraph=false rev-list --all >/dev/null`. If it succeeds, that revision just doesn't exist here: handle it as a normal git error.

Otherwise, call `await repairGitHistory()` once in CodeExecution. It refetches the missing objects from the remote and never changes branches, the index, the working tree or tags.

Result:
- `repaired`: rerun the command that failed.
- `intact`: every commit is readable (the check doesn't read trees or blobs). Rerun the command. If it still fails on a missing tree or blob, tell the user and suggest contacting support.
- `missingFromRemote`: the history couldn't be restored. Tell the user and suggest contacting support.
- The call fails: if the message says the procedure couldn't be found, the Repl's runtime is too old for this tool; drop this skill and handle the original error as a normal git error. Otherwise, tell the user its message and suggest contacting support.

Never try another fix: no `rm -rf .git`, `git init`, `reset --hard`, `checkout --orphan`, `gc`, `prune`, `repack -d`, `fetch --depth`/`--unshallow`, hand edits under `.git/objects`, or a second `repairGitHistory` call. These can lose the user's history.

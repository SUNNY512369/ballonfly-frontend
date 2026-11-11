# Failure patterns in large projects

Each pattern lists how it shows up to the user and how to confirm it from the survey; the fixes are in the skill's fix order. These come from real large projects; the numbers are examples of scale, not thresholds.

## Git and LFS bloat

**User sees:** everything is slow, not one feature. Checkpoints, task applies, "Update from main" and merges time out or fail. Errors mention a timeout, fetch, `index.lock`, disk quota or `OBJECT_STORE_CORRUPT`.

**Confirm:** `.git` is several GB (a few hundred MB is normal). The largest blobs in history are builds, zips, videos, datasets or reports. `.git/lfs` holds many copies of the same few files. Git steps in the survey time out.

**Seen:** a 58 GB history from committed build files; about 240 leftover cleanup files totalling about 176 GB; 316 LFS copies of the same files totalling 201 GB.

**Do:** fix order steps 2 and 5: stop new bloat first, then merge duplicate packs or prune verified LFS objects. Do not rewrite history.

## Generated output on disk

**User sees:** project feels heavy, search is slow, disk warnings, deployments are large.

**Confirm:** a top-level or nested folder of generated files dominates the size: reports, exports, screenshots, Playwright or test output, nested `dist` or `build`, caches.

**Seen:** about 19 GB of generated reports in one project; about 15,700 files of nested build output; Playwright captures missed by an ignore rule that listed old filenames one by one.

**Do:** fix order step 2. Ignore the folder, not individual filenames, so new captures are covered; ask before deleting a report or export the user asked for.

## Too many tracked files

**User sees:** Git operations and task copies are slow even though `.git` is not huge.

**Confirm:** tracked file count is in the tens of thousands, concentrated in one folder (branding variants, icons, fixtures, vendored code).

**Seen:** 19,329 tracked paths, 10,152 of them branding files.

**Do:** show the user the folder and its count. Keep what the app serves; moving bulk assets or untracking unused variants is the user's choice ("Asking about the user's files").

## `.local` growth

**User sees:** the project is much bigger than its code and Git history explain.

**Confirm:** `.local` is several GB. The survey breaks it down by subfolder.

**Seen:** about 11 GB of `.local` in a 45 GB project.

**Do:** remove only content you can identify as stale output Agent wrote for its own use. If you cannot tell what a large subfolder is, leave it and report it.

## Duplicated or overgrown instructions and memory

**User sees:** Agent "got dumber", ignores instructions, contradicts itself, or forgets decisions.

**Confirm:** `replit.md` or another instruction file is tens of KB; the survey finds the same block repeated; there are dozens to hundreds of memory files, some contradicting each other; a memory file sits right at a size cap.

**Seen:** an instruction file of 33,784 bytes that was eight identical copies of a 4,223-byte block; about 150 conflicting memory files; a required memory ledger at 7,994 of 8,000 bytes.

**Do:** fix order step 3. Resolve contradictions toward the newest explicit user decision; ask when unclear.

## Slow or duplicated validation

**User sees:** a small change takes a long time to finish; tasks never apply; `POLL_BUDGET_EXCEEDED` or review timeouts.

**Confirm:** many validation commands, several running the same build or full test suite; total runtime near or above the check time limit (about 30 minutes); failures that are identical on the baseline.

**Seen:** 33 checks taking about 36 minutes; a one-line change taking 18 minutes, 14 of them in checks; a 1,600-line script run on every apply; one checkpoint of 248 actions and over an hour driven by repeated broad validation.

**Do:** fix order step 6. Report failures that already fail on the baseline separately instead of rerunning to chase them.

## Stuck Git operations

**User sees:** "Waiting for another Git operation", applies that retry for half an hour, checkpoints that do not save.

**Confirm:** an `index.lock` or other `.lock` file with no Git process running, or `rebase-merge`, `rebase-apply` or `MERGE_HEAD` present.

**Do:** fix order step 1. Missing objects are a different problem: use `git-history-repair`.

## What is not a cleanup problem

- A task waiting for the user's reply, no free task slots, or a task queued behind another: these are task state, not bloat. Tell the user what the task is waiting on.
- Out of credits mid-task.
- Disk quota that cannot be freed from inside the project, or history that is huge only because of old commits: tell the user, and point them to support.

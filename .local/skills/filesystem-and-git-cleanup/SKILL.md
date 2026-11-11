---
name: filesystem-and-git-cleanup
description: Diagnose and clean up a project that has become large, slow or stuck, covering Git and LFS bloat, files a checkpoint skipped, oversized folders, generated output, duplicated memory and instruction files, and slow validation. Use when a checkpoint skips files, when the user asks to clean up or shrink the project, or when saving, checkpoints, tasks, search, commits or merges are slow, timing out or stuck. Not for a slow app (pages, API responses, queries) or missing Git objects (git-history-repair).
---

# Filesystem and Git cleanup

Mature projects slow down for a few repeatable reasons: saved history full of build output and media, gigabytes of generated files, instruction and memory files that grew by copy-paste, and validation that reruns everything on every change. Users report the symptom ("Agent got dumb", "tasks won't apply", "saving takes forever"), not the cause. Find the cause from measurements, fix what is safe, and leave decisions about the user's own files to the user. Git should track source and the assets the app needs, nothing else.

The known patterns, with how to confirm each one, are in [references/failure-patterns.md](references/failure-patterns.md). Read it after the survey.

## Talking to the user

Most people who hit this never chose Git and cannot weigh a choice described in its terms. In findings, questions and summaries, use the words they see in Replit: saved history is "saved versions" or "checkpoints", a tracked file is "saved with every checkpoint", ignoring a file is "stop saving it with checkpoints", object storage is "App Storage". If a technical word is unavoidable, explain it in the same sentence. Describe effects rather than mechanics: "saving is slow because every checkpoint carries 2 GB of old build files", not "the pack is 2 GB". Round sizes to MB or GB. This applies to what you write to the user, not to the commands you run.

Report only what you measured. If you did not time a checkpoint, say saving speed is unconfirmed rather than calling it faster.

## Asking about the user's files

Files the user uploaded or made, deliverables they asked for (exports, reports, generated media), anything that cannot be regenerated, and anything you are unsure about are the user's decision, because deleting the wrong one is permanent while keeping an extra one only costs disk space. A request to "clean up everything" or "make it as small as possible" does not make that decision for them.

Ask once, naming the files and their total size. First search the code for each file's name: files the app reads at runtime stop existing in fresh copies of the project (background tasks, GitHub clones) once they are no longer saved, so for those recommend App Storage instead of keeping them unsaved. Before the question, explain each choice: what happens to the files, whether the app keeps working, whether rolling back to an earlier checkpoint brings them back, and whether it can be undone. Use these labels, word for word and in this order, since each fits the six-word limit for question options. Add "(recommended)" only to "Keep files, stop saving them" or "Move them to App Storage", whichever you recommend:

- **Keep files, stop saving them:** the usual recommendation for files the app does not read. They stay in the project and the app keeps working. Earlier checkpoints keep the copies they already saved, so rolling back to one of those still restores that version; later changes, and files never in a checkpoint, are not saved. It does not free disk space. Action: add each exact path from the project root (`/media/demo.mp4`) to `.gitignore`, not a broad pattern that could hide source, and not `.replitignore` unless the user wants it out of the published app; untrack it with `git rm --cached` if it is tracked.
- **Delete them:** they leave the project and free their space. If they were in an earlier checkpoint, rolling back to it can restore them; files never saved are gone for good. Action: delete the files.
- **Move them to App Storage:** Replit's file storage for apps. The project gets smaller and the app reads them from storage. Action: upload them, update the code that references them, and check the stored copy before removing the local file.
- **Keep saving every version:** only if they need older versions of these files. The project stays large and grows each time a file changes; files the app serves belong in App Storage instead. Action: `git lfs track` the exact path, then `git add .gitattributes <path>` and commit.

Afterwards, run `git status --short` and confirm each path is gone, ignored (`git check-ignore <path>` prints it), or committed. If the user declines every option, say once what that means for saving and rolling back, then continue.

## Files a checkpoint skipped

Checkpoints skip new files at or above the size limit. A skipped file is in no checkpoint, so rollback deletes it, and every later checkpoint reports it again. Finish the user's request, then resolve every skipped file before ending the turn. Check the current paths first (`ls -la`, `git status --short`); a file already gone or ignored needs nothing.

Decide yourself only for files nobody needs, and tell the user in one line what you did. Output that tools or the app keep writing (caches, build output, logs) comes back if you only delete it, so add it to `.gitignore`: its folder if the folder holds nothing else (such as `logs/` or `.cache/`), otherwise its exact path, then delete the current copy if it isn't needed. An intermediate file you made once for your own work can simply be deleted. Everything else follows "Asking about the user's files"; say plainly that a skipped file was never saved, and handle "Keep saving every version" yourself, since checkpoints keep skipping the file.

## Cleaning up a large or slow project

### 1. Survey first, read-only

```bash
bash .local/skills/filesystem-and-git-cleanup/scripts/survey.sh
```

It reports disk use, the largest folders, `.git` and LFS size, `.local` usage, in-progress Git operations and lock files, tracked files, the largest blobs in history, objects stored in more than one pack, instruction and memory files, and the workflows in `.replit`. Each check has a time limit; a check that times out is itself a sign of bloat, so note it and move on.

Each background task works in its own copy of the project, and applying a task carries over only Git-tracked changes. Say which copy you surveyed. A file a background task stops saving is deleted from the main project's disk when the task is applied, because the apply records it as removed. So in a background task, only stop saving output that the project's build regenerates, deduplicate instruction files, and trim `.replit` checks. Leave the user's files, disk space, LFS, duplicate packs and lock files to the main Agent, and tell the user so. The one exception is when this task's own copy is out of disk space and a merge or checkpoint fails with `Disk quota exceeded` or `No space left on device`: delete regenerable files that Git does not track (caches, build output, logs, test reports; check with `git ls-files <path>`) until it fits, since deleting untracked files here never reaches the main project.

### 2. Report before acting

Show a short findings table: what you found, its size or count, what it means for the user, and what you propose. Lead with the one or two findings that explain most of the size or slowness. A large folder is not proof that it causes the slowness, and a Git-ignored folder can still be on disk, indexed and deployed, so keep what you measured separate from what you suspect.

### 3. Fix in this order

Go from cheapest and safest to most consequential, and re-measure after each step so the user sees the effect.

1. **Unblock Git.** A leftover `index.lock` with no Git process running, or a half-finished rebase or merge, blocks checkpoints and task applies. Remove a lock only when `ps aux | grep -c '[g]it '` shows no Git process and the lock is more than 10 minutes old (`find .git -maxdepth 2 -name '*.lock' -mmin +10`); a fresh lock can belong to a checkpoint about to write, and removing it can corrupt the index. If Git processes are running, such as background maintenance, wait and check again: stopping one mid-write can leave half-written files and the job starts over. A half-finished merge or rebase is often paused at a conflict with no Git process running, and may belong to a task being applied or to "Update from main". Aborting it throws away any conflicts already resolved, so first check `git status` and `git diff` for resolved or edited files; if there are any, finish the merge or rebase instead of aborting. Ask the user before aborting either way, and do not reset. A checkpoint that fails while the lock is present is expected; tell the user that, and confirm the next checkpoint succeeds once the lock is gone.
2. **Regenerable output.** Caches, build output, logs, test reports and captures in test output folders (`playwright-report/`, `test-results/`), `__pycache__`, `.next`, `dist`: delete the current copy and add the folder to `.gitignore` so it does not come back. Write the rule from the project root (`/dist/`, not `dist/`), because an unanchored folder name also hides source folders with the same name deeper in the project. Before deleting build output, check that the run, build and publish settings in `.replit` (and each artifact's build) regenerate it; if publishing serves committed output with no build step, leave it and tell the user. If the running app serves that output, rebuild or restart it afterwards. If the folder is tracked, list what is tracked in it (`git ls-files <path>`), untrack only output with `git rm -r --cached <path>`, and commit. Dependency folders (`node_modules`, `.pythonlibs`) and Replit's own folders (`.cache/replit`, `.config`, `.upm`) are not caches to delete: removing them breaks the app until packages reinstall.
3. **Instruction and memory files.** Remove exact duplicate blocks from `replit.md` and other instruction files, keeping one copy, and merge memory files that say the same thing. Never drop a user preference or decision to save space; move long history to an archive file and link it.
4. **User data and media.** Uploads in `attached_assets/`, generated reports, datasets, videos: follow "Asking about the user's files".
5. **Saved-version weight.** LFS keeps a local copy of every version; prune only objects verified on the remote (`git lfs prune --verify-remote`), otherwise ask, since pruning can delete the last copy of an old version. When the survey reports many objects stored in more than one pack, the same objects are saved twice; once no Git process is running and free disk space is at least the size of `.git` (the merge writes a new copy before removing the old ones), run `git repack -a -d --keep-unreachable` once, which merges the packs without deleting any object, then re-measure. Similar pack sizes alone do not show duplication. History that is large only because of old commits stays: rewriting it can break existing checkpoints and is out of scope.
6. **Validation cost.** If the checks take more than 5 minutes in total, list each validation command with its last duration, find duplicates (the same build or test run by several commands), and propose a faster set with the same coverage. Get approval before changing validation commands, and do not run the full suite just to time it.

### Suggesting cleanup as a follow-up task

Files a checkpoint skipped are always handled in the current turn, as in "Files a checkpoint skipped"; they are never deferred to a follow-up. The rest of a larger cleanup can be. When you notice the problem while working on something else, suggest the broader cleanup rather than doing it. Suggest it only when you saw the slowdown yourself: Git commands or checkpoints timing out, `.git` over 1 GB, an instruction file with the same block repeated, or validation taking most of the task's time. A large project with no observed slowdown does not qualify, and neither does a slow app.

An accepted follow-up runs in a background copy, so it can deliver only Git-tracked changes. For Git-tracked fixes (no longer saving committed output that the build regenerates, removing repeated instruction blocks, trimming duplicated `.replit` checks), propose one `tech_debt` follow-up titled with the measured payoff, for example "Stop 9 GB of build output from being saved with every checkpoint"; in the description, list what you measured and tell the next agent to read the `filesystem-and-git-cleanup` skill first. For anything involving the user's own files, and for fixes only the main project can make (disk space, LFS pruning, duplicate packs, ignored files, stuck locks), or when Git is too slow for a new task to start or apply, propose nothing and instead tell the user what you measured and that they can ask the main Agent to clean up the project. Propose at most one cleanup follow-up, and none when one is already in the task list.

### Finish

End with a before-and-after table in plain words (total project size, size of saved versions, number of files saved with every checkpoint, instruction file size, check time if changed), what you left alone and why, and what still needs the user. If a checkpoint failed during the cleanup, say why and whether the next one succeeded. If the project is still very large after safe cleanup, say what remains and that support can help with old saved versions that cannot be shrunk from inside the project.

## Never

These hold even when the user asks for the smallest possible project, because each one can lose saved versions or files with no way back:

- Rewrite history, force-push, `git gc --prune=now`, a broad `git clean`, `rm -rf .git`, `git init`, or `reset --hard`.
- Delete `.local/` or `.agents/` wholesale; they hold Agent state, skills and memory. Clean only subfolders you can name and explain.
- Move files into `.local/` or other hidden folders unless the user asks.
- Cancel tasks; a cancelled task cannot be restored.

Adding a path to `.gitignore` is not a cleanup by itself: it stops future saving but leaves the files on disk, in history and in the deployment image.

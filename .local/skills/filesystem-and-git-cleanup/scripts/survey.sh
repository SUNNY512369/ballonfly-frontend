#!/usr/bin/env bash
# Read-only health survey for a large or slow project. It changes nothing.
# Usage: bash .local/skills/filesystem-and-git-cleanup/scripts/survey.sh [project-root]
# Every check has a time limit. A check that times out is itself a finding:
# it usually means the Git history or the file tree is bloated.

cd "${1:-${REPL_HOME:-$HOME/workspace}}" 2>/dev/null || exit 1
# Never take Git's optional index lock, so a checkpoint running at the same time cannot fail on it.
export GIT_OPTIONAL_LOCKS=0
echo "Project: $(pwd)"

run() {
  local title=$1 secs=$2 fn=$3
  echo
  echo "=== $title"
  timeout "$secs" bash -c "$fn"
  [ $? -eq 124 ] && echo "!! TIMED OUT after ${secs}s: likely bloat here"
}

disk() { df -h . | tail -1; }

top_level() {
  du -xsh -- .[!.]* * 2>/dev/null | sort -rh | head -15
}

git_size() {
  du -sh .git 2>/dev/null
  du -sh .git/lfs 2>/dev/null || echo "no LFS store"
  git count-objects -vH 2>/dev/null | grep -E 'size-pack|size-garbage|count|garbage'
  echo "-- pack files"
  ls -l .git/objects/pack/*.pack 2>/dev/null | awk '{printf "%8.1f MB  %s\n", $5/1048576, $NF}' | sort -rn | head -5
  if [ "$(ls .git/objects/pack/*.idx 2>/dev/null | wc -l)" -gt 1 ]; then
    for idx in .git/objects/pack/*.idx; do git show-index <"$idx" | awk '{print $2}'; done |
      sort | uniq -c | awk '{total += $1; if ($1 > 1) dup++} END {printf "objects stored in more than one pack: %d of %d unique\n", dup + 0, NR}'
  fi
}

local_dir() {
  [ -d .local ] || { echo "no .local"; return; }
  du -xsh -- .local/* .local/.[!.]* 2>/dev/null | sort -rh | head -10
}

git_state() {
  git status --short --branch 2>&1 | head -15
  for f in rebase-merge rebase-apply MERGE_HEAD CHERRY_PICK_HEAD REVERT_HEAD; do
    [ -e ".git/$f" ] && echo "IN PROGRESS: $f"
  done
  find .git -maxdepth 3 -name '*.lock' 2>/dev/null | head
}

tracked() {
  echo "tracked files: $(git ls-files | wc -l)"
  echo "-- tracked files per top-level folder"
  git ls-files | awk -F/ '{print (NF>1 ? $1"/" : $1)}' | sort | uniq -c | sort -rn | head -10
  echo "-- largest tracked files (bytes)"
  git ls-files -z | xargs -0 stat -c '%s %n' 2>/dev/null | sort -rn | head -10
}

history_blobs() {
  echo "-- largest blobs anywhere in history (bytes)"
  git rev-list --objects --all 2>/dev/null |
    git cat-file --batch-check='%(objecttype) %(objectsize) %(rest)' 2>/dev/null |
    awk '$1 == "blob" {print $2, $3}' | sort -rn | head -10
}

instructions() {
  for f in replit.md AGENTS.md CLAUDE.md .cursorrules; do
    [ -f "$f" ] && printf '%8s bytes  %s\n' "$(wc -c <"$f")" "$f"
  done
  if [ -d .agents/memory ]; then
    echo "-- .agents/memory: $(find .agents/memory -type f | wc -l) files, $(du -sh .agents/memory | cut -f1)"
  fi
  echo "-- other instruction-like markdown files (count by name)"
  find . -path ./node_modules -prune -o -path ./.git -prune -o -path ./.local -prune -o \
    -type f \( -iname 'replit*.md' -o -iname 'agents.md' -o -iname 'claude.md' -o -iname '*memory*.md' \) -print 2>/dev/null |
    sed 's#.*/##' | sort | uniq -c | sort -rn | head -10
  echo "-- paragraphs repeated inside replit.md (count > 1)"
  [ -f replit.md ] && awk 'BEGIN { RS = "" }
    length($0) > 200 { count[$0]++ }
    END { for (p in count) if (count[p] > 1) print count[p] " copies of a " length(p) "-char block starting: " substr(p, 1, 60) }' replit.md | sort -rn | head -5
}

validation() {
  [ -f .replit ] && grep -nE '^\[\[workflows|^name|^args|^task' .replit | head -40
}

export -f disk top_level git_size local_dir git_state tracked history_blobs instructions validation

run "Disk" 20 disk
run "Largest top-level entries" 180 top_level
run "Git and LFS size" 120 git_size
run ".local breakdown" 120 local_dir
run "Git state, in-progress operations, lock files" 60 git_state
run "Tracked files" 120 tracked
run "Largest blobs in history" 180 history_blobs
run "Instruction and memory files" 60 instructions
run "Workflows in .replit" 20 validation

echo
echo "=== Survey done. Nothing was changed."

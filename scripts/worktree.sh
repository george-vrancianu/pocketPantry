#!/usr/bin/env bash
# Create or remove an agent worktree under .claude/worktrees/<name>.
#   scripts/worktree.sh <name> [base]     new branch <name> from base (default origin/main)
#   scripts/worktree.sh --remove <name>   remove the worktree, delete the branch if merged
# Only git fetch / worktree / branch are run against the main checkout; its
# working tree, index and HEAD are never touched. Env files are copied, not linked.
set -euo pipefail

usage() {
  cat >&2 <<'USAGE'
Usage:
  scripts/worktree.sh <name> [base]     create .claude/worktrees/<name> on new branch <name> (base default: origin/main)
  scripts/worktree.sh --remove <name>   remove the worktree and delete its branch if merged
USAGE
  exit 2
}

validate_name() {
  case "$1" in
    "" | . | .. | */* | *..* | -*) echo "Invalid worktree name: '$1'" >&2; usage ;;
  esac
  if ! [[ "$1" =~ ^[A-Za-z0-9._-]+$ ]]; then
    echo "Invalid worktree name: '$1' (use letters, digits, . _ -)" >&2
    usage
  fi
}

# The main checkout is the parent of the shared .git dir, from any worktree.
common_dir=$(git rev-parse --path-format=absolute --git-common-dir)
main=$(dirname -- "$common_dir")
git_main() { git -C "$main" "$@"; }

[ $# -ge 1 ] || usage

if [ "$1" = "--remove" ]; then
  [ $# -eq 2 ] || usage
  name=$2
  validate_name "$name"
  target="$main/.claude/worktrees/$name"
  [ -d "$target" ] || { echo "No such worktree: $target" >&2; exit 1; }
  git_main worktree remove "$target"
  echo "Removed worktree $target"
  if git_main show-ref --verify --quiet "refs/heads/$name"; then
    if git_main branch -d "$name"; then
      echo "Deleted merged branch $name"
    else
      echo "Branch $name is not merged; kept it. Delete with 'git branch -D $name' if you are sure." >&2
    fi
  fi
  exit 0
fi

[ $# -le 2 ] || usage
name=$1
base=${2:-origin/main}
validate_name "$name"
case "$base" in -*) echo "Invalid base: '$base'" >&2; usage ;; esac
target="$main/.claude/worktrees/$name"

if [ -e "$target" ]; then
  echo "Target already exists: $target" >&2
  exit 1
fi
if git_main show-ref --verify --quiet "refs/heads/$name"; then
  echo "Branch already exists: $name" >&2
  exit 1
fi

git_main fetch origin
git_main worktree add --no-track "$target" -b "$name" "$base"

# From here on the worktree exists; on failure tell the user how to clean up.
trap 'echo "Setup failed. Clean up with: scripts/worktree.sh --remove $name" >&2' ERR

# Copy (never link, never modify the source) the gitignored env files.
for f in .env .env.local apps/api/.env apps/api/.env.local apps/web/.env apps/web/.env.local; do
  if [ -f "$main/$f" ]; then
    cp -- "$main/$f" "$target/$f"
    echo "Copied $f"
  fi
done

cd "$target"
npm ci
echo "Worktree ready: $target (branch $name, base $base)"

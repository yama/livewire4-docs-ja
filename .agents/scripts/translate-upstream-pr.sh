#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: .agents/scripts/translate-upstream-pr.sh [--dry-run]

Run the local Codex translation skill in an isolated worktree. By default,
the agent may commit, push, and create a translation pull request. Use
--dry-run to allow translation and validation only; no commit, push, or PR
creation is permitted in that mode.
EOF
}

dry_run=false
case "${1:-}" in
  "") ;;
  --dry-run) dry_run=true ;;
  --help|-h) usage; exit 0 ;;
  *) usage >&2; exit 2 ;;
esac

repo_root=$(git rev-parse --show-toplevel)
command -v codex >/dev/null 2>&1 || {
  echo "error: codex CLI is not installed or is not in PATH" >&2
  exit 1
}
command -v gh >/dev/null 2>&1 || {
  echo "error: gh CLI is not installed or is not in PATH" >&2
  exit 1
}

git -C "$repo_root" fetch --prune origin main

worktree_parent=$(mktemp -d "${TMPDIR:-/tmp}/livewire-translate.XXXXXX")
worktree="$worktree_parent/worktree"
branch="agent/translate-upstream-$(date -u +%Y%m%d-%H%M%S)"

cleanup() {
  git -C "$repo_root" worktree remove --force "$worktree" >/dev/null 2>&1 || true
  rmdir "$worktree_parent" >/dev/null 2>&1 || true
}
trap cleanup EXIT

git -C "$repo_root" worktree add --detach "$worktree" origin/main >/dev/null
git -C "$worktree" switch -c "$branch" >/dev/null

if "$dry_run"; then
  publish_rules=$(cat <<'EOF'
This is a dry run. Do not commit, push, create, or merge a pull request.
Make changes only in this temporary worktree, then report the proposed
changed files and validation results.
EOF
  )
else
  publish_rules=$(cat <<EOF
This is a publishing run. After translation and all validation succeeds,
commit the scoped changes on branch $branch, push that branch to origin, and
create exactly one non-draft pull request against main with gh. Do not merge
the pull request. If there is no actionable upstream change, do not create a
commit or pull request.
EOF
  )
fi

prompt=$(cat <<EOF
Use the repository-local $translate-livewire-docs skill to update Japanese
documentation from the current upstream snapshot. You are running in an
isolated worktree based on origin/main after the upstream synchronization PR.

Read AGENTS.md, config/translation-rules.md, config/glossary.yml,
.upstream-version, and .agents/skills/translate-livewire-docs/SKILL.md before
editing. Detect the changed upstream files and changed sections yourself; do
not ask the user to identify them manually. Compare upstream/docs with the
corresponding docs files and the marker's upstream commit. If
translation-progress.md exists, read its single checkpoint and resume after
that file and section; do not introduce per-page status fields or status
enums. Translate only the upstream changes, preserving existing Japanese
localization and all Markdown, code, links, callouts, lists, and examples. Do
not use external machine translation. Resolve the current livewire/livewire
4.x SHA with git or the GitHub API before updating .upstream-version, and
update that marker only when all detected translation changes are complete.

When the work cannot be completed in one run, update translation-progress.md
with one recoverable checkpoint containing the target upstream SHA, the last
completed file, and the last completed section. Update that checkpoint only
after the section has been reviewed and validated. When all changes are
complete, update .upstream-version and remove translation-progress.md.

Run npm ci, npm run docs:build, and git diff --check. Review the final diff for
scope and technical meaning. Never modify upstream/*.md, workflow files, or
unrelated docs. Never merge a pull request.

$publish_rules
EOF
)

codex exec --dangerously-bypass-approvals-and-sandbox -C "$worktree" - <<EOF
$prompt
EOF

echo "translation agent completed for $branch"

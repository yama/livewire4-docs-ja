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
upstream_sha=$(git ls-remote https://github.com/livewire/livewire.git refs/heads/4.x | awk 'NR == 1 {print $1}')

worktree_parent=$(mktemp -d "${TMPDIR:-/tmp}/livewire-translate.XXXXXX")
worktree="$worktree_parent/worktree"
branch="agent/translate-upstream-$(date -u +%Y%m%d-%H%M%S)"

cleanup() {
  git -C "$repo_root" worktree remove --force "$worktree" >/dev/null 2>&1 || true
  rmdir "$worktree_parent" >/dev/null 2>&1 || true
}
trap cleanup EXIT

git -C "$repo_root" worktree add -b "$branch" "$worktree" origin/main >/dev/null

echo "installing dependencies in the trusted shell"
npm ci --prefix "$worktree"

if "$dry_run"; then
  publish_rules=$(cat <<'EOF'
This is a dry run. Do not commit, push, create, or merge a pull request.
Make changes only in this temporary worktree, then report the proposed
changed files and validation results.
EOF
  )
else
  publish_rules=$(cat <<EOF
  This is a publishing run, but the trusted wrapper will handle commit, push,
  and pull request creation after you finish. Do not commit, push, or create a
  pull request yourself. If there is no actionable upstream change, leave the
  worktree unchanged.
EOF
  )
fi

prompt=$(cat <<EOF
Use the repository-local \$translate-livewire-docs skill to update Japanese
documentation from the current upstream snapshot. You are running in an
isolated worktree based on origin/main after the upstream synchronization PR.

Read AGENTS.md, config/translation-rules.md, config/glossary.yml,
.upstream-version, and .agents/skills/translate-livewire-docs/SKILL.md before
editing. Detect the changed upstream files and changed sections yourself; do
not ask the user to identify them manually. Compare upstream/docs with the
corresponding docs files and the marker's upstream commit. If
translation-progress.md exists, read its single checkpoint and resume after
that file and section only when its recorded target SHA is $upstream_sha. If
the recorded target SHA differs from the current target, rescan the complete
delta from .upstream-version through $upstream_sha before deciding where to
resume; never skip an earlier change based only on the old checkpoint. Do not
introduce per-page status fields or status enums. Translate only the upstream
changes, preserving existing Japanese localization and all Markdown, code,
links, callouts, lists, and examples. Do not use external machine
translation. The current livewire/livewire 4.x target is $upstream_sha.
Network access is disabled for this agent run; use the checked-out upstream
snapshot and this target SHA. Update .upstream-version only when all detected
translation changes are complete.

When the work cannot be completed in one run, update translation-progress.md
with one recoverable checkpoint containing the target upstream SHA, the last
completed file, and the last completed section. Update that checkpoint only
after the section has been reviewed and validated. When all changes are
complete, update .upstream-version and remove translation-progress.md.

The trusted wrapper has already run npm ci. Run npm run docs:build and git
diff --check. Review the final diff for scope and technical meaning. Never
modify upstream/*.md, workflow files, or unrelated docs. Do not commit, push,
create, or merge a pull request.

$publish_rules
EOF
)

codex exec --sandbox workspace-write \
  -c 'approval_policy="never"' \
  -c 'sandbox_workspace_write.network_access=false' \
  -C "$worktree" - <<EOF
$prompt
EOF

changed_files=$(git -C "$worktree" status --porcelain=v1)
while IFS= read -r status_line; do
  [[ -z "$status_line" ]] && continue
  path=${status_line:3}
  case "$path" in
    docs/*.md|.upstream-version|translation-progress.md) ;;
    *)
      echo "error: agent changed an out-of-scope path: $path" >&2
      exit 1
      ;;
  esac
done <<< "$changed_files"

if [[ -z "$changed_files" ]]; then
  echo "no translation changes detected"
  exit 0
fi

if "$dry_run"; then
  echo "dry run completed; no commit, push, or pull request created"
  exit 0
fi

git -C "$worktree" add -- docs/*.md .upstream-version
if [[ -e "$worktree/translation-progress.md" ]]; then
  git -C "$worktree" add -- translation-progress.md
fi
git -C "$worktree" diff --cached --check
git -C "$worktree" commit -m 'chore: upstreamドキュメントの日本語訳を更新'
git -C "$worktree" push -u origin "$branch"
gh pr create --repo yama/livewire4-docs-ja \
  --base main \
  --head "$branch" \
  --title 'chore: upstreamドキュメントの日本語訳を更新' \
  --body "upstream の変更を translate-livewire-docs skill で日本語版へ反映しました。"

echo "translation agent completed for $branch"

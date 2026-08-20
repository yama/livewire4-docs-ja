# ローカル翻訳エージェント

upstream 同期 PR が `main` にマージされた後、次のコマンドで翻訳対象の検出から日本語訳 PR の作成までを実行できます。

```bash
.agents/scripts/translate-upstream-pr.sh
```

このスクリプトは現在の作業ブランチを変更せず、`origin/main` から一時 worktree を作成してローカルの `codex exec` と `translate-livewire-docs` skill を起動します。エージェントが upstream 差分を特定し、翻訳、build、diff 検証、commit、push、PR 作成を行います。

翻訳が一度に完了しない場合だけ、リポジトリ直下の `translation-progress.md` に「ここまで翻訳済み」という単一のチェックポイントを保存します。次回実行時はそこから再開し、全対象が完了したら `.upstream-version` を更新して進捗ファイルを削除します。ページごとの状態一覧や `pending` などの状態管理は行いません。

変更を公開せずに翻訳・検証だけ確認する場合は、次を使います。

```bash
.agents/scripts/translate-upstream-pr.sh --dry-run
```

このランチャー自体は GitHub Actions からは起動されません。完全自動で定期実行する場合は、ローカルの cron や systemd timer から通常モードで起動します。実行環境には `codex` の認証と `gh` の push / PR 作成権限が必要です。

ランチャーを使わず、Codex から skill を直接呼び出すこともできます。

```text
$translate-livewire-docs を使って、upstream の未翻訳差分を検出し、
translation-progress.md のチェックポイントから翻訳してください。
検証後、main 向けのPRを作成してください。
```

---
name: translate-livewire-docs
description: Livewire公式ドキュメントのupstream変更を日本語版へ反映する
---

# Livewireドキュメント翻訳更新

## 目的

`livewire/livewire` の `4.x` ブランチにあるupstream変更を、既存の日本語版へ反映する。翻訳方針と用語は `config/translation-rules.md` と `config/glossary.yml` を正本とする。

## 作業前に読むもの

- `AGENTS.md`
- `config/translation-rules.md`
- `config/glossary.yml`
- `.upstream-version`

## 手順

1. `.upstream-version` のcommitからupstreamの現在の `4.x` までの差分を確認する。
2. 変更されたファイルと変更箇所を特定する。
3. 対応する `docs/` の日本語版を読み、既存訳とローカライズを理解する。
4. 方針と用語集に従い、原文の文脈と技術的意味を理解して、upstreamで変更された内容だけを反映する。翻訳本文の生成に外部機械翻訳サービスを使わない。全文再翻訳はしない。
5. 新規ページを全文翻訳する場合は、原文と日本語版を比較し、見出し、段落・説明、リスト、表、コードブロック、Callout / admonition、リンク、その他の例示が対応していることを確認する。行数一致は要求しないが、原文の構造要素や説明ブロックを日本語版から削除しない。
6. 原文差分と日本語版差分を比較し、意味、技術内容、用語、Markdown、コード、リンクをレビューする。
7. 必要な修正を行う。
8. `npm ci` と `npm run docs:build` を実行し、意図しないファイル変更がないことを確認する。
9. 翻訳完了後に `.upstream-version` を対象commit SHAへ更新する。未翻訳の変更が残る場合は更新しない。

## 作業結果の報告

次の項目を簡潔に報告する。

- 変更ファイル
- upstreamの変更概要
- 日本語版で行った変更
- 意図的な日本向けローカライズ
- 人間による確認が必要な事項

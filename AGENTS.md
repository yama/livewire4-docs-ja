# Livewire 4 日本語ドキュメント開発ガイド

## プロジェクト目的

このリポジトリは、`livewire/livewire` の `4.x` ブランチにある公式ドキュメントを、日本の開発者向けに翻訳・ローカライズする非公式プロジェクトです。

upstream は次のとおりです。

- リポジトリ: `livewire/livewire`
- ブランチ: `4.x`
- 対象ディレクトリ: `docs/`

技術的な意味、仕様、APIは公式ドキュメントを正とします。翻訳は単なる逐語訳ではなく、意味を維持した自然な日本語を目指します。

## 開発原則

- **YAGNI**: MVPに不要な抽象化・自動化・設定を追加しない。
- **KISS**: より単純な方法で要件を満たせる場合は、それを選ぶ。
- **SSOT**: 翻訳方針・用語・upstreamの反映状態は、それぞれ定められた正本だけで管理する。
- **PIE**: コード、設定、ディレクトリ、文書から意図を読み取りやすくする。

## ディレクトリの役割

- `docs/`: 公開する日本語ドキュメントとVitePress設定。
- `upstream/`: 対応するupstream原文。日本語化しない。
- `config/`: 翻訳方針と用語集のSSOT。
- `.agents/skills/`: 翻訳更新作業の手順。
- `.github/workflows/`: upstream同期とデプロイの自動化。

## 翻訳作業

翻訳または更新の前に、必ず次を読むこと。

- `config/translation-rules.md`
- `config/glossary.yml`
- `.upstream-version`

翻訳ルールそのものを `AGENTS.md` やSkillへ重複して記載しない。更新手順は `.agents/skills/translate-livewire-docs/SKILL.md` に従う。

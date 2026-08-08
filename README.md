# Livewire 4 日本語ドキュメント

Livewire 4 公式ドキュメントの非公式日本語版です。

公式ドキュメントをもとに、日本の開発者が読みやすい自然な日本語へ翻訳・ローカライズしています。

## 公開URL

<https://livewire4-docs-ja.kyms.jp>

## 公式ドキュメント

- [Livewire 4 Docs](https://livewire.laravel.com/docs/4.x/quickstart)
- Repository: `livewire/livewire`
- Branch: `4.x`
- Source directory: `docs/`

## このプロジェクトについて

単純な逐語訳ではなく、技術的な意味を維持したうえで、日本の開発者に伝わりやすい表現へローカライズすることを目的としています。

サンプル内の表示文字列や固有名詞などは、必要に応じて日本向けに変更する場合があります。

Livewireの仕様・API・技術的な意味は公式ドキュメントを正とします。

## 非公式プロジェクトについて

このサイトおよびリポジトリは、Livewire公式プロジェクトによる公式日本語ドキュメントではありません。

内容に差異がある場合は、公式ドキュメントを優先してください。

## 開発

### セットアップ

```bash
npm install
```

### ローカル起動

```bash
npm run docs:dev
```

### ビルド

```bash
npm run docs:build
```

## ドキュメント更新

公式ドキュメントの更新は `upstream/docs/` に同期し、差分を確認したうえで日本語版へ反映します。

翻訳・ローカライズに関するルールは以下を参照してください。

- `config/translation-rules.md`
- `config/glossary.yml`

AIエージェント向けの開発方針は `AGENTS.md` を参照してください。

## License

このプロジェクトは、元となるLivewireドキュメントのMIT License条件を遵守します。詳細は `LICENSE` を参照してください。

Livewireの`wire:navigate`機能を使うと、ページ遷移が大幅に高速化され、ユーザーにSPAのような体験を提供できます。

このページは`wire:navigate`ディレクティブの簡単なリファレンスです。より詳しい説明については、[LivewireのNavigate機能のページ](/navigate)を必ず読んでください。

以下は、ナビゲーションバーのリンクに`wire:navigate`を追加する簡単な例です。

```blade
<nav>
    <a href="/" wire:navigate>ダッシュボード</a>
    <a href="/posts" wire:navigate>投稿</a>
    <a href="/users" wire:navigate>ユーザー</a>
</nav>
```

これらのリンクがクリックされると、Livewireがクリックをインターセプトします。ブラウザにページ全体を遷移させる代わりに、Livewireがバックグラウンドでページを取得し、現在のページと入れ替えます。その結果、ページ遷移が大幅に高速かつ滑らかになります。

`wire:navigate`がインターセプトするのは、同一オリジンのページ遷移だけです。外部リンク、`_self`以外のターゲットを持つリンク、ダウンロードリンク、`mailto:`や`tel:`のようなURLでは、自動的にブラウザのデフォルト動作へフォールバックします。

## data-currentでアクティブなリンクをスタイルする

Livewireは、現在のページURLに一致する`wire:navigate`リンクへ`data-current`属性を自動的に追加します。これにより、追加のディレクティブなしでCSSやTailwindを使ってアクティブなナビゲーションリンクをスタイルできます。

```blade
<nav>
    <a href="/" wire:navigate class="data-current:font-bold">ダッシュボード</a>
    <a href="/posts" wire:navigate class="data-current:font-bold">投稿</a>
    <a href="/users" wire:navigate class="data-current:font-bold">ユーザー</a>
</nav>
```

ユーザーがページ間を移動すると、`data-current`属性は自動的に追加・削除されます。[Navigateドキュメントのアクティブなリンクを強調する方法](/navigate#using-the-data-current-attribute)で詳しく説明しています。

## ホバー時にページをプリフェッチする

`.hover`モディファイアを追加すると、ユーザーがリンクにホバーしたときにLivewireがページを事前取得します。これにより、ユーザーがリンクをクリックした時点ではページがサーバーからダウンロード済みになります。

```blade
<a href="/" wire:navigate.hover>ダッシュボード</a>
```

## さらに詳しく

この機能の詳しい説明については、[LivewireのNavigateドキュメントページ](/navigate)を参照してください。

## 関連項目

- **[Navigate](/navigate)** — SPAナビゲーションの完全ガイド
- **[ページ](/pages)** — ルーティング可能なページコンポーネントを作成する
- **[@persist](/directive-persist)** — ナビゲーション中も要素を保持する

## リファレンス

```blade
wire:navigate
```

### モディファイア

| モディファイア | 説明 |
|----------|-------------|
| `.hover` | ユーザーがリンクにホバーしたときにページをプリフェッチする |

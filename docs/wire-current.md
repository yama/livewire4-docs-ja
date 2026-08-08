`wire:current`ディレクティブを使うと、ページ上で現在アクティブなリンクを簡単に検出してスタイルできます。

> [!tip] 代わりにdata-currentの使用を検討してください
> Livewireは、現在のページに一致するすべての`wire:navigate`リンクへ`data-current`属性を自動的に追加します。`wire:current`ディレクティブを使わず、Tailwindの`data-current:`バリアントやCSSでこれらのリンクを直接スタイルできます。[自動的なdata-currentについて詳しく見る →](/navigate#using-the-data-current-attribute)

ナビゲーションバーのリンクに`wire:current`を追加し、現在アクティブなリンクのフォントを太くする簡単な例を見てみましょう。

```blade
<nav>
    <a href="/dashboard" ... wire:current="font-bold text-zinc-800">ダッシュボード</a>
    <a href="/posts" ... wire:current="font-bold text-zinc-800">投稿</a>
    <a href="/users" ... wire:current="font-bold text-zinc-800">ユーザー</a>
</nav>
```

ユーザーが`/posts`へアクセスすると、「投稿」リンクはほかのリンクより太いフォントで表示されます。

`wire:current`は`wire:navigate`リンクやページ変更ですぐに動作し、指定したクラスに加えて、一致するリンクへ`data-current`属性も自動的に追加することに注意してください。

## 完全一致

デフォルトでは、`wire:current`は部分一致の戦略を使います。リンクと現在のページで、URLのパスの先頭部分が共有されている場合に適用されます。

たとえば、リンクが`/posts`で現在のページが`/posts/1`の場合、`wire:current`ディレクティブが適用されます。

完全一致を使いたい場合は、ディレクティブに`.exact`モディファイアを追加できます。

`/posts`にアクセスしたときに「ダッシュボード」リンクが強調されないよう、完全一致を使う例を見てみましょう。

```blade
<nav>
    <a href="/" wire:current.exact="font-bold">ダッシュボード</a>
</nav>
```

## 厳密一致

デフォルトでは、`wire:current`は比較時に末尾のスラッシュ（`/`）を削除します。

この動作を無効にし、パス文字列を厳密に比較するには、`.strict`モディファイアを`wire:current`に追加します。

```blade
<nav>
    <a href="/posts/" wire:current.strict="font-bold">ダッシュボード</a>
</nav>
```

## トラブルシューティング

`wire:current`が現在のリンクを正しく検出しない場合は、次を確認してください。

* ページ上に少なくとも1つLivewireコンポーネントがあるか、レイアウトに`@livewireScripts`をハードコードしている
* リンクに`href`属性がある

## リファレンス

```blade
wire:current="classes"
```

### モディファイア

| モディファイア | 説明 |
|----------|-------------|
| `.exact` | 部分一致ではなくパスの完全一致を使う |
| `.strict` | 末尾のスラッシュを含めてパスを厳密に比較する |

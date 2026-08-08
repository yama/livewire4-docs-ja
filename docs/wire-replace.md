LivewireのDOM差分適用は、ページ上の既存要素を更新するのに便利です。しかし、内部状態をリセットするため、一部の要素を最初からレンダリングし直したい場合があります。

その場合は `wire:replace` ディレクティブを使い、要素の子要素に対するDOM差分適用をスキップして、サーバーからの新しい要素で内容を完全に置き換えるようLivewireへ指示できます。

これは、サードパーティのJavaScriptライブラリやカスタムWebコンポーネントを扱う場合、または状態を保持したまま要素を再利用すると問題が起こる場合に便利です。

以下はShadow DOMを持つWebコンポーネントを `wire:replace` で囲む例です。Livewireが要素を完全に置き換えるため、カスタム要素が自身のライフサイクルを処理できます。

```blade
<form>
    <!-- ... -->

    <div wire:replace>
        <!-- このカスタム要素は独自の内部状態を持つ -->
        <json-viewer>@json($someProperty)</json-viewer>
    </div>

    <!-- ... -->
</form>
```

`wire:replace.self` を使うと、子要素だけでなく対象要素自身も置き換えられます。

```blade
<div x-data="{open: false}" wire:replace.self>
  <!-- レンダリングごとに「open」状態をfalseへリセットする -->
</div>
```

## リファレンス

```blade
wire:replace
```

### 修飾子

| 修飾子 | 説明 |
| --- | --- |
| `.self` | 子要素だけでなく、要素自身とすべての子要素を置き換える |

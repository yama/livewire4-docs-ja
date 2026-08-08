Livewireでは、テンプレートの一部をページ上のDOMの別の場所へ_テレポート_できます。

これはネストしたダイアログなどに便利です。あるダイアログの中に別のダイアログをネストすると、親モーダルのz-indexがネストしたモーダルにも適用されます。その結果、背景やオーバーレイのスタイルに問題が起こることがあります。Livewireの `@teleport` ディレクティブを使うと、ネストした各モーダルを描画後のDOMで兄弟要素としてレンダリングできます。

この機能は[Alpineの `x-teleport` ディレクティブ](https://alpinejs.dev/directives/teleport)によって提供されています。

## 基本的な使い方

テンプレートの一部をDOMの別の場所へ_テレポート_するには、Livewireの `@teleport` ディレクティブで囲みます。

以下は、モーダルダイアログの内容をページの `<body>` 要素の末尾へレンダリングする例です。

```blade
<div>
    <!-- モーダル -->
    <div x-data="{ open: false }">
        <button @click="open = ! open">モーダルを切り替え</button>

        @teleport('body')
            <div x-show="open">
                モーダルの内容...
            </div>
        @endteleport
    </div>
</div>
```

> [!info]
> `@@teleport` のセレクターには、`document.querySelector()` などへ通常渡す任意の文字列を指定できます。
>
> `document.querySelector()` について詳しくは、[MDNのドキュメント](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)を参照してください。

上のLivewireテンプレートをページにレンダリングすると、モーダルの_内容_は `<body>` の末尾に描画されます。

```html
<body>
    <!-- ... -->

    <div x-show="open">
        モーダルの内容...
    </div>
</body>
```

> [!warning] コンポーネントの外へテレポートする必要がある
> Livewireがサポートするのは、HTMLをコンポーネントの外へテレポートする場合だけです。たとえばモーダルを `<body>` タグへテレポートすることはできますが、コンポーネント内の別要素へテレポートすることはできません。

> [!warning] テレポートできるルート要素は1つだけ
> `@@teleport` 文の内側には、ルート要素を1つだけ含めてください。

`@teleport`ディレクティブはテンプレートの一部をDOM内の別の場所、コンポーネントの通常の配置外へレンダリングします。

## 基本的な使い方

`@teleport`でコンテンツを囲み、CSSセレクターでレンダリング先を指定します。

```blade
<div>
    <div x-data="{ open: false }">
        <button @click="open = ! open">モーダルを切り替え</button>
        @teleport('body')
            <div x-show="open">モーダルの内容...</div>
        @endteleport
    </div>
</div>
```

モーダルの内容は`<body>`要素の末尾にレンダリングされます。

```html
<body>
    <!-- ページのコンテンツ... -->
    <div x-show="open">モーダルの内容...</div>
</body>
```

> [!info] 有効なCSSセレクターを指定できる
> `@@teleport`のセレクターには`document.querySelector()`へ渡せる任意の文字列を使えます。`'body'`、`'#modal-root'`、`'.modal-container'`などです。

## teleportを使う理由

親のスタイルやz-indexが適切なレンダリングを妨げるネストしたモーダル、ドロップダウン、ポップオーバーに便利です。

**teleportなし：**
```blade
<div style="z-index: 10;">
    <!-- z-index: 10の親モーダル -->
    <div style="z-index: 20;">
        <!-- 子モーダルは親のスタッキングコンテキストを継承 -->
        <!-- 背景が親モーダルを正しく覆えない可能性がある -->
    </div>
</div>
```

**teleportあり：**
```blade
<div style="z-index: 10;">
    <!-- 親モーダル -->
    @teleport('body')
        <div style="z-index: 20;">
            <!-- 子モーダルはbodyレベルの兄弟としてレンダリング -->
            <!-- 背景がすべてを正しく覆える -->
        </div>
    @endteleport
</div>
```

## 一般的な用途

**モーダルダイアログ：**
```blade
@teleport('body')
    <div class="fixed inset-0 bg-black/50" x-show="showModal">
        <div class="modal"><!-- モーダルの内容... --></div>
    </div>
@endteleport
```

**ドロップダウンメニュー：**
```blade
@teleport('body')
    <div class="absolute" x-show="open" style="top: {{ $top }}px; left: {{ $left }}px;">
        <!-- ドロップダウン項目... -->
    </div>
@endteleport
```

**トースト通知：**
```blade
@teleport('#notifications-container')
    <div class="toast">{{ $message }}</div>
@endteleport
```

## 重要な制約

> [!warning] コンポーネントの外へteleportする必要がある
> Livewireが対応するのは、コンポーネントの外へのHTMLのteleportだけです。同じコンポーネント内の別要素へのteleportは動作しません。

> [!warning] ルート要素は1つだけ
> `@@teleport`文の中には単一のルート要素だけを含めます。複数のルート要素には対応していません。

**有効：**
```blade
@teleport('body')
    <div><h2>タイトル</h2><p>コンテンツ</p></div>
@endteleport
```

**無効：**
```blade
@teleport('body')
    <h2>タイトル</h2>
    <p>コンテンツ</p>
@endteleport
```

## Alpineによる機能

この機能は内部で[Alpineの`x-teleport`ディレクティブ](https://alpinejs.dev/directives/teleport)を使っています。

[teleportについて詳しく見る →](/teleport)

## リファレンス

```blade
@teleport(string $selector)
    <!-- コンテンツ -->
@endteleport
```

| パラメータ | 型 | デフォルト | 説明 |
|-----------|------|---------|-------------|
| `$selector` | `string` | *必須* | コンテンツのレンダリング先CSSセレクター（例：`'body'`、`'#modal-root'`、`'.container'`） |

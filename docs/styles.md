Livewireでは、シングルファイルコンポーネントとマルチファイルコンポーネントに、コンポーネント固有のスタイルを直接含められます。これらのスタイルは自動的にコンポーネントへスコープされるため、アプリケーションの他の部分へ漏れません。

この方式はLivewireコンポーネントでの `<script>` タグの動作に似ており、コンポーネントのPHP、HTML、JavaScript、CSSを一か所にまとめて管理できます。

## スコープされたスタイル

デフォルトでは、コンポーネント内で定義したスタイルはそのコンポーネントだけにスコープされます。つまり、ページの別の場所にも同じセレクターが存在していても、CSSセレクターはコンポーネント内の要素だけに影響します。

### シングルファイルコンポーネント

シングルファイルコンポーネントのルートレベルに `<style>` タグを追加します。

```blade
<?php

use Livewire\Component;

new class extends Component {
    public $count = 0;

    public function increment()
    {
        $this->count++;
    }
};
?>

<div>
    <h1 class="title">カウント: {{ $count }}</h1>
    <button class="btn" wire:click="increment">+</button>
</div>

<style>
.title {
    color: blue;
    font-size: 2rem;
}

.btn {
    background: indigo;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
}
</style>
```

`.title` と `.btn` のスタイルはこのコンポーネント内の要素だけに適用され、同じクラスを持つページ上の他の要素には適用されません。

### マルチファイルコンポーネント

マルチファイルコンポーネントでは、コンポーネントと同じ名前のCSSファイルを作成します。

```
resources/views/components/counter/
├── counter.php
├── counter.blade.php
└── counter.css          # スコープされたスタイル
```

`counter.css`
```css
.title {
    color: blue;
    font-size: 2rem;
}

.btn {
    background: indigo;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
}
```

## スコープの仕組み

Livewireは、コンポーネントのルート要素を対象とするセレクターでスタイルを自動的に包みます。内部ではCSSネストを使ってCSSを変換します。

```css
/* 記述した内容 */
.btn { background: blue; }

/* 配信される内容 */
[wire\:name="counter"] {
    .btn { background: blue; }
}
```

Livewireが各コンポーネントのルート要素に追加する `wire:name` 属性を使うため、スタイルはそのコンポーネント内だけに適用されます。

### コンポーネントのルートを対象にする

`&` セレクターを使うと、コンポーネント自身のルート要素を対象にできます。

```blade
<style>
& {
    border: 2px solid gray;
    padding: 1rem;
}

.title {
    margin-top: 0;
}
</style>
```

これにより、コンポーネントの最外部要素に境界線とパディングが追加されます。

## グローバルスタイル

コンポーネント単位ではなくグローバルに適用するスタイルが必要な場合は、styleタグに `global` 属性を追加します。

### シングルファイルコンポーネント

```blade
<style global>
body {
    font-family: system-ui, sans-serif;
}

.prose {
    max-width: 65ch;
    line-height: 1.6;
}
</style>
```

### マルチファイルコンポーネント

`.global.css` 拡張子のファイルを作成します。

```
resources/views/components/counter/
├── counter.php
├── counter.blade.php
├── counter.css           # スコープされたスタイル
└── counter.global.css    # グローバルスタイル
```

## スコープされたスタイルとグローバルスタイルを組み合わせる

同じコンポーネントで両方のスタイルを使えます。

```blade
<?php

use Livewire\Component;

new class extends Component {
    // ...
};
?>

<div class="counter">
    <h1 class="title">マイカウンター</h1>
</div>

<style>
.title {
    color: blue;
}
</style>

<style global>
.counter-page-layout {
    display: grid;
    place-items: center;
}
</style>
```

## スタイルの重複排除

同じコンポーネントのインスタンスがページに複数存在する場合、Livewireはスタイルの重複を自動的に排除します。コンポーネントのインスタンス数にかかわらず、スタイルは一度だけ読み込まれます。

## コンポーネントスタイルを使う場面

**スコープされたスタイルを使う場合:**
- 一つのコンポーネントに固有のスタイルを設定する
- CSSクラス名の衝突を避けたい
- 再利用可能で自己完結したコンポーネントを作る

**グローバルスタイルを使う場合:**
- コンポーネント外の要素をスタイル設定する
- 複数コンポーネントで使うユーティリティクラスを定義する
- サードパーティライブラリのスタイルを上書きする

**外部スタイルシートには `@assets` を使う:**
- CDNからCSSを読み込む
- サードパーティライブラリのスタイルを含める

```blade
@assets
<link rel="stylesheet" href="https://cdn.example.com/library.css">
@endassets
```

## ブラウザサポート

スコープされたスタイルは[CSSネスト](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting)を使います。これは現代のすべてのブラウザ（Chrome 120以降、Firefox 117以降、Safari 17.2以降）でサポートされています。古いブラウザをサポートする場合は、CSSプリプロセッサを使うか、コンパイル済みのスタイルシートを `@assets` ディレクティブで読み込むことを検討してください。

## 関連項目

- **[JavaScript](https://livewire.laravel.com/docs/4.x/javascript)** - コンポーネントでJavaScriptを使う
- **[コンポーネント](/components)** - コンポーネントの形式と構成
- **[Alpine](/alpine)** - Alpine.jsによるクライアント側のインタラクティブ性

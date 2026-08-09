[AlpineJS](https://alpinejs.dev/) は、Webページにクライアント側のインタラクティブ性を簡単に追加できる軽量なJavaScriptライブラリです。もともとは、よりJavaScript中心のユーティリティを使ってアプリケーションのあちこちにインタラクションを加えたい場合に、Livewireのようなツールを補完する目的で作られました。

LivewireにはAlpineが標準で含まれているため、プロジェクトに別途インストールする必要はありません。

AlpineJSの使い方を学ぶには、[Alpineのドキュメント](https://alpinejs.dev)が最適です。

## 基本的なAlpineコンポーネント

以降のドキュメントの土台として、Alpineコンポーネントの最も単純で分かりやすい例を見てみましょう。ページに数値を表示し、ボタンをクリックして増加させる小さな「カウンター」です。

```html
<!-- JavaScriptオブジェクトとしてデータを宣言します... -->
<div x-data="{ count: 0 }">
    <!-- 現在の「count」の値を要素内に表示します... -->
    <h2 x-text="count"></h2>

    <!-- クリックイベントが発生したら「count」の値を「1」増やします... -->
    <button x-on:click="count++">+</button>
</div>
```

上のAlpineコンポーネントは、アプリケーション内のどのLivewireコンポーネントでも問題なく使えます。Livewireは、Livewireコンポーネントの更新中もAlpineの状態を維持します。つまり、Livewire以外のコンテキストでAlpineを使うときと同じように、Livewireの中でも自由にAlpineコンポーネントを使えます。

## Livewire内でAlpineを使う

Livewireコンポーネントの中でAlpineコンポーネントを使う、より実践的な例を見てみましょう。

以下は、データベースにある投稿モデルの詳細を表示するシンプルなLivewireコンポーネントです。デフォルトでは投稿のタイトルだけを表示します。

```html
<div>
    <h1>{{ $post->title }}</h1>

    <div x-data="{ expanded: false }">
        <button type="button" x-on:click="expanded = ! expanded">
            <span x-show="! expanded">投稿内容を表示...</span>
            <span x-show="expanded">投稿内容を隠す...</span>
        </button>

        <div x-show="expanded">
            {{ $post->content }}
        </div>
    </div>
</div>
```

Alpineを使うことで、ユーザーが「投稿内容を表示...」ボタンを押すまで投稿内容を隠せます。その時点でAlpineの `expanded` プロパティが `true` になり、`x-show="expanded"` によってAlpineが投稿内容の表示を制御するため、ページに内容が表示されます。

これは、Livewireのサーバーラウンドトリップを発生させずにアプリケーションへインタラクティブ性を追加するという、Alpineの得意分野の一例です。

## `$wire` を使ってAlpineからLivewireを制御する

Livewire開発者が利用できる最も強力な機能の一つが `$wire` です。`$wire` オブジェクトは、Livewire内で使われるすべてのAlpineコンポーネントから利用できるマジックオブジェクトです。

`$wire` はJavaScriptからPHPへ渡るゲートウェイだと考えることができます。AlpineJSの内部から、Livewireコンポーネントのプロパティへのアクセスと変更、Livewireコンポーネントのメソッド呼び出しなど、さまざまな操作を行えます。

### Livewireのプロパティにアクセスする

投稿作成フォームで、入力中の本文に何文字含まれているかをすぐに表示する「文字数カウント」機能の例です。

```html
<form wire:submit="save">
    <!-- ... -->

    <input wire:model="content" type="text">

    <small>
        文字数: <span x-text="$wire.content.length"></span> <!-- [tl! highlight] -->
    </small>

    <button type="submit">保存</button>
</form>
```

上の例では、`x-text` を使って `<span>` 要素のテキスト内容をAlpineに制御させています。`x-text` の中には任意のJavaScript式を置け、依存する値が更新されると自動的に反応します。`$wire.content` で `$content` の値にアクセスしているため、Livewireから `$wire.content` が更新されるたびにテキスト内容も自動更新されます。この例では `wire:model="content"` が更新を行います。

### Livewireのプロパティを変更する

Alpine内の `$wire` を使って、投稿作成フォームの「title」フィールドを消去する例です。

```html
<form wire:submit="save">
    <input wire:model="title" type="text">

    <button type="button" x-on:click="$wire.title = ''">クリア</button> <!-- [tl! highlight] -->

    <!-- ... -->

    <button type="submit">保存</button>
</form>
```

ユーザーはフォーム入力中に「クリア」を押すと、Livewireのネットワークリクエストを送らずにタイトルを消去できます。この操作は即座に反映されます。

この動作の仕組みは次のとおりです。

* `x-on:click` はボタン要素のクリックをAlpineが監視するようにします
* クリックされると、Alpineは指定されたJS式 `$wire.title = ''` を実行します
* `$wire` はLivewireコンポーネントを表すマジックオブジェクトなので、コンポーネントのすべてのプロパティにJavaScriptから直接アクセス・変更できます
* `$wire.title = ''` はLivewireコンポーネントの `$title` の値を空文字列にします
* `wire:model` などのLivewireユーティリティはこの変更に即座に反応し、サーバーラウンドトリップを発生させません
* 次のLivewireネットワークリクエストで、バックエンドの `$title` プロパティも空文字列に更新されます

### Livewireのメソッドを呼び出す

Alpineから `$wire` 上で直接呼び出すだけで、Livewireのメソッドやアクションも簡単に実行できます。

```html
<form wire:submit="save">
    <input wire:model="title" type="text" x-on:blur="$wire.save()">  <!-- [tl! highlight] -->

    <!-- ... -->

    <button type="submit">保存</button>
</form>
```

通常この状況では `wire:model.live.blur="title"` を使いますが、Alpineで実現する方法を示す例として役立ちます。

#### パラメータを渡す

`$wire` のメソッド呼び出しに渡すだけで、Livewireのメソッドへパラメータも渡せます。

```php
public function deletePost($postId)
{
    $post = Post::find($postId);

    // ユーザーが削除できることを認可...
    auth()->user()->can('update', $post);

    $post->delete();
}
```

```html
<button type="button" x-on:click="$wire.deletePost(1)">
```

一般には、`$postId` のような値はBladeで生成します。

```html
@foreach ($posts as $post)
    <button type="button" wire:key="{{ $post->id }}" x-on:click="$wire.deletePost({{ $post->id }})">
        「{{ $post->title }}」を削除
    </button>
@endforeach
```

投稿が3件ある場合、上のBladeテンプレートはブラウザで次のようにレンダリングされます。

```html
<button type="button" x-on:click="$wire.deletePost(1)">
    「歩くことの力」を削除
</button>

<button type="button" x-on:click="$wire.deletePost(2)">
    「曲を録音する方法」を削除
</button>

<button type="button" x-on:click="$wire.deletePost(3)">
    「学んだことを教える」を削除
</button>
```

このように、Bladeで異なる投稿IDをAlpineの `x-on:click` 式へ埋め込んでいます。

#### Bladeパラメータの注意点

これは非常に強力な手法ですが、Bladeテンプレートを読むときに混乱することがあります。最初は、どの部分がBladeでどの部分がAlpineなのか分かりにくい場合があります。そのため、期待どおりにレンダリングされているか、ページに出力されたHTMLを確認するとよいでしょう。

たとえば、投稿モデルがID（整数）ではなくUUIDをインデックスに使っているとします。

```html
<!-- 注意: 問題のあるコードの例です... -->
<button
    type="button"
    x-on:click="$wire.deletePost({{ $post->uuid }})"
>
```

上のBladeテンプレートはHTMLでは次のようになります。

```html
<!-- 注意: 問題のあるコードの例です... -->
<button
    type="button"
    x-on:click="$wire.deletePost(93c7b04c-c9a4-4524-aa7d-39196011b81a)"
>
```

UUID文字列の前後に引用符がないことに注目してください。Alpineがこの式を評価すると、JavaScriptは「Uncaught SyntaxError: Invalid or unexpected token」というエラーを発生させます。

これを直すには、Blade式を引用符で囲みます。

```html
<button
    type="button"
    x-on:click="$wire.deletePost('{{ $post->uuid }}')"
>
```

これでテンプレートは正しくレンダリングされ、期待どおり動作します。

```html
<button
    type="button"
    x-on:click="$wire.deletePost('93c7b04c-c9a4-4524-aa7d-39196011b81a')"
>
```

### コンポーネントを更新する

`$wire.$refresh()` を使うと、Livewireコンポーネントを簡単に更新できます（ネットワークラウンドトリップを起こし、コンポーネントのBladeビューを再レンダリングします）。

```html
<button type="button" x-on:click="$wire.$refresh()">
```

## `$wire.entangle` で状態を共有する

> [!warning] おそらく必要ありません
> ほとんどの場合、AlpineからLivewireのプロパティへ直接アクセスするには `$wire` を使うべきです。エンタングルは重複した状態を作り、予測可能性やパフォーマンスの問題を引き起こす可能性があります。このAPIは後方互換性のために維持されていますが、新しいコードでは推奨されません。
>
> **`@@entangle` Bladeディレクティブは使わないでください**。非推奨であり、DOM要素を削除するときに問題を起こします。

AlpineとLivewireの間で双方向の状態同期が必要なまれなケースでは、`$wire.entangle()` を使えます。

```blade
<div x-data="{ open: $wire.entangle('showDropdown') }">
    <button x-on:click="open = true">もっと表示...</button>

    <ul x-show="open">
        <li><button wire:click="archive">アーカイブ</button></li>
    </ul>
</div>
```

デフォルトでは、変更は次のLivewireリクエストまで遅延されます。すぐに同期するには `.live` を使います。

```blade
<div x-data="{ open: $wire.entangle('showDropdown').live }">
```

## `@js` ディレクティブを使う

PHPのデータをAlpineで直接使える形で出力する必要がある場合は、`@js` ディレクティブを使えます。

```blade
<div x-data="{ posts: @js($posts) }">
    ...
</div>
```

## JavaScriptビルドでAlpineを手動バンドルする

デフォルトでは、LivewireとAlpineのJavaScriptは各Livewireページへ自動的に注入されます。

これは単純な構成には適していますが、独自のAlpineコンポーネント、ストア、プラグインをプロジェクトへ含めたい場合があります。

独自のJavaScriptバンドルを通じてページにLivewireとAlpineを含めるのは簡単です。まずレイアウトファイルに `@livewireScriptConfig` ディレクティブを含めます。

```blade
<html>
<head>
    <!-- ... -->
    @livewireStyles
    @vite(['resources/js/app.js'])
</head>
<body>
    {{ $slot }}

    @livewireScriptConfig <!-- [tl! highlight] -->
</body>
</html>
```

これにより、Livewireはアプリケーションの実行に必要な設定をバンドルへ提供できます。

`resources/js/app.js` では次のようにLivewireとAlpineをインポートできます。

```js
import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';

// Alpineのディレクティブ、コンポーネント、プラグインをここで登録...

Livewire.start()
```

「x-clipboard」という独自Alpineディレクティブを登録する例です。

```js
import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';

Alpine.directive('clipboard', (el) => {
    let text = el.textContent

    el.addEventListener('click', () => {
        navigator.clipboard.writeText(text)
    })
})

Livewire.start()
```

これで、Livewireアプリケーション内のすべてのAlpineコンポーネントで `x-clipboard` ディレクティブを使えるようになります。

## 関連項目

- **[プロパティ](/properties)** — `$wire` を使ってAlpineからLivewireのプロパティへアクセスする
- **[アクション](/actions)** — AlpineからLivewireのアクションを呼び出す
- **[JavaScript](/javascript)** — コンポーネントで独自JavaScriptを実行する
- **[イベント](/events)** — Alpineでイベントをディスパッチし、リッスンする

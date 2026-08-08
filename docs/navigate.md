現代のWebアプリケーションの多くは「シングルページアプリケーション」（SPA）として構築されています。リンクをクリックするたびに新しいHTMLを要求するマルチページアプリケーションと異なり、ページ全体を再読み込みせずにJavaScriptやCSSの再取得を避けます。Livewireでは、リンクに `wire:navigate` 属性を追加するだけでSPAの体験を得られます。

## 基本的な使い方

```php
use App\Livewire\Dashboard;
use App\Livewire\ShowPosts;
use App\Livewire\ShowUsers;

Route::livewire('/', 'pages::dashboard');
Route::livewire('/posts', 'pages::show-posts');
Route::livewire('/users', 'pages::show-users');
```

```blade
<nav>
    <a href="/" wire:navigate>ダッシュボード</a>
    <a href="/posts" wire:navigate>投稿</a>
    <a href="/users" wire:navigate>ユーザー</a>
</nav>
```

リンクをクリックすると、Livewireはブラウザの移動を防ぎ、裏側でページを要求してローディングバーを表示し、受け取ったHTMLでURL、title、bodyを置き換えます。これによりページの読み込みが高速になり、JavaScript製SPAのような操作感になります。

## リダイレクト

```php
return $this->redirect('/posts', navigate: true);
```

`navigate: true` を指定すると、完全なページリクエストではなく現在のページの内容とURLを置き換えます。

## リンクのプリフェッチ

デフォルトではマウスボタンを押した時点でページの要求を開始します。より積極的に行うには `.hover` 修飾子を使います。

```blade
<a href="/posts" wire:navigate.hover>投稿</a>
```

60ミリ秒ホバーするとプリフェッチします。

> [!warning] ホバー時のプリフェッチはサーバー使用量を増やす
> ホバーしたユーザーがクリックするとは限らないため、不要なページも要求します。Livewireは60ミリ秒待つことで負荷を抑えます。

## ページ移動の間で要素を保持する

音声や動画プレーヤーなどには `@persist` を使います。両方のページに同じ名前の要素があれば、次のページで以前のDOMが再利用され、状態が保持されます。

```blade
@persist('player')
    <audio src="{{ $episode->file }}" controls></audio>
@endpersist
```

永続化する要素はLivewireコンポーネントの外、通常は `resources/views/layouts/app.blade.php` のようなメインレイアウトに置いてください。

```html
<!-- resources/views/layouts/app.blade.php -->
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{ $title ?? config('app.name') }}</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        @livewireStyles
    </head>
    <body>
        <main>{{ $slot }}</main>
        @persist('player')
            <audio src="{{ $episode->file }}" controls></audio>
        @endpersist
        @livewireScripts
    </body>
</html>
```

### 現在のリンクを強調する

永続化要素内ではサーバー側Bladeの現在判定は再利用のため動作しません。Livewireは現在のページに一致する `wire:navigate` リンクへ `data-current` 属性を自動追加します。

```blade
<nav>
    <a href="/dashboard" wire:navigate class="data-current:font-bold data-current:text-zinc-800">ダッシュボード</a>
    <a href="/posts" wire:navigate class="data-current:font-bold data-current:text-zinc-800">投稿</a>
    <a href="/users" wire:navigate class="data-current:font-bold data-current:text-zinc-800">ユーザー</a>
</nav>
```

#### `data-current` 属性を使う

`/posts` を訪れると、投稿リンクに自動的に `data-current` 属性が追加されます。CSSでもスタイル設定できます。

```css
[data-current] {
    font-weight: bold;
    color: #18181b;
}
```

`data-current` を無効にしつつ `wire:navigate` を使うには、`wire:current.ignore` を指定します。

```blade
<a href="/posts" wire:navigate wire:current.ignore>投稿</a>
```

#### `wire:current` ディレクティブを使う

```blade
<nav>
    <a href="/dashboard" ... wire:current="font-bold text-zinc-800">ダッシュボード</a>
    <a href="/posts" ... wire:current="font-bold text-zinc-800">投稿</a>
    <a href="/users" ... wire:current="font-bold text-zinc-800">ユーザー</a>
</nav>
```

`/posts` を訪れると、投稿リンクのフォントが強調されます。

> [!tip] 単純さを優先するならdata-current
> どちらも便利ですが、`data-current` は追加ディレクティブが不要で、Tailwindのdata属性バリアントとも自然に連携するため、より単純で柔軟です。

詳しくは[wire:currentのドキュメント](https://livewire.laravel.com/docs/4.x/wire-current)を参照してください。

### スクロール位置を保持する

永続化する要素のスクロール位置を保持するには、スクロールバーを持つ要素に `wire:navigate:scroll` を追加します。

```html
@persist('sidebar')
<div class="overflow-y-scroll" wire:navigate:scroll>
    <!-- ... -->
</div>
@endpersist
```

## JavaScriptフック

ページ移動では `livewire:navigate`、`livewire:navigating`、`livewire:navigated` が発生します。手動の `Livewire.navigate()`、ナビゲーション付きリダイレクト、戻る・進むも対象です。

```js
document.addEventListener('livewire:navigate', (event) => {
    event.preventDefault()
    let context = event.detail
    context.url
    context.history
    context.cached
})

document.addEventListener('livewire:navigating', (e) => {
    e.detail.onSwap(() => {
        // 新HTMLの差し替え後、スクリプト読み込み前
    })
})

document.addEventListener('livewire:navigated', () => {
    // 移動の最後。DOMContentLoadedの代わりにも使える
})
```

> [!warning] イベントリスナーはページをまたいで残る
> documentに追加したリスナーは削除されません。特定ページだけのコードやページごとに同じリスナーを追加するコードでは、例外や複数回実行につながります。`addEventListener` の第3引数に `{once: true}` を渡すと実行後に削除できます。

```js
document.addEventListener('livewire:navigated', () => {
    // ...
}, { once: true })
```

## JavaScriptで新しいページへ移動する

```html
<script>
    Livewire.navigate('/new/url')
</script>
```

## アナリティクスソフトウェアと使う

`wire:navigate` ではheadのscriptは初回だけ評価されます。[Fathom Analytics](https://usefathom.com/) などではscriptタグに `data-spa="auto"` を追加します。[Google Analytics](https://marketingplatform.google.com/about/analytics/) のように自動対応するツールもあります。

```blade
<script src="https://cdn.usefathom.com/script.js" data-site="ABCDEFG" data-spa="auto" defer></script>
```

## スクリプトの評価

### `DOMContentLoaded` に依存しない

`DOMContentLoaded` は初回だけ発生するため、毎回実行するコードでは `livewire:navigated` を使います。

```js
document.addEventListener('DOMContentLoaded', () => { // [tl! remove]
document.addEventListener('livewire:navigated', () => { // [tl! add]
    // ...
})
```

これで初回ページと、以降のページ移動完了後の両方で実行されます。サードパーティライブラリの初期化にも便利です。

### `<head>` のscriptは一度だけ読み込まれる

2ページが同じ `<script>` タグをheadに含めても、初回だけ実行されます。

```blade
<!-- 1ページ目 -->
<head><script src="/app.js"></script></head>
<!-- 2ページ目 -->
<head><script src="/app.js"></script></head>
```

### 新しい `<head>` scriptは評価される

初回headになかった新しいscriptは、次のページへ移動したときに実行されます。

```blade
<!-- 1ページ目 -->
<head><script src="/app.js"></script></head>
<!-- 2ページ目 -->
<head>
    <script src="/app.js"></script>
    <script src="/third-party.js"></script>
</head>
```

> [!info] headのアセットはブロッキングする
> head内の `<script src="...">` などは、移動完了と新しいページの差し替え前に取得・処理されます。これにより、そのアセットへ依存するscriptはすぐ利用できます。

### アセット変更時に再読み込みする

アプリケーションのJavaScriptファイル名にバージョンハッシュを含めるのは一般的ですが、`wire:navigate` では古いscriptが残る場合があります。headのscriptに `data-navigate-track` を追加します。

```blade
<!-- 1ページ目 -->
<head><script src="/app.js?id=123" data-navigate-track></script></head>
<!-- 2ページ目 -->
<head><script src="/app.js?id=456" data-navigate-track></script></head>
```

新しいアセットを検出すると、Livewireはブラウザ全体を再読み込みします。[LaravelのViteプラグイン](https://laravel.com/docs/vite#loading-your-scripts-and-styles) では、生成されたタグへ自動追加されます。

```blade
<head>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
```

> [!warning] 追跡されるのはクエリ文字列の変更だけ
> `[data-navigate-track]` 要素のクエリ文字列（`?id="456"`）が変わったときだけ再読み込みされ、URI自体（`/app.js`）の変更は追跡されません。

### `<body>` のscriptは再評価される

body全体が置き換えられるため、新ページのscriptは実行されます。

```blade
<!-- 1ページ目 -->
<body><script>console.log('1ページ目で実行')</script></body>
<!-- 2ページ目 -->
<body><script>console.log('2ページ目で実行')</script></body>
```

一度だけ実行するには `data-navigate-once` を指定します。

```blade
<script data-navigate-once>
    console.log('1ページ目だけで実行')
</script>
```

## プログレスバーをカスタマイズする

150msより長い移動で表示されるバーは `config/livewire.php` で変更・無効化できます。

```php
'navigate' => [
    'show_progress_bar' => false,
    'progress_bar_color' => '#2299dd',
],
```

## 関連項目

- **[ページ](/pages)** — ルーティング可能なページコンポーネントを作成する
- **[リダイレクト](https://livewire.laravel.com/docs/4.x/redirecting)** — アクションから移動する
- **[@persist](https://livewire.laravel.com/docs/4.x/directive-persist)** — ページ間で要素を保持する
- **[wire:navigate](https://livewire.laravel.com/docs/4.x/wire-navigate)** — リンクにSPAナビゲーションを追加する

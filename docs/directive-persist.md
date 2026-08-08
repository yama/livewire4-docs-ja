`@persist`ディレクティブは、`wire:navigate`によるページ移動の際に要素を保持し、状態を維持して再初期化を防ぎます。

## 基本的な使い方

`@persist`で要素を囲み、一意の名前を指定します。

```blade
@persist('player')
    <audio src="{{ $episode->file }}" controls></audio>
@endpersist
```

同じ名前の保持対象要素を含むページへ移動すると、Livewireは新しいDOM要素を作らず既存要素を再利用します。音声プレイヤーなら再生が途切れません。

> [!tip] `wire:navigate`が必要
> `@@persist`はLivewireの`wire:navigate`でナビゲーションを処理する場合だけ動作します。通常のページ読み込みでは要素を保持しません。

## 一般的な用途

**音声・動画プレイヤー**
```blade
@persist('podcast-player')
    <audio src="{{ $episode->audio_url }}" controls></audio>
@endpersist
```

**チャットウィジェット**
```blade
@persist('support-chat')
    <div id="chat-widget"><!-- チャットインターフェース... --></div>
@endpersist
```

**サードパーティウィジェット**
```blade
@persist('analytics-widget')
    <div id="analytics-dashboard"><!-- 初期化にコストがかかる複雑なウィジェット... --></div>
@endpersist
```

## レイアウトへの配置

保持する要素は通常Livewireコンポーネントの外、メインレイアウトに置きます。

```blade
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

## スクロール位置を保持する

スクロール可能な保持要素には`wire:navigate:scroll`を追加します。

```blade
@persist('scrollable-list')
    <div class="overflow-y-scroll" wire:navigate:scroll><!-- スクロール可能なコンテンツ... --></div>
@endpersist
```

## アクティブリンクを強調する

保持要素内でアクティブリンクを強調するには、サーバー側の条件分岐ではなく`wire:current`を使います。

```blade
@persist('navigation')
    <nav>
        <a href="/dashboard" wire:navigate wire:current="font-bold">ダッシュボード</a>
        <a href="/posts" wire:navigate wire:current="font-bold">投稿</a>
        <a href="/users" wire:navigate wire:current="font-bold">ユーザー</a>
    </nav>
@endpersist
```

[wire:currentについて詳しく見る →](/wire-current)

## 仕組み

`wire:navigate`で移動すると、次のように動作します。
1. Livewireが両方のページで同じ`@persist`名を持つ要素を探す
2. 見つかれば既存要素を新しいページのDOMへ移動する
3. 要素の状態、イベントリスナー、Alpineデータを保持する

[ナビゲーションについて詳しく見る →](/navigate)

## リファレンス

```blade
@persist(string $key)
    <!-- コンテンツ -->
@endpersist
```

| パラメータ | 型 | デフォルト | 説明 |
|-----------|------|---------|-------------|
| `$key` | `string` | *必須* | ページ移動をまたいで保持する要素を識別する一意の名前 |

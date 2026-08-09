ポーリングとは、Webアプリケーションでサーバーに一定間隔でリクエストを送り、更新を確認する技術です。[WebSockets](/events#real-time-events-using-laravel-echo)のような、より高度な技術を使わずにページを最新状態に保てるシンプルな方法です。

## 基本的な使い方

Livewireでポーリングを使うには、要素に`wire:poll`を追加するだけです。

以下は、ユーザーの購読者数を表示する`SubscriberCount`コンポーネントの例です。

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class SubscriberCount extends Component
{
    public function render()
    {
        return view('livewire.subscriber-count', [
            'count' => Auth::user()->subscribers->count(),
        ]);
    }
}
```

```blade
<div wire:poll> <!-- [tl! highlight] -->
    購読者数: {{ $count }}
</div>
```

通常、このコンポーネントはユーザーの購読者数を表示したまま、ページが更新されるまで変化しません。しかし、コンポーネントのテンプレートに`wire:poll`があるため、このコンポーネントは`2.5`秒ごとに自分自身を更新し、購読者数を最新に保ちます。

`wire:poll`に値を渡すことで、ポーリングの間隔で実行するアクションを指定することもできます。

```blade
<div wire:poll="refreshSubscribers">
    購読者数: {{ $count }}
</div>
```

これで、コンポーネントの`refreshSubscribers()`メソッドが`2.5`秒ごとに呼び出されます。

## 時間間隔を制御する

ポーリングの主な欠点は、リソースを大量に消費する可能性があることです。ポーリングを使うページを1,000人の訪問者が開いていると、`2.5`秒ごとに1,000件のネットワークリクエストが発生します。

この状況でリクエストを減らす最善の方法は、ポーリングの間隔を長くすることです。

`wire:poll`に希望する時間を追加すると、コンポーネントがポーリングする頻度を手動で制御できます。

```blade
<div wire:poll.15s> <!-- 秒単位... -->

<div wire:poll.15000ms> <!-- ミリ秒単位... -->
```

## バックグラウンドでのスロットリング

サーバーへのリクエストをさらに減らすため、Livewireはページがバックグラウンドにあるときにポーリングを自動的にスロットリングします。たとえば、ユーザーが別のブラウザタブでページを開いたままにしている場合、タブを再び表示するまでLivewireはポーリングリクエストの数を95%減らします。

タブがバックグラウンドにあるときもポーリングを継続し、この動作をオプトアウトしたい場合は、`wire:poll`に`.keep-alive`モディファイアを追加します。

```blade
<div wire:poll.keep-alive>
```

## ビューポートでのスロットリング

必要なときだけポーリングするためのもう1つの方法は、`wire:poll`に`.visible`モディファイアを追加することです。`.visible`モディファイアを指定すると、Livewireはコンポーネントがページ上で表示されているときだけポーリングします。

```blade
<div wire:poll.visible>
```

`wire:visible`を使うコンポーネントが長いページの下部にある場合、ユーザーがスクロールしてコンポーネントをビューポート内に表示するまでポーリングを開始しません。ユーザーがスクロールして離れると、再びポーリングを停止します。

## リファレンス

```blade
wire:poll
wire:poll="action"
```

### モディファイア

| モディファイア | 説明 |
|----------|-------------|
| `.[number]s` | ポーリング間隔を秒で指定する（例：`.15s`） |
| `.[number]ms` | ポーリング間隔をミリ秒で指定する（例：`.15000ms`） |
| `.keep-alive` | タブがバックグラウンドにあるときもポーリングを続ける |
| `.visible` | 要素がビューポートに表示されているときだけポーリングする |

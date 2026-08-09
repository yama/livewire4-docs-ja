`#[Async]`属性を使うと、アクションをキューに入れず並列実行できます。他のリクエストが処理中でも、すぐに実行されます。

## 基本的な使い方

並列実行したいアクションメソッドに`#[Async]`属性を適用します。

```php
<?php // resources/views/components/post/⚡show.blade.php

use Livewire\Attributes\Async;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public Post $post;

    #[Async] // [tl! highlight]
    public function logActivity()
    {
        Activity::log('post-viewed', $this->post);
    }
};
```

```blade
<div wire:intersect="logActivity">
    <!-- 要素がビューポートに入ったとき非同期でアクティビティを記録 -->
</div>
```

`logActivity()`が呼び出されると、他のリクエストをブロックせず、また他のリクエストにブロックされず、すぐに実行されます。

## 使用する場面

結果がページに表示される内容へ影響しない、fire-and-forget型の処理には`#[Async]`を使います。

* **アナリティクスとログ** — ユーザー行動、ページビュー、操作を追跡する
* **バックグラウンド処理** — ジョブの起動、通知の送信、外部サービスの更新
* **JavaScriptだけで使う結果** — `await $wire.getData()`で取得したデータをJavaScriptだけで利用する

外部リンクのクリックを追跡する例です。

```php
<?php // resources/views/components/⚡external-link.blade.php

use Livewire\Attributes\Async;
use Livewire\Component;

new class extends Component {
    public $url;

    #[Async] // [tl! highlight]
    public function trackClick()
    {
        Analytics::track('external-link-clicked', [
            'url' => $this->url,
            'user_id' => auth()->id(),
        ]);
    }
};
```

```blade
<a href="{{ $url }}" target="_blank" wire:click="trackClick">
    外部サイトを開く
</a>
```

追跡処理が非同期で行われるため、ネットワークリクエストによってユーザーのクリックが遅延しません。

## 使用してはいけない場面

> [!warning] Asyncアクションと状態変更は組み合わせない
> **UIに反映されるコンポーネントの状態を変更する場合、Asyncアクションは絶対に使わないでください。** Asyncアクションは並列で実行されるため、複数の同時リクエスト間で状態が不整合になる予測不能な競合状態が発生します。

危険な例です。

```php
// 警告：してはいけないことを示す例です...

<?php // resources/views/components/⚡counter.blade.php

use Livewire\Attributes\Async;
use Livewire\Component;

new class extends Component {
    public $count = 0;

    #[Async] // これはしないでください！ [tl! highlight]
    public function increment()
    {
        $this->count++; // Asyncアクションでの状態変更 [tl! highlight]
    }
};
```

ユーザーがincrementボタンを素早くクリックすると、複数の非同期リクエストが同時に実行されます。各リクエストは同じ初期`$count`から始まるため、更新が失われます。5回クリックしてもカウンターが1しか増えないことがあります。

**原則：** コンポーネントの表示に影響するプロパティを変更せず、純粋な副作用だけを実行するアクションにAsyncを使ってください。

## 代替方法

### `.async`モディファイアを使う

属性の代わりに、`.async`モディファイアで特定のアクション呼び出しを非同期にできます。

```blade
<button wire:click.async="logActivity">イベントを追跡</button>
```

場所によって非同期・同期を使い分けたい場合に便利です。

## さらに詳しく

非同期アクション、競合状態、高度な用途については、[アクションのドキュメント](/actions#parallel-execution-with-async)を参照してください。

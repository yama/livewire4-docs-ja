`#[Isolate]`属性を使うと、コンポーネントのリクエストが他のコンポーネントの更新と束ねられなくなり、並列実行できます。

## 束ねることが重要な理由

Livewireでは、コンポーネントの更新ごとにネットワークリクエストが発生します。デフォルトでは、複数のコンポーネントが同時に更新をトリガーすると、1つのリクエストにまとめられます。

これによりサーバーへの接続数が減り、サーバー負荷を大幅に削減できます。パフォーマンス向上に加え、複数コンポーネントの連携が必要な内部機能（[リアクティブプロパティ](/nesting#reactive-props)、[Modelableプロパティ](/nesting#binding-to-child-data-using-wiremodel)など）も利用できます。

一方、パフォーマンス上の理由からこの束ね処理を無効にしたい場合があります。そのための属性が`#[Isolate]`です。

## 基本的な使い方

独立したリクエストを送るコンポーネントに`#[Isolate]`を適用します。

```php
<?php // resources/views/components/post/⚡show.blade.php

use Livewire\Attributes\Isolate;
use Livewire\Component;
use App\Models\Post;

new #[Isolate] class extends Component { // [tl! highlight]
    public Post $post;

    public function refreshStats()
    {
        // 高コストな処理...
        $this->post->recalculateStatistics();
    }
};
```

これで、このコンポーネントのリクエストは他のコンポーネントの更新と束ねられず、並列実行されます。

> [!tip] 束ねると有利な場合と不利な場合
> ほとんどのケースでは束ねるのが適していますが、高コストな処理を行うコンポーネントがあると、リクエスト全体が遅くなることがあります。そのコンポーネントを分離すると、他の更新と並列実行できます。

## 使用する場面

次のような場合に`#[Isolate]`を使います。

* コンポーネントが高コストな処理（複雑なクエリ、API呼び出し、重い計算）を行う
* 複数のコンポーネントが`wire:poll`を使い、ポーリング間隔を独立させたい
* コンポーネントがイベントをリッスンし、遅いコンポーネントで他をブロックしたくない
* コンポーネントがページ上の他のコンポーネントと連携する必要がない

## 例：ポーリングするコンポーネント

複数のポーリングコンポーネントを使う実用例です。

```php
<?php // resources/views/components/⚡system-status.blade.php

use Livewire\Attributes\Isolate;
use Livewire\Component;

new #[Isolate] class extends Component { // [tl! highlight]
    public function checkStatus()
    {
        // 高コストな外部API呼び出し...
        return ExternalService::getStatus();
    }
};
```

```blade
<div wire:poll.5s>
    ステータス: {{ $this->checkStatus() }}
</div>
```

`#[Isolate]`がなければ、このコンポーネントの遅いAPI呼び出しがページ上の他のコンポーネントを遅延させます。指定すると独立してポーリングし、他をブロックしません。

## 遅延コンポーネントはデフォルトで分離される

`#[Lazy]`属性を使うと、コンポーネントは並列読み込みのため自動的に分離されます。必要なら無効にできます。

```php
<?php // resources/views/components/⚡revenue.blade.php

use Livewire\Attributes\Lazy;
use Livewire\Component;

new #[Lazy(isolate: false)] class extends Component { // [tl! highlight]
    // ...
};
```

これで複数の`revenue`コンポーネントが遅延読み込みリクエストを1つのネットワークリクエストにまとめます。

## トレードオフ

**利点：**
* 遅いコンポーネントが他の更新をブロックするのを防ぐ
* 高コストな処理を真に並列実行できる
* ポーリングとイベント処理を独立させられる

**欠点：**
* サーバーへのリクエストが増える
* 同じリクエスト内で他のコンポーネントと連携できない
* 複数接続によるサーバー負荷が少し増える

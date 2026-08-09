`#[Renderless]`属性は、アクション呼び出し時にLivewireのライフサイクルからレンダリング段階をスキップします。コンポーネントの表示を変更しないアクションのパフォーマンスを向上できます。

## 基本的な使い方

コンポーネントを再レンダリングする必要がないアクションメソッドに`#[Renderless]`を適用します。

```php
<?php // resources/views/components/post/⚡show.blade.php

use Livewire\Attributes\Renderless;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public Post $post;

    public function mount(Post $post)
    {
        $this->post = $post;
    }

    #[Renderless] // [tl! highlight]
    public function incrementViewCount()
    {
        $this->post->incrementViewCount();
    }
};
```

```blade
<div>
    <h1>{{ $post->title }}</h1>
    <p>{{ $post->content }}</p>

    <div wire:intersect="incrementViewCount"></div>
</div>
```

上の例では`wire:intersect`を使い、ユーザーが下までスクロールしたときに`incrementViewCount()`を呼び出します。`#[Renderless]`が適用されているため、ビュー数は記録されますがテンプレートは再レンダリングされず、ページのどの部分にも影響しません。

## 使用する場面

次のようなアクションに`#[Renderless]`を使います。

* バックエンド処理（ログ、アナリティクス、トラッキング）だけを行う
* レンダリングされた表示に影響するプロパティを変更しない
* 不要な再レンダリングを発生させず頻繁に実行する必要がある

一般的な用途には次があります。
* ユーザー操作（クリック、スクロール、ページ滞在時間）の追跡
* アナリティクスイベントの送信
* カウンターや指標の更新
* バックグラウンド処理

## 代替方法

### skipRender()を使う

条件付きでレンダリングをスキップしたい場合、または属性を使いたくない場合は、アクション内で`skipRender()`を直接呼び出せます。

```php
<?php // resources/views/components/post/⚡show.blade.php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public Post $post;

    public function incrementViewCount()
    {
        $this->post->incrementViewCount();

        $this->skipRender(); // [tl! highlight]
    }
};
```

### `.renderless`モディファイアを使う

要素側に`.renderless`モディファイアを付け、直接レンダリングをスキップすることもできます。

```blade
<button type="button" wire:click.renderless="incrementViewCount">
    閲覧を追跡
</button>
```

メソッドに属性を追加したくない一度限りのケースに便利です。

## さらに詳しく

アクションとパフォーマンス最適化については、[アクションのドキュメント](/actions#skipping-re-renders)を参照してください。

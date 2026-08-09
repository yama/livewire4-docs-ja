`#[Reactive]`属性を使うと、親が渡した値を変更したとき、子コンポーネントのプロパティも自動的に更新されます。

## 基本的な使い方

親の変更に反応させたいプロパティに`#[Reactive]`を適用します。

```php
<?php // resources/views/components/⚡todo-count.blade.php

use Livewire\Attributes\Reactive;
use Livewire\Attributes\Computed;
use Livewire\Component;

new class extends Component {
    #[Reactive] // [tl! highlight]
    public $todos;

    #[Computed]
    public function count()
    {
        return $this->todos->count();
    }
};
?>

<div>
    件数: {{ $this->count }}
</div>
```

親コンポーネントがtodoを追加・削除すると、子コンポーネントも自動的に更新されて新しい件数を表示します。

## propsがデフォルトでリアクティブではない理由

デフォルトではLivewireのpropsは**リアクティブではありません**。親が更新されても、サーバーへ送られるのは親の状態だけで、子の状態は送られません。これによりデータ転送量を抑え、パフォーマンスを向上させます。

`#[Reactive]`がない場合は次のように動作します。

```php
<?php // resources/views/components/⚡todos.blade.php

use Livewire\Component;

new class extends Component {
    public $todos = [];

    public function addTodo($text)
    {
        $this->todos[] = ['text' => $text];
        // $todos propsを持つ子コンポーネントは自動更新されない
    }
};
?>

<div>
    <livewire:todo-count :$todos />

    <button wire:click="addTodo('新しいタスク')">Todoを追加</button>
</div>
```

子の`$todos`プロパティに`#[Reactive]`がなければ、親でtodoを追加しても子の件数は更新されません。

## 仕組み

`#[Reactive]`を追加すると、次のように動作します。

1. 親が`$todos`プロパティを更新する
2. 親が応答中に新しい`$todos`の値を子へ送る
3. 子コンポーネントが新しい値で自動的に再レンダリングする

これはVueやReactのようなフロントエンドフレームワークに似た「リアクティブ」な関係を作ります。

## パフォーマンス上の注意

> [!warning] リアクティブプロパティは慎重に使う
> リアクティブプロパティを使うと、親の更新ごとにサーバーとクライアント間で追加データを送る必要があります。用途上必要な場合だけ`#[Reactive]`を使ってください。

**使用する場面：**
* 子コンポーネントが親で変化するデータを表示する
* 子を親の状態と同期させる必要がある
* 密結合した親子関係を構築している

**使用しない場面：**
* 初期データを一度渡すだけで変化しない
* 子が独立した状態を管理する
* 更新が不要でパフォーマンスが重要

## 例：ライブ検索結果

リアクティブな検索結果を表示する実用例です。

```php
<?php // resources/views/components/⚡search.blade.php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public $query = '';

    public function posts()
    {
        return Post::where('title', 'like', "%{$this->query}%")->get();
    }
};
?>

<div>
    <input type="text" wire:model.live="query" placeholder="投稿を検索...">

    <livewire:search-results :posts="$this->posts()" /> <!-- [tl! highlight] -->
</div>
```

```php
<?php // resources/views/components/⚡search-results.blade.php

use Livewire\Attributes\Reactive;
use Livewire\Component;

new class extends Component {
    #[Reactive] // [tl! highlight]
    public $posts;
};
?>

<div>
    @foreach($posts as $post)
        <div wire:key="{{ $post->id }}">{{ $post->title }}</div>
    @endforeach
</div>
```

ユーザーが入力すると親の`$posts`が変化し、子の結果も自動更新されます。

## 代替方法：イベント

疎結合なコンポーネントでは、リアクティブpropsの代わりにイベントを使うことを検討してください。

```php
// 親がイベントをディスパッチ
$this->dispatch('todos-updated', todos: $this->todos);

// 子がイベントをリッスン
#[On('todos-updated')]
public function handleTodosUpdate($todos)
{
    $this->todos = $todos;
}
```

イベントは柔軟ですが、コンポーネント間の明示的な通信が必要です。

## さらに詳しく

親子通信とコンポーネント設計については、[コンポーネントのネストのドキュメント](/nesting#reactive-props)を参照してください。

`#[Session]`属性はプロパティの値をユーザーのセッションに保存し、ページの更新や移動をまたいで維持します。

## 基本的な使い方

セッションに保存したいプロパティに`#[Session]`を適用します。

```php
<?php // resources/views/components/post/⚡index.blade.php

use Livewire\Attributes\Session;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Session] // [tl! highlight]
    public $search = '';

    #[Computed]
    public function posts()
    {
        return $this->search === ''
            ? Post::all()
            : Post::where('title', 'like', "%{$this->search}%")->get();
    }
};
?>

<div>
    <input type="text" wire:model.live="search" placeholder="投稿を検索...">

    @foreach($this->posts as $post)
        <div wire:key="{{ $post->id }}">{{ $post->title }}</div>
    @endforeach
</div>
```

ユーザーが検索値を入力すると、ページを更新したり離れて戻ったりしても検索値が保持されます。

## 仕組み

プロパティが変わるたび、Livewireは新しい値をユーザーのセッションに保存します。コンポーネントの読み込み時にはセッションから値を取得し、プロパティを初期化します。

URLを変更せずに、ユーザーごとに状態を維持できます。

## SessionとURLの違い

`#[Session]`と`#[Url]`はどちらもプロパティの値を保持しますが、トレードオフが異なります。

| 機能 | `#[Session]` | `#[Url]` |
|---------|-------------|----------|
| 更新後も保持 | ✅ | ✅ |
| URL共有時も保持 | ❌ | ✅ |
| URLをきれいに保つ | ✅ | ❌ |
| ユーザーに見える | ❌ | ✅ |
| 状態を共有できる | ❌ | ✅ |

URLを汚したくない場合や、状態を共有可能にすべきでない場合は`#[Session]`を使います。

## カスタムセッションキー

デフォルトでは、Livewireがコンポーネント名とプロパティ名からキーを生成します。カスタマイズもできます。

```php
<?php // resources/views/components/post/⚡index.blade.php

use Livewire\Attributes\Session;
use Livewire\Component;

new class extends Component {
    #[Session(key: 'post_search')] // [tl! highlight]
    public $search = '';
};
```

プロパティは`post_search`キーでセッションに保存されます。

## 動的なセッションキー

他のプロパティを使ってキーを動的に生成できます。

```php
<?php // resources/views/components/post/⚡index.blade.php

use Livewire\Attributes\Session;
use Livewire\Component;
use App\Models\Author;

new class extends Component {
    public Author $author;

    #[Session(key: 'search-{author.id}')] // [tl! highlight]
    public $search = '';
};
```

`$author->id`が`4`ならセッションキーは`search-4`になります。著者ごとに異なるセッション値を使えます。

## 使用する場面

次のような場合に`#[Session]`を使います。

* ユーザー設定（テーマ、言語、サイドバー状態）を保存する
* ページ移動をまたいでフィルター・検索状態を維持する
* 更新による消失を防ぐためフォームデータを保存する
* ユーザー専用のUI状態を保持する
* クエリパラメータによるURLの乱雑化を避ける

## 例：ダッシュボードのフィルター

ダッシュボードのフィルターを保存する実用例です。

```php
<?php // resources/views/pages/⚡dashboard.blade.php

use Livewire\Attributes\Session;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Transaction;

new class extends Component {
    #[Session]
    public $dateRange = '30days';

    #[Session]
    public $category = 'all';

    #[Session]
    public $sortBy = 'date';

    #[Computed]
    public function transactions()
    {
        return Transaction::query()
            ->when($this->dateRange === '30days', fn($q) => $q->where('created_at', '>=', now()->subDays(30)))
            ->when($this->category !== 'all', fn($q) => $q->where('category', $this->category))
            ->orderBy($this->sortBy)
            ->get();
    }
};
?>

<div>
    <select wire:model.live="dateRange">
        <option value="7days">過去7日間</option>
        <option value="30days">過去30日間</option>
        <option value="year">今年</option>
    </select>

    <select wire:model.live="category">
        <option value="all">すべてのカテゴリ</option>
        <option value="income">収入</option>
        <option value="expense">支出</option>
    </select>

    <select wire:model.live="sortBy">
        <option value="date">日付</option>
        <option value="amount">金額</option>
    </select>

    @foreach($this->transactions as $transaction)
        <div wire:key="{{ $transaction->id }}">{{ $transaction->description }}</div>
    @endforeach
</div>
```

ユーザーが好みのフィルターを設定すると、セッション、ページ更新、ページ移動をまたいで保持されます。

## パフォーマンス上の注意

> [!warning] 大量のデータを保存しない
> Laravelのセッションはリクエストごとにメモリへ読み込まれます。ユーザーのセッションに保存しすぎると、そのユーザーに対するアプリケーション全体が遅くなります。大きなコレクションやオブジェクトは保存しないでください。

**適した用途：**
* 単純な値（文字列、数値、boolean）
* 小さな配列（フィルター、設定）
* モデルID（モデル全体ではない）

**適さない用途：**
* 大きなコレクション
* 完全なEloquentモデル
* バイナリデータやファイル内容

> [!tip] 代替方法：URLへの保存
> URLで状態を共有したりブックマーク可能にしたい場合は、`#[Session]`の代わりに[`#[Url]`属性](https://livewire.laravel.com/docs/4.x/url)を検討してください。URLパラメータはアドレスバーに状態を保持し、セッションプロパティはURLをきれいに保ちます。

## リファレンス

```php
#[Session(
    ?string $key = null,
)]
```

| パラメータ | 型 | デフォルト | 説明 |
|-----------|------|---------|-------------|
| `$key` | `?string` | `null` | カスタムセッションキー（未指定なら自動生成） |

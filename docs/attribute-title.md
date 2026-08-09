`#[Title]`属性は、フルページLivewireコンポーネントのページタイトルを設定します。

## 基本的な使い方

フルページコンポーネントに`#[Title]`を適用してタイトルを設定します。

```php
<?php // resources/views/pages/posts/⚡create.blade.php

use Livewire\Attributes\Title;
use Livewire\Component;

new #[Title('Create Post')] class extends Component { // [tl! highlight]
    public $title = '';
    public $content = '';

    public function save()
    {
        // 投稿を保存...
    }
};
?>

<div>
    <h1>新しい投稿を作成</h1>

    <input type="text" wire:model="title" placeholder="投稿タイトル">
    <textarea wire:model="content" placeholder="投稿本文"></textarea>

    <button wire:click="save">投稿を保存</button>
</div>
```

ブラウザのタブにはページタイトルとして「Create Post」が表示されます。

## レイアウト設定

`#[Title]`を動作させるには、レイアウトファイルに`$title`変数を含める必要があります。

```blade
<!-- resources/views/components/layouts/app.blade.php -->

<!DOCTYPE html>
<html>
<head>
    <title>{{ $title ?? 'マイアプリ' }}</title> <!-- [tl! highlight] -->
</head>
<body>
    {{ $slot }}
</body>
</html>
```

`?? 'マイアプリ'`はタイトルが指定されていない場合のフォールバックです。

## 動的なタイトル

コンポーネントのプロパティを使う動的なタイトルには、`render()`メソッド内で`title()`メソッドを使います。

```php
<?php // resources/views/pages/posts/⚡edit.blade.php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public Post $post;

    public function mount($id)
    {
        $this->post = Post::findOrFail($id);
    }

    public function render()
    {
        return $this->view()
            ->title("編集：{$this->post->title}"); // [tl! highlight]
    }
};
?>

<div>
    <h1>投稿を編集</h1>
    <!-- ... -->
</div>
```

タイトルに投稿のタイトルが動的に含まれます。

## レイアウトと組み合わせる

`#[Title]`と`#[Layout]`は一緒に使えます。

```php
<?php // resources/views/pages/posts/⚡create.blade.php

use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Component;

new
#[Layout('layouts.admin')]
#[Title('Create Post')]
class extends Component {
    // ...
};
```

このコンポーネントは管理レイアウトを使い、タイトルに「Create Post」を表示します。

## 使用する場面

次のような場合に`#[Title]`を使います。

* フルページコンポーネントを構築する
* 宣言的でわかりやすいタイトル定義を使いたい
* タイトルが固定またはほとんど変化しない
* SEOのベストプラクティスに従う

次のような場合は`title()`メソッドを使います。

* タイトルがコンポーネントのプロパティに依存する
* タイトルを動的に計算する必要がある
* タイトルがコンポーネントの状態によって変わる

## 例：CRUDページ

CRUD操作でタイトルを使う完全な例です。

```php
<?php // resources/views/pages/posts/⚡index.blade.php

use Livewire\Attributes\Title;
use Livewire\Component;

new #[Title('All Posts')] class extends Component { };
```

```php
<?php // resources/views/pages/posts/⚡create.blade.php

use Livewire\Attributes\Title;
use Livewire\Component;

new #[Title('Create Post')] class extends Component { };
```

```php
<?php // resources/views/pages/posts/⚡edit.blade.php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public Post $post;

    public function render()
    {
        return $this->view()->title("編集：{$this->post->title}");
    }
};
```

```php
<?php // resources/views/pages/posts/⚡show.blade.php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public Post $post;

    public function render()
    {
        return $this->view()->title($this->post->title);
    }
};
```

各ページに文脈に合ったタイトルが設定され、ユーザー体験とSEOが改善されます。

## SEO上の注意

適切なページタイトルはSEOにとって重要です。

* **説明的にする** — 「投稿を編集：Laravelを始める」が「編集」より適切
* **簡潔にする** — 検索結果で省略されないよう50〜60文字を目安にする
* **キーワードを含める** — 検索エンジンがページ内容を理解しやすくする
* **一意にする** — ページごとに異なるタイトルを設定する

## フルページコンポーネント専用

> [!info] フルページコンポーネント専用
> `#[Title]`属性はルート経由でアクセスされるフルページコンポーネントでだけ動作します。他のビュー内でレンダリングされる通常のコンポーネントはタイトルを使わず、親ページのタイトルを継承します。

## さらに詳しく

フルページコンポーネント、レイアウト、ルーティングについては、[ページのドキュメント](/pages#setting-a-page-title)を参照してください。

## リファレンス

```php
#[Title(
    string $content,
)]
```

| パラメータ | 型 | デフォルト | 説明 |
|-----------|------|---------|-------------|
| `$content` | `string` | *必須* | ブラウザのタイトルバーに表示するテキスト |

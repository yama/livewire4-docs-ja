`#[Layout]`属性は、フルページコンポーネントが使うBladeレイアウトを指定します。コンポーネント単位でレイアウトをカスタマイズできます。

## 基本的な使い方

フルページコンポーネントに`#[Layout]`を適用してレイアウトを指定します。

```php
<?php // resources/views/pages/posts/⚡index.blade.php

use Livewire\Attributes\Layout;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Post;

new #[Layout('layouts::dashboard')] class extends Component { // [tl! highlight]
    #[Computed]
    public function posts()
    {
        return Post::all();
    }
};
?>

<div>
    <h1>投稿</h1>
    @foreach ($this->posts as $post)
        <div wire:key="{{ $post->id }}">{{ $post->title }}</div>
    @endforeach
</div>
```

このコンポーネントはデフォルトのレイアウトではなく`resources/views/layouts/dashboard.blade.php`を使ってレンダリングされます。

## デフォルトレイアウト

デフォルトでは`config/livewire.php`で指定したレイアウトを使います。

```php
'component_layout' => 'layouts::app',
```

`#[Layout]`属性は特定のコンポーネントでこのデフォルトを上書きします。

## レイアウトへデータを渡す

配列構文でレイアウトへ追加データを渡せます。

```php
new #[Layout('layouts::dashboard', ['title' => '投稿ダッシュボード'])] class extends Component { // [tl! highlight]
    // ...
};
```

レイアウトファイルでは`$title`変数を利用できます。

```blade
<!DOCTYPE html>
<html>
<head>
    <title>{{ $title ?? 'マイアプリ' }}</title>
</head>
<body>
    {{ $slot }}
</body>
</html>
```

## 代替方法：layout()メソッドを使う

属性の代わりに`render()`メソッド内で`layout()`メソッドを使えます。

```php
<?php // resources/views/pages/posts/⚡index.blade.php

use Livewire\Component;

new class extends Component {
    public function render()
    {
        return $this->view()
            ->layout('layouts::dashboard', ['title' => '投稿']); // [tl! highlight]
    }
};
```

`render()`メソッドを必要としないシングルファイルコンポーネントでは、属性のほうがすっきりします。

## ページごとに異なるレイアウトを使う

アプリケーションのセクションごとに異なるレイアウトを使うのは一般的なパターンです。

```php
// 管理ページ
new #[Layout('layouts::admin')] class extends Component { }

// マーケティングページ
new #[Layout('layouts::marketing')] class extends Component { }

// ダッシュボードページ
new #[Layout('layouts::dashboard')] class extends Component { }
```

## 使用する場面

次のような場合に`#[Layout]`を使います。

* アプリケーションに複数のレイアウトがある（管理、マーケティング、ダッシュボードなど）
* 特定のページでデフォルトと別のレイアウトが必要
* フルページコンポーネントを構築している（通常のコンポーネントではない）
* レイアウト設定をコンポーネント定義の近くに置きたい

> [!info] フルページコンポーネント専用
> `#[Layout]`属性はフルページコンポーネントにだけ適用されます。他のビュー内でレンダリングされる通常のコンポーネントはレイアウトを使いません。

## さらに詳しく

フルページコンポーネントとレイアウトについては、[ページのドキュメント](/pages#layouts)を参照してください。

## リファレンス

```php
#[Layout(
    string $name,
    array $params = [],
)]
```

| パラメータ | 型 | デフォルト | 説明 |
|-----------|------|---------|-------------|
| `$name` | `string` | *必須* | 使用するBladeレイアウトの名前 |
| `$params` | `array` | `[]` | レイアウトへ渡す追加データ |

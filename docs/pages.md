# ページ

Livewireコンポーネントをルートに直接割り当てると、アプリケーションのページ全体として使えます。これにより、カスタムレイアウト、ページタイトル、ルートパラメータなどの機能を備えたページをLivewireコンポーネントだけで構築できます。

## コンポーネントをルーティングする

`routes/web.php`で`Route::livewire()`メソッドを使い、コンポーネントをルートに割り当てます。

```php
Route::livewire('/posts/create', 'pages::post.create');
```

指定したURLにアクセスすると、アプリケーションのレイアウトを使ってコンポーネントがページ全体として描画されます。

## レイアウト

ルート経由で描画されるコンポーネントは、アプリケーションのレイアウトファイルを使います。デフォルトでは、`resources/views/layouts/app.blade.php`にある`layouts::app`というレイアウトを探します。

ファイルがまだない場合は、次のコマンドで作成できます。

```shell
php artisan livewire:layout
```

このコマンドは`resources/views/layouts/app.blade.php`を生成します。

この場所にBladeファイルを作成し、`{{ $slot }}`プレースホルダーを含めてください。

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
        {{ $slot }}

        @livewireScripts
    </body>
</html>
```

`config/livewire.php`の`component_layout`設定を更新すると、デフォルトレイアウトをカスタマイズできます。

```php
'component_layout' => 'layouts::dashboard',
```

### コンポーネント固有のレイアウト

特定のコンポーネントで別のレイアウトを使うには、コンポーネントクラスの上に`#[Layout]` Attributeを配置します。

```php
<?php

use Livewire\Attributes\Layout;
use Livewire\Component;

new #[Layout('layouts::dashboard')] class extends Component { // [tl! highlight]
    // ...
};
```

または、コンポーネントの`render()`メソッド内で`->layout()`メソッドを使うこともできます。

```php
<?php

use Livewire\Component;

new class extends Component {
    // ...

    public function render()
    {
        return $this->view()
            ->layout('layouts::dashboard'); // [tl! highlight]
    }
};
```

## ページタイトルを設定する

アプリケーションの各ページに固有のタイトルを設定すると、ユーザーにも検索エンジンにも役立ちます。

ページコンポーネントにカスタムタイトルを設定するには、まずレイアウトファイルが動的なタイトルを含むことを確認します。

```blade
<head>
    <title>{{ $title ?? config('app.name') }}</title>
</head>
```

次に、Livewireコンポーネントのクラスの上へ`#[Title]` Attributeを追加し、ページタイトルを渡します。

```php
<?php

use Livewire\Attributes\Title;
use Livewire\Component;

new #[Title('投稿を作成')] class extends Component { // [tl! highlight]
    // ...
};
```

これでコンポーネントのページタイトルが設定されます。この例では、コンポーネントの描画時にページタイトルが「投稿を作成」になります。

コンポーネントのプロパティを使うなど、動的なタイトルを渡す必要がある場合は、コンポーネントの`render()`メソッドで`->title()`フルーエントメソッドを使います。

```php
public function render()
{
    return $this->view()
         ->title('投稿を作成'); // [tl! highlight]
}
```

## 追加のレイアウトファイルスロットを設定する

レイアウトファイルに`$slot`以外の名前付きスロットがある場合、ルート要素の外側で`<x-slot>`を定義すると、Bladeビューから内容を設定できます。例えば、各コンポーネントでページ言語を個別に設定できるようにするには、レイアウトファイルのHTML開始タグに動的な`$lang`スロットを追加します。

```blade
<!-- resources/views/layouts/app.blade.php -->

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', $lang ?? app()->getLocale()) }}"> <!-- [tl! highlight] -->
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>{{ $title ?? config('app.name') }}</title>

        @vite(['resources/css/app.css', 'resources/js/app.js'])

        @livewireStyles
    </head>
    <body>
        {{ $slot }}

        @livewireScripts
    </body>
</html>
```

次に、コンポーネントビューでルート要素の外側に`<x-slot>`要素を定義します。

```blade
<x-slot:lang>fr</x-slot> // このコンポーネントはフランス語です <!-- [tl! highlight] -->

<div>
    // フランス語の内容をここに記述...
</div>
```

## ルートパラメータにアクセスする

ページコンポーネントでは、Livewireコンポーネント内からルートパラメータにアクセスする必要がある場合があります。

まず、`routes/web.php`でパラメータ付きのルートを定義します。

```php
Route::livewire('/posts/{id}', 'pages::show-post');
```

ここでは、投稿のIDを表す`id`パラメータを持つルートを定義しています。

次に、`mount()`メソッドでルートパラメータを受け取るようLivewireコンポーネントを更新します。

```php
<?php

use App\Models\Post;
use Livewire\Component;

new class extends Component {
    public Post $post;

    public function mount($id) // [tl! highlight]
    {
        $this->post = Post::findOrFail($id);
    }
};
```

この例では、`$id`パラメータ名がルートパラメータ`{id}`と一致するため、`/posts/1`にアクセスするとLivewireは値`1`を`$id`として渡します。

## ルートモデルバインディングを使う

Laravelのルートモデルバインディングを使うと、ルートパラメータからEloquentモデルを自動的に解決できます。

まず、`routes/web.php`でモデルパラメータを持つルートを定義します。

```php
Route::livewire('/posts/{post}', 'pages::show-post');
```

これで、コンポーネントの`mount()`メソッドからルートモデルパラメータを受け取れます。

```php
<?php

use App\Models\Post;
use Livewire\Component;

new class extends Component {
    public Post $post;

    public function mount(Post $post) // [tl! highlight]
    {
        $this->post = $post;
    }
};
```

`mount()`の`$post`パラメータに`Post`型を指定しているため、Livewireは「ルートモデルバインディング」を使うことを認識します。

先ほどと同じように、`mount()`メソッドを省略して定型コードを減らすこともできます。

```php
<?php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public Post $post; // [tl! highlight]
};
```

`$post`プロパティには、ルートの`{post}`パラメータでバインドされたモデルが自動的に設定されます。

## 関連項目

- **[コンポーネント](/components)** — コンポーネントの作成と整理
- **[Navigate](/navigate)** — SPAのようなページ間ナビゲーション
- **[リダイレクト](/redirecting)** — フォーム送信やアクション後のリダイレクト
- **[Layout Attribute](/attribute-layout)** — フルページコンポーネントのレイアウト指定
- **[Title Attribute](/attribute-title)** — ページタイトルの動的設定

フォーム送信などのアクションをユーザーが実行した後、アプリケーション内の別ページへリダイレクトしたい場合があります。

Livewireのリクエストは通常のブラウザによる全ページリクエストではないため、標準的なHTTPリダイレクトは動作しません。代わりにJavaScript経由でリダイレクトを起動する必要があります。Livewireにはコンポーネント内で使えるシンプルな `$this->redirect()` ヘルパーメソッドがあり、フロントエンドでのリダイレクト処理はLivewireが内部的に行います。

必要であれば、コンポーネント内で[Laravel組み込みのリダイレクトユーティリティ](https://laravel.com/docs/responses#redirects)も使えます。

## 基本的な使い方

以下は、投稿作成フォームの送信後に別ページへリダイレクトする `post.create` Livewireコンポーネントの例です。

```php
<?php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public $title = '';
    public $content = '';

    public function save()
    {
        Post::create([
            'title' => $this->title,
            'content' => $this->content,
        ]);

        $this->redirect('/posts'); // [tl! highlight]
    }
};
?>

<form wire:submit="save">
    <!-- フォームフィールド... -->
</form>
```

`save` アクションが起動すると、`/posts` へのリダイレクトも起動します。Livewireがこのレスポンスを受け取ると、フロントエンドでユーザーを新しいURLへ移動させます。

## Routeへリダイレクトする

ルート名を使ってページへリダイレクトしたい場合は `redirectRoute` を使います。

```php
Route::get('/user/profile', function () {
    // ...
})->name('profile');
```

```php
$this->redirectRoute('profile');
```

ルートへパラメータを渡す必要がある場合は、`redirectRoute` の第2引数を使います。

```php
$this->redirectRoute('profile', ['id' => 1]);
```

## 元のページへリダイレクトする

ユーザーが直前にいたページへ戻すには `redirectIntended` を使います。第1引数には任意のデフォルトURLを指定でき、直前のページを判定できない場合のフォールバックになります。

```php
$this->redirectIntended('/default/url');
```

## フルページコンポーネントへリダイレクトする

LivewireはLaravel組み込みのリダイレクト機能を使うため、通常のLaravelアプリケーションで利用できるリダイレクトメソッドをすべて使えます。

```php
Route::livewire('/posts', 'pages::show-posts');
```

```php
public function save()
{
    // ...

    $this->redirect('/posts');
}
```

## コントローラーアクションへリダイレクトする

コントローラーアクションが処理するルートへリダイレクトするには `redirectAction()` を使います。

```php
$this->redirectAction([UserController::class, 'index']);
```

第2引数でコントローラーアクションへパラメータを渡せます。

```php
$this->redirectAction([UserController::class, 'show'], ['id' => 1]);
```

## フラッシュメッセージ

Laravel組み込みのリダイレクトメソッドに加えて、LivewireはLaravelの[セッションフラッシュデータユーティリティ](https://laravel.com/docs/session#flash-data)もサポートします。

```php
<?php

use Livewire\Component;

new class extends Component {
    // ...

    public function update()
    {
        // ...

        session()->flash('status', '投稿を更新しました。');
        $this->redirect('/posts');
    }
};
?>
```

リダイレクト先のページに次のBladeスニペットがあると、投稿の更新後に「投稿を更新しました。」と表示されます。

```blade
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```

## 関連項目

- **[ナビゲーション](/navigate)** — リダイレクトにSPAナビゲーションを使う
- **[アクション](/actions)** — アクション完了後にリダイレクトする
- **[フォーム](/forms)** — フォーム送信成功後にリダイレクトする
- **[ページ](/pages)** — ページコンポーネント間を移動する

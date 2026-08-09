Livewireアプリケーションが安全で、脆弱性を公開しないようにすることが重要です。Livewireには多くのケースに対応する内部セキュリティ機能がありますが、コンポーネントを安全に保つ責任がアプリケーションコードにある場合もあります。

## アクションパラメータを認可する

Livewireアクションのパラメータはクライアント側で変更できるため、信頼できない入力として扱います。最も一般的な落とし穴は、データベースへ保存する前にアクションを検証・認可しないことです。

```php
<?php
use App\Models\Post;
use Livewire\Component;
class ShowPost extends Component
{
    public function delete($id)
    {
        // 安全ではない！
        $post = Post::find($id);
        $post->delete();
    }
}
```

```html
<button wire:click="delete({{ $post->id }})">投稿を削除</button>
```

ブラウザ上で`wire:click="delete(...)"`を変更し、任意の投稿IDを渡せるため安全ではありません。パラメータはブラウザからの信頼できない入力と同じように扱います。

ユーザーが他人の投稿を削除できないよう、`delete()`に認可を追加します。まず[Laravel Policy](https://laravel.com/docs/authorization#creating-policies)を作成します。

```bash
php artisan make:policy PostPolicy --model=Post
```

`app/Policies/PostPolicy.php`を更新します。

```php
<?php
namespace App\Policies;
use App\Models\Post;
use App\Models\User;
class PostPolicy
{
    public function delete(?User $user, Post $post): bool
    {
        return $user?->id === $post->user_id;
    }
}
```

コンポーネントで`$this->authorize()`を使います。

```php
public function delete($id)
{
    $post = Post::find($id);
    $this->authorize('delete', $post); // [tl! highlight]
    $post->delete();
}
```

詳しくは次を参照してください。

* [Laravel Gates](https://laravel.com/docs/authorization#gates)
* [Laravel Policies](https://laravel.com/docs/authorization#creating-policies)

## publicプロパティを認可する

アクションパラメータと同じく、Livewireのpublicプロパティも信頼できないユーザー入力として扱います。

```php
<?php
use App\Models\Post;
use Livewire\Component;
class ShowPost extends Component
{
    public $postId;
    public function mount($postId) { $this->postId = $postId; }
    public function delete()
    {
        // 安全ではない！
        $post = Post::find($this->postId);
        $post->delete();
    }
}
```

```html
<button wire:click="delete">投稿を削除</button>
```

悪意のあるユーザーは`<input type="text" wire:model="postId">`をページへ注入し、削除前に`$postId`を変更できます。`delete`アクションが値を認可していないため、所有していない投稿も削除できてしまいます。

このリスクを防ぐ方法は、モデルをプロパティとして保持する、プロパティをロックする、アクション内でプロパティを認可する、の3つです。

```html
<input type="text" wire:model="postId">
```

### モデルプロパティを使う

Livewireはモデルを通常の文字列・整数と異なる方法で扱います。投稿全体をプロパティに保存するとIDの改ざんを防ぎます。

```php
<?php
use App\Models\Post;
use Livewire\Component;
class ShowPost extends Component
{
    public Post $post;
    public function mount($postId) { $this->post = Post::find($postId); }
    public function delete() { $this->post->delete(); }
}
```

```html
<button wire:click="delete">投稿を削除</button>
```

### プロパティをロックする

別の方法は[`#[Locked]`属性](/attribute-locked)です。ロックした値を改ざんするとエラーが発生します。バックエンドからは変更できるため、信頼できない入力を渡さないよう注意してください。

```php
<?php
use App\Models\Post;
use Livewire\Component;
use Livewire\Attributes\Locked;
class ShowPost extends Component
{
    #[Locked] // [tl! highlight]
    public $postId;
    public function mount($postId) { $this->postId = $postId; }
    public function delete()
    {
        $post = Post::find($this->postId);
        $post->delete();
    }
}
```

### プロパティを認可する

モデルプロパティを使わない場合は、`delete`アクション内で手動認可します。

```php
<?php
use App\Models\Post;
use Livewire\Component;
class ShowPost extends Component
{
    public $postId;
    public function mount($postId) { $this->postId = $postId; }
    public function delete()
    {
        $post = Post::find($this->postId);
        $this->authorize('delete', $post); // [tl! highlight]
        $post->delete();
    }
}
```

```html
<button wire:click="delete">投稿を削除</button>
```

値が改ざんされても、所有者でなければ`$this->authorize()`が`AuthorizationException`を投げます。つまり、ユーザーが`$postId`を自由に変更できる点は変わりませんが、削除処理を認可なしで実行できない点が重要です。

詳しくは次を参照してください。

* [Laravel Gates](https://laravel.com/docs/authorization#gates)
* [Laravel Policies](https://laravel.com/docs/authorization#creating-policies)

## Middleware

認可Middleware（[Authorization Middleware](https://laravel.com/docs/authorization#via-middleware)）を持つルートからコンポーネントを読み込むと、Livewireは以後のネットワークリクエストにもMiddlewareを再適用します。これは「Persistent Middleware」と呼ばれます。

```php
Route::livewire('/post/{post}', App\Livewire\UpdatePost::class)
    ->middleware('can:update,post'); // [tl! highlight]
```

初回読み込み後に権限が失われても、元のエンドポイントの認可ルールが再適用されるため更新は保護されます。

たとえば、次の順序で権限が変わる場合を考えます。

* ユーザーがページを読み込む
* ページの読み込み後に更新権限を失う
* 権限を失った後に投稿の更新を試みる

ページの読み込みはすでに成功しているため、後続のLivewireリクエストでも`can:update,post`が再適用されるのか、認可されていないユーザーが更新できるのかが問題になります。Livewireは元のエンドポイントに設定されたMiddlewareを再適用するため、この場合も更新は保護されます。

```php
Route::livewire('/post/{post}', App\Livewire\UpdatePost::class)
    ->middleware('can:update,post'); // [tl! highlight]
```

```php
<?php
use App\Models\Post;
use Livewire\Component;
use Livewire\Attributes\Validate;
class UpdatePost extends Component
{
    public Post $post;
    #[Validate('required|min:5')]
    public $title = '';
    public $content = '';
    public function mount()
    {
        $this->title = $this->post->title;
        $this->content = $this->post->content;
    }
    public function update()
    {
        $this->post->update(['title' => $this->title, 'content' => $this->content]);
    }
}
```

### Persistent Middlewareを設定する

デフォルトで次のMiddlewareがリクエスト間に保持されます。

```php
\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
\Laravel\Jetstream\Http\Middleware\AuthenticateSession::class,
\Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
\Illuminate\Routing\Middleware\SubstituteBindings::class,
\App\Http\Middleware\RedirectIfAuthenticated::class,
\Illuminate\Auth\Middleware\Authenticate::class,
\Illuminate\Auth\Middleware\Authorize::class,
```

初回ページに適用されたMiddlewareは以後のリクエストにも再適用されます。独自Middlewareを追加するには[Service Provider](https://laravel.com/docs/providers#main-content)で登録します。

```php
<?php
namespace App\Providers;
use Illuminate\Support\ServiceProvider;
use Livewire;
class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Livewire::addPersistentMiddleware([ // [tl! highlight:2]
            App\Http\Middleware\EnsureUserHasRole::class,
        ]);
    }
}
```

> [!warning] Middleware引数には対応していない
> Persistent Middleware定義ではMiddleware引数を使えません。
>
> ```php
> // 不可
> Livewire::addPersistentMiddleware(AuthorizeResource::class.':admin');
> // 可
> Livewire::addPersistentMiddleware(AuthorizeResource::class);
> ```

### グローバルLivewire Middlewareを適用する

すべてのLivewire更新リクエストへMiddlewareを適用するには、独自の更新ルートを登録します。

```php
Livewire::setUpdateRoute(function ($handle, $path) {
    return Route::post($path, $handle)
        ->middleware(App\Http\Middleware\LocalizeViewPaths::class);
});
```

LivewireのAJAX/fetchリクエストはこのエンドポイントを使い、更新処理の前にMiddlewareを適用します。詳しくは[Installationの更新エンドポイント設定](https://livewire.laravel.com/docs/installation#configuring-livewires-update-endpoint)を参照してください。

## スナップショットのチェックサム

各リクエスト間でLivewireコンポーネントのスナップショットを作り、ブラウザへ送り、次の往復で再構築します。[Hydrationのドキュメントでスナップショットを詳しく見る](https://livewire.laravel.com/docs/hydration#the-snapshot)。

ブラウザではfetchリクエストを改ざんできるため、Livewireはスナップショットのチェックサムを生成します。次のリクエストで変更されていないことを検証し、不一致なら`CorruptComponentPayloadException`を投げて失敗させます。これにより、悪意ある改ざんによる不正なコード実行や変更を防ぎます。

Laravelのページネーション機能を使うと、データの一部をクエリし、ユーザーが結果の_ページ_間を移動できるようになります。

Laravelのページネーターは静的なアプリケーション向けに設計されているため、Livewireを使わないアプリケーションでは、ページ移動のたびに目的のページ（`?page=2`）を含む新しいURLへブラウザ全体を移動します。

しかしLivewireコンポーネント内でページネーションを使うと、ユーザーは同じページに留まったままページ間を移動できます。現在のページでURLのクエリ文字列を更新することも含め、Livewireが内部ですべて処理します。

## 基本的な使い方

以下は、`show-posts` コンポーネントで一度に10件の投稿だけを表示する、最も基本的な例です。

> [!warning] `WithPagination` traitを使う必要がある
> Livewireのページネーション機能を利用するには、ページネーションを含むすべてのコンポーネントで `Livewire\WithPagination` traitを使う必要があります。

```php
<?php // resources/views/components/⚡show-posts.blade.php

use Livewire\Attributes\Computed;
use Livewire\WithPagination;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    use WithPagination;

    #[Computed]
    public function posts()
    {
        return Post::paginate(10);
    }
};
```

```blade
<div>
    <div>
        @foreach ($this->posts as $post)
            <!-- ... -->
        @endforeach
    </div>

    {{ $this->posts->links() }}
</div>
```

`Post::paginate()` メソッドで表示件数を制限するだけでなく、`$this->posts->links()` でページ移動リンクもレンダリングします。

Laravelのページネーションについて詳しくは、[Laravelのページネーションドキュメント](https://laravel.com/docs/pagination)を参照してください。

## URLクエリ文字列の追跡を無効にする

デフォルトでは、Livewireのページネーターは現在のページをブラウザURLのクエリ文字列（`?page=2`）で追跡します。

Livewireのページネーションユーティリティを使いながらクエリ文字列の追跡を無効にするには、`WithoutUrlPagination` traitを使います。

```php
use Livewire\WithoutUrlPagination;
use Livewire\WithPagination;
use Livewire\Component;

class ShowPosts extends Component
{
    use WithPagination, WithoutUrlPagination; // [tl! highlight]

    // ...
}
```

これでページネーションは期待どおり動作しますが、現在のページはクエリ文字列に表示されません。そのため、ページを移動しても現在のページは保持されません。

## スクロール動作をカスタマイズする

デフォルトでは、Livewireのページネーターはページを変更するたびにページ上部へスクロールします。

`links()` メソッドの `scrollTo` パラメータへ `false` を渡すと、この動作を無効にできます。

```blade
{{ $posts->links(data: ['scrollTo' => false]) }}
```

または、`scrollTo` パラメータへ任意のCSSセレクターを渡すこともできます。Livewireはセレクターに一致する最も近い要素を見つけ、ページ移動ごとにそこへスクロールします。

```blade
{{ $posts->links(data: ['scrollTo' => '#paginated-posts']) }}
```

## ページをリセットする

結果を並べ替えたり絞り込んだりするとき、ページ番号を `1` に戻したい場合がよくあります。

Livewireには `$this->resetPage()` メソッドがあり、コンポーネント内のどこからでもページ番号をリセットできます。

以下のコンポーネントは、検索フォームの送信後にページをリセットする例です。

```php
<?php // resources/views/components/⚡search-posts.blade.php

use Livewire\Attributes\Computed;
use Livewire\WithPagination;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    use WithPagination;

    public $query = '';

    public function search()
    {
        $this->resetPage();
    }

    #[Computed]
    public function posts()
    {
        return Post::where('title', 'like', '%'.$this->query.'%')->paginate(10);
    }
};
```

```blade
<div>
    <form wire:submit="search">
        <input type="text" wire:model="query">

        <button type="submit">投稿を検索</button>
    </form>

    <div>
        @foreach ($this->posts as $post)
            <!-- ... -->
        @endforeach
    </div>

    {{ $this->posts->links() }}
</div>
```

結果の5ページ目にいたユーザーが「投稿を検索」を押してさらに絞り込んだ場合、ページは1にリセットされます。

### 利用できるページ移動メソッド

`$this->resetPage()` に加えて、コンポーネントからプログラムでページ間を移動するための便利なメソッドがあります。

| メソッド | 説明 |
| --- | --- |
| `$this->setPage($page)` | ページネーターを指定したページ番号に設定する |
| `$this->resetPage()` | ページを1に戻す |
| `$this->nextPage()` | 次のページへ移動する |
| `$this->previousPage()` | 前のページへ移動する |

## 複数のページネーター

LaravelとLivewireはどちらもURLのクエリ文字列パラメータで現在のページ番号を保存・追跡するため、一つのページに複数のページネーターがある場合は、それぞれに異なる名前を付けることが重要です。

問題を明確にするため、次の `show-clients` コンポーネントを考えてみましょう。

```php
<?php // resources/views/components/⚡show-clients.blade.php

use Livewire\Attributes\Computed;
use Livewire\WithPagination;
use Livewire\Component;
use App\Models\Client;

new class extends Component {
    use WithPagination;

    #[Computed]
    public function clients()
    {
        return Client::paginate(10);
    }
};
```

このコンポーネントには、ページネーションされた_顧客_の集合があります。ユーザーが2ページ目へ移動すると、URLは次のようになります。

```
http://application.test/?page=2
```

同じページにページネーションを使う `show-invoices` コンポーネントもあるとします。それぞれのページネーターの現在ページを独立して追跡するには、2つ目のページネーターに次のような名前を指定します。

```php
<?php // resources/views/components/⚡show-invoices.blade.php

use Livewire\Attributes\Computed;
use Livewire\WithPagination;
use Livewire\Component;
use App\Models\Invoice;

new class extends Component {
    use WithPagination;

    #[Computed]
    public function invoices()
    {
        return Invoice::paginate(10, pageName: 'invoices-page');
    }
};
```

`paginate` メソッドへ `pageName` パラメータを追加したため、ユーザーが請求書の2ページ目へ移動すると、URLには次のように表示されます。

```
https://application.test/customers?page=2&invoices-page=2
```

名前付きページネーターでLivewireのページ移動メソッドを使う場合は、追加のパラメータとしてページ名を渡す必要があります。

```php
$this->setPage(2, pageName: 'invoices-page');

$this->resetPage(pageName: 'invoices-page');

$this->nextPage(pageName: 'invoices-page');

$this->previousPage(pageName: 'invoices-page');
```

## ページ更新にフックする

コンポーネント内に次のメソッドを定義すると、ページ更新の前後にコードを実行できます。

```php
<?php // resources/views/components/⚡show-posts.blade.php

use Livewire\Attributes\Computed;
use Livewire\WithPagination;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    use WithPagination;

    public function updatingPage($page)
    {
        // このコンポーネントのページが更新される前に実行...
    }

    public function updatedPage($page)
    {
        // このコンポーネントのページが更新された後に実行...
    }

    #[Computed]
    public function posts()
    {
        return Post::paginate(10);
    }
};
```

### 名前付きページネーターのフック

前のフックはデフォルトのページネーターにだけ適用されます。名前付きページネーターを使う場合は、ページネーター名を使ってメソッドを定義する必要があります。

たとえば `invoices-page` という名前のページネーターのフックは次のようになります。

```php
public function updatingInvoicesPage($page)
{
    //
}
```

### 一般的なページネーターフック

フックメソッド名にページネーター名を含めたくない場合は、より汎用的なメソッドを使い、第2引数で `$pageName` を受け取れます。

```php
public function updatingPaginators($page, $pageName)
{
    // このコンポーネントのページが更新される前に実行...
}

public function updatedPaginators($page, $pageName)
{
    // このコンポーネントのページが更新された後に実行...
}
```

## Simpleテーマを使う

速度と単純さを高めるため、`paginate()` の代わりにLaravelの `simplePaginate()` メソッドを使えます。

このメソッドでページネーションすると、各ページ番号への個別リンクではなく、ユーザーには_次へ_と_前へ_のリンクだけが表示されます。

```php
public function render()
{
    return view('show-posts', [
        'posts' => Post::simplePaginate(10),
    ]);
}
```

Simpleページネーションの詳細は、[Laravelの「simplePaginator」ドキュメント](https://laravel.com/docs/pagination#simple-pagination)を参照してください。

## Cursorページネーションを使う

LivewireはLaravelのCursorページネーションもサポートしています。これは大規模なデータセットで役立つ、より高速なページネーション方式です。

```php
public function render()
{
    return view('show-posts', [
        'posts' => Post::cursorPaginate(10),
    ]);
}
```

`paginate()` や `simplePaginate()` の代わりに `cursorPaginate()` を使うと、アプリケーションURLのクエリ文字列には標準のページ番号ではなく、エンコードされた_カーソル_が保存されます。

```
https://example.com/posts?cursor=eyJpZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0
```

Cursorページネーションの詳細は、[LaravelのCursorページネーションドキュメント](https://laravel.com/docs/pagination#cursor-pagination)を参照してください。

## Tailwindの代わりにBootstrapを使う

アプリケーションのCSSフレームワークとして [Tailwind](https://tailwindcss.com/) ではなく [Bootstrap](https://getbootstrap.com/) を使っている場合、Livewireを設定してデフォルトのTailwindビューではなくBootstrap向けのページネーションビューを使えます。

アプリケーションの `config/livewire.php` で `pagination_theme` 設定値を変更します。

```php
'pagination_theme' => 'bootstrap',
```

> [!info] Livewireの設定ファイルをpublishする
> ページネーションテーマをカスタマイズする前に、次のコマンドを実行してLivewireの設定ファイルをアプリケーションの `/config` ディレクトリへpublishする必要があります。
> ```shell
> php artisan livewire:config
> ```

## デフォルトのページネーションビューを変更する

アプリケーションのスタイルに合わせてLivewireのページネーションビューを変更したい場合、次のコマンドでpublishできます。

```shell
php artisan livewire:publish --pagination
```

このコマンドを実行すると、次の4ファイルが `resources/views/vendor/livewire` ディレクトリへ挿入されます。

| ビューファイル名 | 説明 |
| --- | --- |
| `tailwind.blade.php` | 標準Tailwindページネーションテーマ |
| `tailwind-simple.blade.php` | _Simple_ Tailwindページネーションテーマ |
| `bootstrap.blade.php` | 標準Bootstrapページネーションテーマ |
| `bootstrap-simple.blade.php` | _Simple_ Bootstrapページネーションテーマ |

ファイルをpublishすると、完全に自由に変更できます。テンプレート内でページネーション結果の `->links()` メソッドを使ってリンクをレンダリングすると、Livewireは独自のビューではなくこれらのファイルを使います。

## カスタムページネーションビューを使う

Livewireのページネーションビューを完全に使わず、独自のビューをレンダリングする方法は2つあります。

1. Bladeビューの `->links()` メソッド
2. コンポーネントの `paginationView()` または `paginationSimpleView()` メソッド

### `->links()` を使う

最初の方法は、独自のページネーションBladeビュー名を `->links()` メソッドへ直接渡すことです。

```blade
{{ $posts->links('custom-pagination-links') }}
```

ページネーションリンクをレンダリングすると、Livewireは `resources/views/custom-pagination-links.blade.php` のビューを探します。

### `paginationView()` または `paginationSimpleView()` を使う

2つ目の方法は、コンポーネント内に `paginationView` または `paginationSimpleView` メソッドを宣言し、使いたいビュー名を返すことです。

```php
public function paginationView()
{
    return 'custom-pagination-links-view';
}

public function paginationSimpleView()
{
    return 'custom-simple-pagination-links-view';
}
```

### ページネーションビューのサンプル

参考として、スタイルを付けていないシンプルなLivewireページネーションビューの例です。

Livewireのページ移動ヘルパー `$this->nextPage()` などは、ボタンへ `wire:click="nextPage"` を追加すればテンプレート内から直接使えます。

```blade
<div>
    @if ($paginator->hasPages())
        <nav role="navigation" aria-label="ページネーションナビゲーション">
            <span>
                @if ($paginator->onFirstPage())
                    <span>前へ</span>
                @else
                    <button wire:click="previousPage" wire:loading.attr="disabled" rel="prev">前へ</button>
                @endif
            </span>

            <span>
                @if ($paginator->onLastPage())
                    <span>次へ</span>
                @else
                    <button wire:click="nextPage" wire:loading.attr="disabled" rel="next">次へ</button>
                @endif
            </span>
        </nav>
    @endif
</div>
```

見た目を変えずにローディング状態（不透明度の変更など）だけを表示する場合は、代わりにTailwindクラスとLivewire自動の `data-loading` 属性を使えます。

```blade
<button wire:click="nextPage" class="data-loading:opacity-50" rel="next">
    次へ
</button>
```

[ローディング状態について詳しく読む →](/loading-states)

## 関連項目

- **[URLクエリパラメータ](/url)** — ページネーション状態をURLと同期する
- **[ローディング状態](/loading-states)** — ページ変更中のフィードバックを表示する
- **[算出プロパティ](/computed-properties)** — ページネーションされたデータを効率的にクエリする

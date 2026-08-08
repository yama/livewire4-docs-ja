`#[Computed]`属性を使うと、リクエスト中にキャッシュされる派生プロパティを作成できます。高コストな処理へ何度もアクセスする場合にパフォーマンス上の利点があります。

## 基本的な使い方

メソッドに`#[Computed]`属性を適用すると、キャッシュされるプロパティになります。

```php
<?php // resources/views/components/user/⚡show.blade.php

use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\User;

new class extends Component {
    public $userId;

    #[Computed] // [tl! highlight]
    public function user()
    {
        return User::find($this->userId);
    }

    public function follow()
    {
        Auth::user()->follow($this->user);
    }
};
```

```blade
<div>
    <h1>{{ $this->user->name }}</h1>
    <span>{{ $this->user->email }}</span>

    <button wire:click="follow">フォロー</button>
</div>
```

`user()`メソッドは`$this->user`でプロパティのようにアクセスします。最初に呼び出されたとき結果がキャッシュされ、同じリクエストの残りの期間は再利用されます。

> [!info] テンプレートでは`$this`を使う必要がある
> 通常のプロパティと異なり、テンプレートのcomputedプロパティは`$this`を介してアクセスする必要があります。`$posts`ではなく`$this->posts`とします。

## パフォーマンス上の利点

Computedプロパティはリクエスト中、結果をキャッシュします。`$this->posts`へ何度もアクセスしても、元のメソッドは1回だけ実行されます。

```php
<?php // resources/views/components/post/⚡index.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;

new class extends Component {
    #[Computed] // [tl! highlight]
    public function posts()
    {
        return Auth::user()->posts; // データベースへのクエリは1回だけ
    }
};
```

これにより、パフォーマンスへの影響を気にせず派生値へ自由にアクセスできます。

## キャッシュを破棄する

リクエスト中に元データが変わった場合は、`unset()`でキャッシュを消去できます。

```php
<?php // resources/views/components/post/⚡index.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;

new class extends Component {
    #[Computed]
    public function posts()
    {
        return Auth::user()->posts;
    }

    public function createPost()
    {
        if ($this->posts->count() > 10) {
            throw new \Exception('投稿数の上限を超えました');
        }

        Auth::user()->posts()->create(...);

        unset($this->posts); // キャッシュを消去 [tl! highlight]
    }
};
```

新しい投稿を作成した後に`unset($this->posts)`を呼ぶとキャッシュが消去され、次回アクセス時に更新されたデータを取得します。

## リクエスト間でキャッシュする

デフォルトでは、Computedプロパティは1つのリクエスト内だけキャッシュします。複数リクエストにまたがってキャッシュするには、`persist`パラメータを使います。

```php
#[Computed(persist: true)] // [tl! highlight]
public function user()
{
    return User::find($this->userId);
}
```

値は3,600秒（1時間）キャッシュされます。期間は変更できます。

```php
#[Computed(persist: true, seconds: 7200)] // 2時間 [tl! highlight]
```

## すべてのコンポーネント間でキャッシュする

アプリケーション内のすべてのコンポーネントインスタンスでキャッシュ値を共有するには、`cache`パラメータを使います。

```php
use Livewire\Attributes\Computed;
use App\Models\Post;

#[Computed(cache: true)] // [tl! highlight]
public function posts()
{
    return Post::all();
}
```

カスタムキャッシュキーも指定できます。

```php
#[Computed(cache: true, key: 'homepage-posts')] // [tl! highlight]
```

## 使用する場面

Computedプロパティは、特に次の用途に便利です。

* **高コストなデータへ条件付きでアクセスする** — テンプレートで実際に使う場合だけデータベースへクエリする
* **インラインテンプレートを使う** — `render()`経由でデータを渡す機会がない
* **renderメソッドを省略する** — v4のシングルファイルコンポーネント規約に従う
* **同じ値へ何度もアクセスする** — 自動キャッシュで重複クエリを防ぐ

## 制限

> [!warning] Formオブジェクトには対応していない
> Computedプロパティは`Livewire\Form`オブジェクトでは使えません。`$form->property`でアクセスするとエラーになります。

## さらに詳しく

Computedプロパティ、キャッシュ戦略、高度な用途については、[Computed Propertiesのドキュメント](/computed-properties)を参照してください。

## リファレンス

```php
#[Computed(
    bool $persist = false,
    int $seconds = 3600,
    bool $cache = false,
    ?string $key = null,
    mixed $tags = null,
)]
```

| パラメータ | 型 | デフォルト | 説明 |
|-----------|------|---------|-------------|
| `$persist` | `bool` | `false` | 同じコンポーネントインスタンスのリクエスト間で値をキャッシュする |
| `$seconds` | `int` | `3600` | 値をキャッシュする秒数 |
| `$cache` | `bool` | `false` | すべてのコンポーネントインスタンス間で値をキャッシュする |
| `$key` | `?string` | `null` | カスタムキャッシュキー（未指定なら自動生成） |
| `$tags` | `mixed` | `null` | キャッシュタグ（タグに対応するキャッシュドライバーが必要） |

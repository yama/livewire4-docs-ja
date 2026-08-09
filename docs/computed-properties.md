算出プロパティは、Livewireで「派生」プロパティを作る方法です。Eloquentモデルのアクセサーと同じように、算出プロパティを使うと値へアクセスでき、リクエスト中の次回以降のアクセスに備えてメモ化できます。

算出プロパティは、コンポーネントのpublicプロパティと組み合わせると特に便利です。

## 基本的な使い方

Livewireコンポーネントの任意のメソッドの上に `#[Computed]` 属性を追加すると、算出プロパティを作成できます。メソッドに属性を追加すると、通常のプロパティと同じようにアクセスできます。

> [!warning] 属性クラスをインポートする
> 属性クラスを必ずインポートしてください。たとえば、以下の `#[Computed]` 属性には `use Livewire\Attributes\Computed;` のインポートが必要です。

`$userId` プロパティをもとに `User` Eloquentモデルへアクセスする `user()` という算出プロパティを使った `show-user` コンポーネントの例です。

```php
<?php // resources/views/components/⚡show-user.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\User;

new class extends Component {
    public $userId;

    #[Computed]
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

`user()` メソッドに `#[Computed]` 属性を追加したため、値はコンポーネント内の他のメソッドとBladeテンプレートから利用できます。

> [!info] テンプレートでは `$this` を使う必要がある
> 通常のプロパティとは異なり、算出プロパティはコンポーネントのテンプレートから直接利用できません。代わりに `$this` オブジェクトからアクセスします。たとえば `posts()` という算出プロパティは、テンプレート内で `$this->posts` としてアクセスする必要があります。

> [!warning] 算出プロパティは `Livewire\Form` オブジェクトに対応していない
> [フォーム](https://livewire.laravel.com/docs/forms)内で算出プロパティを使うと、Bladeで `$form->property` 構文によりプロパティへアクセスしたときにエラーになります。

## パフォーマンス上の利点

なぜ算出プロパティを使うのか、メソッドを直接呼び出せばよいのではないかと疑問に思うかもしれません。

メソッドを算出プロパティとして使うと、メソッドを呼び出すよりパフォーマンス上の利点があります。内部では、算出プロパティが最初に実行されたとき、返された値をLivewireがメモ化します。そのためリクエスト中の次回以降のアクセスでは、何度も実行せずにメモ化された値を返します。

これにより、派生値へ自由にアクセスしながら、パフォーマンスへの影響を心配せずに済みます。

> [!warning] 算出プロパティのメモ化は1リクエスト内だけ
> Livewireコンポーネントがページ上に存在する全期間、算出プロパティがメモ化されるという誤解があります。しかし実際には、Livewireは1回のコンポーネントリクエストの間だけ結果をメモ化し、リクエストをまたいでは保持しません。したがって、算出プロパティのメソッドに高コストなデータベースクエリがある場合、コンポーネントが更新されるたびに実行されます。

### メモを消去する

次のような問題のある状況を考えてみましょう。

1. 特定のプロパティやデータベースの状態に依存する算出プロパティへアクセスする
2. その元のプロパティやデータベースの状態が変わる
3. プロパティのメモ化された値が古くなり、再計算が必要になる

保存されたメモを消去、つまり「破棄」するには、PHPの `unset()` 関数を使います。

以下は、アプリケーションで新しい投稿を作成する `createPost()` アクションの例です。これにより `posts()` の算出結果が古くなり、新しく追加された投稿を含めるため再計算が必要になります。

```php
<?php // resources/views/components/⚡show-posts.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;

new class extends Component {
    public function createPost()
    {
        if ($this->posts->count() > 10) {
            throw new \Exception('投稿数の上限を超えました');
        }

        Auth::user()->posts()->create(...);

        unset($this->posts); // [tl! highlight]
    }

    #[Computed]
    public function posts()
    {
        return Auth::user()->posts;
    }

    // ...
};
```

上のコンポーネントでは、新しい投稿を作成する前に `createPost()` が `$this->posts` へアクセスするため、算出プロパティがメモ化されます。ビューで `$this->posts` に最新の内容を含めるには、`unset($this->posts)` でメモを消去します。

### リクエスト間でキャッシュする

> [!tip] メモ化とキャッシュの違い
> ここまで説明したメモ化は1回のリクエストだけ有効です。複数のリクエストにまたがって値を保持する必要がある場合は、実際のLaravelキャッシュを使う必要があります。

Livewireコンポーネントの寿命中、毎回のリクエスト後に消去されるのではなく、算出プロパティの値をキャッシュしたい場合があります。その場合は[Laravelのキャッシュユーティリティ](https://laravel.com/docs/cache#retrieve-store)を使えます。

以下は `user()` 算出プロパティの例です。Eloquentクエリを直接実行する代わりに `Cache::remember()` で包み、次回以降のリクエストではクエリを再実行せずLaravelのキャッシュから取得します。

```php
<?php // resources/views/components/⚡show-user.blade.php

use Illuminate\Support\Facades\Cache;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\User;

new class extends Component {
    public $userId;

    #[Computed]
    public function user()
    {
        $key = 'user'.$this->getId();
        $seconds = 3600; // 1時間...

        return Cache::remember($key, $seconds, function () {
            return User::find($this->userId);
        });
    }

    // ...
};
```

Livewireコンポーネントの各インスタンスには固有のIDがあるため、`$this->getId()` で、この同じコンポーネントインスタンスへの将来のリクエストだけに適用される一意なキャッシュキーを生成できます。

ただし、このコードの大部分は定型的で、簡単に抽象化できることに気づくかもしれません。そこで `#[Computed]` 属性には便利な `persist` パラメータがあります。メソッドに `#[Computed(persist: true)]` を適用すると、追加のコードなしで同じ結果を得られます。

```php
use Livewire\Attributes\Computed;
use App\Models\User;

#[Computed(persist: true)]
public function user()
{
    return User::find($this->userId);
}
```

上の例では、コンポーネントから `$this->user` にアクセスすると、ページ上のLivewireコンポーネントの寿命中キャッシュされ続けます。実際のEloquentクエリは1回だけ実行されます。

Livewireは永続化した値を3600秒（1時間）キャッシュします。`#[Computed]` 属性に追加の `seconds` パラメータを渡して、このデフォルトを上書きできます。

```php
#[Computed(persist: true, seconds: 7200)]
```

> [!tip] `unset()` はメモとキャッシュの両方を消去する
> 前述のとおり、PHPの `unset()` メソッドで算出プロパティのメモを消去できます。これは `persist: true` パラメータを使う算出プロパティにも適用されます。永続化した算出プロパティに対して `unset()` を呼び出すと、リクエスト内のメモだけでなく、Laravelのキャッシュにある基礎のキャッシュ値も消去されます。

## すべてのコンポーネント間でキャッシュする

一つのコンポーネントのライフサイクル中だけでなく、`#[Computed]` 属性の `cache: true` パラメータを使って、アプリケーション内のすべてのコンポーネント間で算出プロパティの値をキャッシュできます。

```php
use Livewire\Attributes\Computed;
use App\Models\Post;

#[Computed(cache: true)]
public function posts()
{
    return Post::all();
}
```

キャッシュの期限が切れるか破棄されるまで、アプリケーション内のこのコンポーネントのすべてのインスタンスが `$this->posts` の同じキャッシュ値を共有します。

算出プロパティのキャッシュを手動で消去したい場合は、`key` パラメータで独自のキャッシュキーを指定します。

```php
use Livewire\Attributes\Computed;
use App\Models\Post;

#[Computed(cache: true, key: 'homepage-posts')]
public function posts()
{
    return Post::all();
}
```

## 算出プロパティを使う場面

パフォーマンス上の利点に加えて、算出プロパティが役立つ場面はほかにもあります。

コンポーネントのBladeテンプレートへデータを渡すとき、算出プロパティがよりよい選択肢になる場合があります。以下は、単純なコンポーネントの `render()` メソッドから `posts` コレクションをBladeテンプレートへ渡す例です。

```php
public function render()
{
    return view('livewire.show-posts', [
        'posts' => Post::all(),
    ]);
}
```

```blade
<div>
    @foreach ($posts as $post)
        <div wire:key="{{ $post->id }}">
            <!-- ... -->
        </div>
    @endforeach
</div>
```

これは多くの用途に十分ですが、算出プロパティがよりよい選択肢になる場面が3つあります。

### 条件付きで値へアクセスする

Bladeテンプレートで、取得に高い計算コストがかかる値へ条件付きでアクセスする場合、算出プロパティでパフォーマンスのオーバーヘッドを減らせます。

算出プロパティを使わないテンプレートを考えてみましょう。

```blade
<div>
    @if (Auth::user()->can_see_posts)
        @foreach ($posts as $post)
            <div wire:key="{{ $post->id }}">
                <!-- ... -->
            </div>
        @endforeach
    @endif
</div>
```

ユーザーが投稿を見る権限を制限されている場合、投稿を取得するデータベースクエリはすでに実行されていますが、テンプレートでは投稿が使われません。

次は、算出プロパティを使った例です。

```php
use Livewire\Attributes\Computed;
use App\Models\Post;

#[Computed]
public function posts()
{
    return Post::all();
}

public function render()
{
    return view('livewire.show-posts');
}
```

```blade
<div>
    @if (Auth::user()->can_see_posts)
        @foreach ($this->posts as $post)
            <div wire:key="{{ $post->id }}">
                <!-- ... -->
            </div>
        @endforeach
    @endif
</div>
```

このように算出プロパティでテンプレートへ投稿を提供すると、データが必要なときだけデータベースクエリが実行されます。

### インラインテンプレートを使う

算出プロパティが便利な別の場面は、コンポーネントで[インラインテンプレート](/components#inline-components)を使う場合です。

以下はインラインコンポーネントの例です。`render()` の中でテンプレート文字列を直接返すため、ビューへデータを渡す機会がありません。

```php
<?php // resources/views/components/⚡show-posts.blade.php

use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Computed]
    public function posts()
    {
        return Post::all();
    }

    public function render()
    {
        return <<<HTML
        <div>
            @foreach ($this->posts as $post)
                <div wire:key="{{ $post->id }}">
                    <!-- ... -->
                </div>
            @endforeach
        </div>
        HTML;
    }
};
```

上の例では、算出プロパティがなければBladeテンプレートへ明示的にデータを渡す方法がありません。

### renderメソッドを省略する

Livewireでは、コンポーネントの定型コードを減らすため、`render()` メソッドを完全に省略することもできます。省略すると、Livewireは規約に従って対応するBladeビューを返す独自の `render()` メソッドを使います。

この場合、当然ですがBladeビューへデータを渡す `render()` メソッドはありません。

`render()` メソッドを再導入する代わりに、算出プロパティを通じてビューへデータを提供できます。

```php
<?php // resources/views/components/⚡show-posts.blade.php

use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Computed]
    public function posts()
    {
        return Post::all();
    }
};
```

```blade
<div>
    @foreach ($this->posts as $post)
        <div wire:key="{{ $post->id }}">
            <!-- ... -->
        </div>
    @endforeach
</div>
```

## 別の方法: Sessionプロパティ

クロスリクエストのキャッシュを使わず、ページ更新後も単純な値を保持したい場合は、算出プロパティの代わりに[`#[Session]` 属性](/attribute-session)を検討してください。

Sessionプロパティは、次のような場合に便利です。

* 検索フィルターやUI設定など、ユーザーごとの値をページ再読み込み後も保持したい
* URLを通じて値を共有する必要がない
* 値が単純で、保存に大きな計算コストがかからない

たとえば、検索クエリをセッションに保存します。

```php
use Livewire\Attributes\Session;

#[Session]
public $search = '';
```

URLパラメータや算出プロパティのキャッシュを使わず、ページ更新後も検索値を保持できます。

[Sessionプロパティについて詳しく読む →](/attribute-session)

## 関連項目

- **[プロパティ](/properties)** — 基本的なプロパティ管理を理解する
- **[Island](/islands)** — 遅延された算出値でパフォーマンスを最適化する
- **[Computed属性](/attribute-computed)** — メモ化に `#[Computed]` を使う
- **[コンポーネント](/components)** — ビューで算出プロパティへアクセスする

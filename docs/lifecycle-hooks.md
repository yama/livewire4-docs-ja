# ライフサイクルフック

Livewireには、コンポーネントのライフサイクルの特定の時点でコードを実行できる、さまざまなライフサイクルフックがあります。コンポーネントの初期化、プロパティの更新、テンプレートの描画など、特定のイベントの前後に処理を実行できます。

利用できるコンポーネントライフサイクルフックは次のとおりです。

| フックメソッド | 説明 |
|---|---|
| `mount()` | コンポーネントが作成されたときに呼び出される |
| `hydrate()` | 後続リクエストの開始時に、コンポーネントが再ハイドレートされたときに呼び出される |
| `boot()` | 初回・後続を問わず、すべてのリクエストの開始時に呼び出される |
| `updating()` | コンポーネントのプロパティを更新する前に呼び出される |
| `updated()` | プロパティを更新した後に呼び出される |
| `rendering()` | コンポーネントのビューを描画する前に呼び出される |
| `rendered()` | コンポーネントのビューを描画した後に呼び出される |
| `dehydrate()` | すべてのコンポーネントリクエストの終了時に呼び出される |
| `exception($e, $stopPropagation)` | 例外がスローされたときに呼び出される |

## Mount

通常のPHPクラスでは、コンストラクタ（`__construct()`）が外部からパラメータを受け取り、オブジェクトの状態を初期化します。しかしLivewireでは、コンポーネントのパラメータ受け取りと状態の初期化に`mount()`メソッドを使います。

Livewireコンポーネントでは`__construct()`を使いません。後続のネットワークリクエストでコンポーネントが再構築されるため、初回作成時に一度だけ初期化する必要があるからです。

`profile.edit`コンポーネントの`name`と`email`プロパティを初期化する例です。

```php
<?php // resources/views/components/profile/⚡edit.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Component;

new class extends Component {
    public $name;

    public $email;

    public function mount()
    {
        $this->name = Auth::user()->name;

        $this->email = Auth::user()->email;
    }

    // ...
};
```

`mount()`メソッドは、コンポーネントに渡されたデータをメソッドパラメータとして受け取ります。

```php
<?php // resources/views/components/post/⚡edit.blade.php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public $title;

    public $content;

    public function mount(Post $post)
    {
        $this->title = $post->title;

        $this->content = $post->content;
    }

    // ...
};
```

> [!tip] すべてのフックメソッドで依存性注入を使える
> Livewireでは、ライフサイクルフックのメソッドパラメータに型を指定すると、[Laravelのサービスコンテナ](https://laravel.com/docs/container#automatic-injection)から依存関係を解決できます。

`mount()`はLivewireを使ううえで重要なメソッドです。一般的な使い方については次を参照してください。

* [プロパティの初期化](/properties#プロパティを初期化する)
* [親コンポーネントからデータを受け取る](/nesting#子コンポーネントにpropsを渡す)
* [ルートパラメータにアクセスする](/pages#ルートパラメータにアクセスする)

## Boot

`mount()`はコンポーネントのライフサイクルで一度しか実行されません。コンポーネントのサーバーリクエストごとに、開始時の処理を実行したい場合があります。

その場合は`boot()`メソッドを使います。コンポーネントクラスが起動するたび、つまり初期化時と後続リクエストの両方で実行するセットアップ処理を記述できます。

例えば、リクエスト間で保持されないprotectedプロパティをEloquentモデルとして初期化できます。

```php
<?php // resources/views/components/post/⚡show.blade.php

use Livewire\Attributes\Locked;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Locked]
    public $postId = 1;

    protected Post $post;

    public function boot() // [tl! highlight:3]
    {
        $this->post = Post::find($this->postId);
    }

    // ...
};
```

この方法を使うと、コンポーネントプロパティの初期化を完全に制御できます。

> [!tip] 多くの場合は算出プロパティを使えます
> 上記の方法は強力ですが、この用途には[Livewireの算出プロパティ](https://livewire.laravel.com/docs/4.x/computed-properties)を使う方が適していることがよくあります。

> [!warning] 機密性のあるpublicプロパティは必ずロックする
> 上の例では`$postId`に`#[Locked]`属性を使っています。クライアント側でユーザーが値を改ざんできないようにする場合は、利用前に値を認可するか、プロパティに`#[Locked]`を追加して変更できないようにしてください。
>
> 詳しくは[Locked属性のドキュメント](https://livewire.laravel.com/docs/4.x/attribute-locked)を参照してください。

## Update

クライアント側のユーザーは、`wire:model`を付けた入力欄の変更など、さまざまな方法でpublicプロパティを更新できます。

Livewireには、publicプロパティの更新を受け止める便利なフックがあります。値が設定される前にバリデーションや認可を行ったり、プロパティが決められた形式で設定されるようにしたりできます。

次の例では、`updating()`を使って`$postId`プロパティの変更を防ぎます。

なお、この例のような実際のアプリケーションでは、上の例と同じように[`#[Locked]`属性](https://livewire.laravel.com/docs/4.x/attribute-locked)を使うべきです。

```php
<?php // resources/views/components/post/⚡show.blade.php

use Exception;
use Livewire\Component;

new class extends Component {
    public $postId = 1;

    public function updating($property, $value)
    {
        // $property: 更新中のプロパティ名
        // $value: プロパティに設定される値

        if ($property === 'postId') {
            throw new Exception;
        }
    }

    // ...
};
```

上の`updating()`メソッドはプロパティが更新される前に実行されるため、無効な入力を検出してプロパティの更新を防げます。以下は、`updated()`を使ってプロパティの値が一貫するようにする例です。

```php
<?php // resources/views/components/user/⚡create.blade.php

use Livewire\Component;

new class extends Component {
    public $username = '';

    public $email = '';

    public function updated($property)
    {
        // $property: 更新されたプロパティ名

        if ($property === 'username') {
            $this->username = strtolower($this->username);
        }
    }

    // ...
};
```

これでクライアント側で`$username`プロパティが更新されるたびに、値が常に小文字になります。

更新フックでは特定のプロパティを対象にすることが多いため、Livewireではメソッド名の一部としてプロパティ名を直接指定できます。先ほどの例を書き換えると次のようになります。

```php
<?php // resources/views/components/user/⚡create.blade.php

use Livewire\Component;

new class extends Component {
    public $username = '';

    public $email = '';

    public function updatedUsername()
    {
        $this->username = strtolower($this->username);
    }

    // ...
};
```

もちろん、`updating`フックにも同じ方法を適用できます。

### 配列

配列プロパティでは、変更された要素を指定するため、これらのメソッドに追加の`$key`引数が渡されます。

特定のキーではなく配列自体が更新された場合、`$key`引数は`null`になる点に注意してください。

```php
<?php // resources/views/components/preferences/⚡edit.blade.php

use Livewire\Component;

new class extends Component {
    public $preferences = [];

    public function updatedPreferences($value, $key)
    {
        // $value = 'dark'
        // $key   = 'theme'
    }

    // ...
};
```

## HydrateとDehydrate

HydrateとDehydrateは、あまり知られておらず、使われる機会も多くないフックです。ただし、特定のシナリオでは強力な機能になります。

「dehydrate」と「hydrate」という用語は、Livewireコンポーネントをクライアント側向けのJSONにシリアライズし、次のリクエストでPHPオブジェクトに戻す処理を指します。

Livewireのコードベースとドキュメントでは、この処理を指すために「hydrate」と「dehydrate」という用語をよく使います。これらの用語をより明確に理解したい場合は、[Hydrationのドキュメント](https://livewire.laravel.com/docs/4.x/hydration)を参照してください。

Eloquentモデルの代わりにカスタムの[データ転送オブジェクト（DTO）](https://en.wikipedia.org/wiki/Data_transfer_object)を使ってコンポーネントに投稿データを保存するため、`mount()`、`hydrate()`、`dehydrate()`をすべて一緒に使う例を見てみましょう。

```php
<?php // resources/views/components/post/⚡show.blade.php

use Livewire\Component;

new class extends Component {
    public $post;

    public function mount($title, $content)
    {
        // 最初の初回リクエストの開始時に実行...

        $this->post = new PostDto([
            'title' => $title,
            'content' => $content,
        ]);
    }

    public function hydrate()
    {
        // すべての「後続」リクエストの開始時に実行...
        // 初回リクエストでは実行されず、「mount」が実行される...

        $this->post = new PostDto($this->post);
    }

    public function dehydrate()
    {
        // すべてのリクエストの終了時に実行...

        $this->post = $this->post->toArray();
    }

    // ...
};
```

これで、コンポーネント内のアクションやその他の場所から、プリミティブなデータではなく`PostDto`オブジェクトにアクセスできます。

上の例は主に、`hydrate()`と`dehydrate()`フックの能力と性質を示すものです。ただし、実際には代わりに[WireableまたはSynthesizer](/properties#カスタム型をサポートする)を使うことが推奨されます。

## Render

コンポーネントのBladeビューを描画する処理にフックしたい場合は、`rendering()`と`rendered()`フックを使います。

```php
<?php // resources/views/components/post/⚡index.blade.php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public function render()
    {
        return $this->view([
            'post' => Post::all(),
        ]);
    }

    public function rendering($view, $data)
    {
        // 渡されたビューが描画される前に実行...
        //
        // $view: これから描画されるビュー
        // $data: ビューに渡されるデータ
    }

    public function rendered($view, $html)
    {
        // 渡されたビューが描画された後に実行...
        //
        // $view: 描画されたビュー
        // $html: 最終的に描画されたHTML
    }

    // ...
};
```

## Exception

エラーを受け止めて捕捉すると、エラーメッセージをカスタマイズしたり、特定の種類の例外を無視したりできる場合があります。`exception()`フックを使うと、まさにそれができます。`$error`を確認し、`$stopPropagation`パラメータを使って問題を捕捉できます。

また、コードの実行を止めて早期リターンする強力なパターンも利用できます。`validate()`などの内部メソッドはこの仕組みで動作しています。

```php
<?php // resources/views/components/post/⚡show.blade.php

use Livewire\Component;

new class extends Component {
    public function mount() // [tl! highlight:3]
    {
        $this->post = Post::find($this->postId);
    }

    public function exception($e, $stopPropagation) {
        if ($e instanceof NotFoundException) {
            $this->notify('投稿が見つかりません');
            $stopPropagation();
        }
    }

    // ...
};
```

## Trait内でフックを使う

Traitはコンポーネント間でコードを再利用したり、1つのコンポーネントからコードを専用ファイルへ取り出したりするのに便利です。

複数のTraitがライフサイクルフックのメソッドを宣言するときに互いに衝突しないよう、Livewireでは、現在のTraitを宣言するTrait名を_camelCase_にした名前をフックメソッドの先頭に付けられます。

こうすることで、複数のTraitで同じライフサイクルフックを使っても、メソッド定義が衝突しません。

以下は、`HasPostForm`というTraitを参照するコンポーネントの例です。

```php
<?php // resources/views/components/post/⚡create.blade.php

use Livewire\Component;

new class extends Component {
    use HasPostForm;

    // ...
};
```

次は、利用できるすべてのプレフィックス付きフックを含む、実際の`HasPostForm` Traitです。

```php
trait HasPostForm
{
    public $title = '';

    public $content = '';

    public function mountHasPostForm()
    {
        // ...
    }

    public function hydrateHasPostForm()
    {
        // ...
    }

    public function bootHasPostForm()
    {
        // ...
    }

    public function updatingHasPostForm()
    {
        // ...
    }

    public function updatedHasPostForm()
    {
        // ...
    }

    public function renderingHasPostForm()
    {
        // ...
    }

    public function renderedHasPostForm()
    {
        // ...
    }

    public function dehydrateHasPostForm()
    {
        // ...
    }

    // ...
}
```

## Form Object内でフックを使う

LivewireのForm Objectはプロパティ更新フックをサポートします。フォームオブジェクト内のプロパティが変化したときに処理を実行でき、[コンポーネントの更新フック](#update)と同じように動作します。

以下は、`PostForm`フォームオブジェクトを使うコンポーネントの例です。

```php
<?php // resources/views/components/post/⚡create.blade.php

use Livewire\Component;

new class extends Component {
    public PostForm $form;

    // ...
};
```

次は、利用できるすべてのフックを含む`PostForm`フォームオブジェクトです。

```php
namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use Livewire\Form;

class PostForm extends Form
{
    public $title = '';

    public $tags = [];

    public function updating($property, $value)
    {
        // ...
    }

    public function updated($property, $value)
    {
        // ...
    }

    public function updatingTitle($value)
    {
        // ...
    }

    public function updatedTitle($value)
    {
        // ...
    }

    public function updatingTags($value, $key)
    {
        // ...
    }

    public function updatedTags($value, $key)
    {
        // ...
    }

    // ...
}
```

## 関連項目

- **[プロパティ](/properties)** — `mount()`と`boot()`でプロパティを初期化する
- **[コンポーネント](/components)** — コンポーネント作成時にフックが実行されるタイミングを理解する
- **[ページ](/pages)** — `mount()`でルートパラメータを受け取る
- **[Hydration](https://livewire.laravel.com/docs/4.x/hydration)** — `hydrate()`と`dehydrate()`フックを理解する

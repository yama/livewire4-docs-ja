# ライフサイクルフック

Livewireには、コンポーネントのライフサイクルの特定の時点でコードを実行できる、さまざまなライフサイクルフックがあります。コンポーネントの初期化、プロパティの更新、テンプレートの描画など、特定のイベントの前後に処理を実行できます。

利用できるコンポーネントライフサイクルフックは次のとおりです。

| フックメソッド | 説明 |
| --- | --- |
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

- [プロパティの初期化](/properties#プロパティを初期化する)
- [親コンポーネントからデータを受け取る](/nesting#子へpropsを渡す)
- [ルートパラメータにアクセスする](/pages#ルートパラメータにアクセスする)

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
> 上の例では`$postId`に`#[Locked]` Attributeを使っています。クライアント側でユーザーが値を改ざんできないようにする場合は、利用前に値を認可するか、プロパティに`#[Locked]`を追加して変更できないようにしてください。
>
> 詳しくは[Locked Attributeのドキュメント](https://livewire.laravel.com/docs/4.x/attribute-locked)を参照してください。

## Update

クライアント側のユーザーは、`wire:model`を付けた入力欄の変更など、さまざまな方法でpublicプロパティを更新できます。

Livewireには、publicプロパティの更新を受け止めるフックがあります。値が設定される前にバリデーションや認可を行ったり、決められた形式に整えたりできます。

次の例では、`updating()`を使って`$postId`プロパティの変更を防ぎます。実際のアプリケーションでは、この用途には上の例の`#[Locked]` Attributeを使うべきです。

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

`updating()`はプロパティが更新される前に実行されるため、無効な入力を検出して更新を防げます。`updated()`を使うと、プロパティの値が一貫するようにできます。

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

これでクライアント側で`$username`が更新されるたびに、値が常に小文字になります。

更新フックでは特定のプロパティを対象にすることが多いため、メソッド名にプロパティ名を直接指定することもできます。

```php
public function updatedUsername()
{
    $this->username = strtolower($this->username);
}
```

`updating`フックにも同じ方法を使えます。

### 配列

配列プロパティでは、変更された要素を示す追加の`$key`引数が渡されます。特定のキーではなく配列自体を更新した場合、`$key`は`null`です。

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

`hydrate`と`dehydrate`はあまり知られておらず、使われる機会も多くないフックです。ただし、特定のケースでは強力な機能になります。

`dehydrate`と`hydrate`は、Livewireコンポーネントをクライアント側向けのJSONにシリアライズし、次のリクエストでPHPオブジェクトに戻す処理を指します。詳しくは[Hydrationのドキュメント](https://livewire.laravel.com/docs/4.x/hydration)を参照してください。

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
        // 初回リクエストでは実行されず、mount()が実行される...
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

これで、コンポーネント内のアクションなどから、プリミティブなデータではなく`PostDto`オブジェクトにアクセスできます。ただし、この例は`hydrate()`と`dehydrate()`の性質を示すためのもので、実際には[WireableまたはSynthesizer](https://livewire.laravel.com/docs/4.x/properties#supporting-custom-types)を使うことが推奨されます。

## Render

コンポーネントのBladeビューを描画する処理にフックするには、`rendering()`と`rendered()`を使います。

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
        // ビューが描画される前に実行...
        // $view: 描画されるビュー
        // $data: ビューに渡されるデータ
    }

    public function rendered($view, $html)
    {
        // ビューが描画された後に実行...
        // $view: 描画されたビュー
        // $html: 最終的に描画されたHTML
    }

    // ...
};
```

## Exception

エラーを受け止めると、エラーメッセージをカスタマイズしたり、特定の例外を無視したりできる場合があります。`exception()`フックでは`$error`を確認し、`$stopPropagation`で処理を捕捉できます。コードの実行を止めて早期リターンする強力なパターンにも使われ、`validate()`などの内部メソッドもこの仕組みを利用しています。

```php
public function exception($e, $stopPropagation) {
    if ($e instanceof NotFoundException) {
        $this->notify('投稿が見つかりません');
        $stopPropagation();
    }
}
```

## Trait内でフックを使う

Traitはコンポーネント間でコードを再利用したり、処理を専用ファイルへ切り出したりするのに便利です。

複数のTraitが同じライフサイクルフックを宣言して衝突するのを避けるため、Livewireでは現在のTrait名をcamelCaseにした名前をフックメソッドへ付けられます。

```php
trait HasPostForm
{
    public $title = '';
    public $content = '';

    public function mountHasPostForm() {}
    public function hydrateHasPostForm() {}
    public function bootHasPostForm() {}
    public function updatingHasPostForm() {}
    public function updatedHasPostForm() {}
    public function renderingHasPostForm() {}
    public function renderedHasPostForm() {}
    public function dehydrateHasPostForm() {}
}
```

コンポーネント側では`use HasPostForm;`として利用します。

## Form Object内でフックを使う

LivewireのForm Objectはプロパティ更新フックをサポートします。フォームオブジェクトのプロパティが変わったときに処理を実行でき、[コンポーネントの更新フック](#update)と同じように動作します。

```php
namespace App\Livewire\Forms;

use Livewire\Form;

class PostForm extends Form
{
    public $title = '';
    public $tags = [];

    public function updating($property, $value) {}
    public function updated($property, $value) {}
    public function updatingTitle($value) {}
    public function updatedTitle($value) {}
    public function updatingTags($value, $key) {}
    public function updatedTags($value, $key) {}
}
```

## 関連項目

- **[プロパティ](/properties)** — `mount()`と`boot()`でプロパティを初期化する
- **[コンポーネント](/components)** — コンポーネント作成時にフックが実行されるタイミングを理解する
- **[ページ](/pages)** — `mount()`でルートパラメータを受け取る
- **[Hydration](https://livewire.laravel.com/docs/4.x/hydration)** — `hydrate()`と`dehydrate()`を理解する

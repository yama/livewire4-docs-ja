# プロパティ

プロパティはLivewireコンポーネント内の状態を保存・管理します。コンポーネントクラスのpublicプロパティとして定義し、サーバー側とクライアント側の両方からアクセス・変更できます。

## プロパティを初期化する

コンポーネントの`mount()`メソッド内でプロパティの初期値を設定できます。

次の例を考えてみましょう。

```php
<?php // resources/views/components/⚡todos.blade.php

use Livewire\Component;

new class extends Component {
    public $todos = [];

    public $todo = '';

    public function mount()
    {
        $this->todos = ['買い物をする', '犬を散歩させる', 'コードを書く']; // [tl! highlight]
    }

    // ...
};
```

この例では、空の`todos`配列を定義し、`mount()`メソッドでTodoの初期リストを設定しています。これでコンポーネントが初回に描画されると、これらのTodoがユーザーに表示されます。

## 一括代入

`mount()`メソッドで多くのプロパティを初期化すると、冗長に感じることがあります。Livewireには、`fill()`メソッドを使って複数のプロパティを一度に設定する便利な方法があります。プロパティ名とそれぞれの値を連想配列で渡すことで、複数のプロパティを同時に設定し、`mount()`内の繰り返しの行を減らせます。

例えば、次のようにします。

```php
<?php // resources/views/components/post/⚡edit.blade.php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public $post;

    public $title;

    public $description;

    public function mount(Post $post)
    {
        $this->post = $post;

        $this->fill( // [tl! highlight]
            $post->only('title', 'description'), // [tl! highlight]
        ); // [tl! highlight]
    }

    // ...
};
```

`$post->only(...)`は、渡した名前に基づいてモデルの属性と値を連想配列で返します。そのため、`$title`と`$description`プロパティには、各プロパティを個別に設定しなくても、データベースにある`$post`モデルの`title`と`description`が初期値として設定されます。

## データバインディング

Livewireは`wire:model` HTML属性による双方向データバインディングをサポートしています。これにより、コンポーネントのプロパティとHTML入力を簡単に同期し、ユーザーインターフェースとコンポーネントの状態を一致させられます。

`wire:model`ディレクティブを使って、`todos`コンポーネントの`$todo`プロパティを基本的な入力要素にバインドしてみましょう。

```php
<?php // resources/views/components/⚡todos.blade.php

use Livewire\Component;

new class extends Component {
    public $todos = [];

    public $todo = '';

    public function add()
    {
        $this->todos[] = $this->todo;

        $this->todo = '';
    }

    // ...
};
```

```blade
<div>
    <input type="text" wire:model="todo" placeholder="Todo..."> <!-- [tl! highlight] -->

    <button wire:click="add">Todoを追加</button>

    <ul>
        @foreach ($todos as $todo)
            <li wire:key="{{ $loop->index }}">{{ $todo }}</li>
        @endforeach
    </ul>
</div>
```

上の例では、「Todoを追加」ボタンをクリックすると、テキスト入力の値がサーバー上の`$todo`プロパティと同期します。

これは`wire:model`の概要にすぎません。データバインディングの詳しい情報は、[フォームのドキュメント](/forms)を確認してください。

## プロパティをリセットする

ユーザーがアクションを実行した後、プロパティを初期状態に戻したい場合があります。そのような場合、Livewireには1つ以上のプロパティ名を受け取り、値を初期状態に戻す`reset()`メソッドがあります。

下の例では、「Todoを追加」ボタンをクリックした後に`$this->reset()`を使って`todo`フィールドをリセットすることで、コードの重複を避けています。

```php
<?php // resources/views/components/⚡todos.blade.php

use Livewire\Component;

new class extends Component {
    public $todos = [];

    public $todo = '';

    public function addTodo()
    {
        $this->todos[] = $this->todo;

        $this->reset('todo'); // [tl! highlight]
    }

    // ...
};
```

上の例では、ユーザーが「Todoを追加」をクリックすると、追加したばかりのTodoを入力していたフィールドが空になり、新しいTodoを書けるようになります。

> [!warning] `mount()`で設定した値には`reset()`は機能しません
> `reset()`は、`mount()`メソッドが呼び出される前の状態にプロパティを戻します。`mount()`でプロパティを別の値に初期化した場合は、手動でプロパティをリセットする必要があります。

## プロパティを取り出す

別の方法として、`pull()`メソッドを使うと、1回の操作で値のリセットと取得を同時に行えます。

先ほどと同じ例を、`pull()`を使って簡略化すると次のようになります。

```php
<?php // resources/views/components/⚡todos.blade.php

use Livewire\Component;

new class extends Component {
    public $todos = [];

    public $todo = '';

    public function addTodo()
    {
        $this->todos[] = $this->pull('todo'); // [tl! highlight]
    }

    // ...
};
```

上の例では単一の値を取り出していますが、`pull()`を使ってすべて、または一部のプロパティをリセットし、（キーと値のペアとして）取得することもできます。

```php
// $this->all()と$this->reset()に相当
$this->pull();

// $this->only(...)と$this->reset(...)に相当
$this->pull(['title', 'content']);
```

## サポートされるプロパティの型

Livewireがコンポーネントのデータをサーバーリクエスト間で管理する方法は独特であるため、サポートされるプロパティの型は限られています。

Livewireコンポーネントの各プロパティは、リクエスト間でJSONにシリアライズ、つまり「デハイドレート」され、次のリクエストに備えてJSONからPHPへ「ハイドレート」されます。

この双方向変換にはいくつかの制限があり、Livewireで扱えるプロパティの型が制限されます。

### プリミティブ型

Livewireは文字列や整数などのプリミティブ型をサポートしています。これらの型はJSONとの変換が容易なため、Livewireコンポーネントのプロパティとして使うのに適しています。

Livewireがサポートするプリミティブなプロパティの型は、`Array`、`String`、`Integer`、`Float`、`Boolean`、`Null`です。

```php
new class extends Component {
    public array $todos = [];

    public string $todo = '';

    public int $maxTodos = 10;

    public bool $showTodos = false;

    public ?string $todoFilter = null;
};
```

### 一般的なPHPの型

プリミティブ型に加えて、LivewireはLaravelアプリケーションで使われる一般的なPHPオブジェクト型をサポートしています。ただし、これらの型はリクエストごとにJSONへ_デハイドレート_され、PHPへ_ハイドレート_される点に注意してください。つまり、クロージャなどの実行時の値がプロパティに保持されない場合があります。また、クラス名などのオブジェクトに関する情報がJavaScriptに公開される可能性があります。

サポートされるPHPの型:
| 型 | 完全修飾クラス名 |
|---|---|
| BackedEnum | `BackedEnum` |
| Collection | `Illuminate\Support\Collection` |
| Eloquent Collection | `Illuminate\Database\Eloquent\Collection` |
| Model | `Illuminate\Database\Eloquent\Model` |
| DateTime | `DateTime` |
| Carbon | `Carbon\Carbon` |
| Stringable | `Illuminate\Support\Stringable` |

> [!warning] Eloquentコレクションとモデル
> EloquentコレクションとモデルをLivewireのプロパティに保存する場合は、次の制限に注意してください。
>
> - **クエリの制約は保持されません:** `select(...)`のような追加のクエリ制約は、後続のリクエストで再適用されません。詳しくは[リクエスト間でEloquentの制約が保持されない](#リクエスト間でeloquentの制約が保持されない)を参照してください。
> - **パフォーマンスへの影響:** 大きなEloquentコレクションをプロパティとして保存すると、コンポーネントがハイドレートされるたびにLivewireがデータベースクエリを再実行するため、パフォーマンスの問題が発生する可能性があります。コストの高いクエリには、データがテンプレートから実際にアクセスされたときだけ実行される[算出プロパティ](/computed-properties)の利用を検討してください。

これらのさまざまな型としてプロパティを設定する簡単な例を見てみましょう。

```php
public function mount()
{
    $this->todos = collect([]); // Collection

    $this->todos = Todos::all(); // Eloquent Collection

    $this->todo = Todos::first(); // Model

    $this->date = new DateTime('now'); // DateTime

    $this->date = new Carbon('now'); // Carbon

    $this->todo = str(''); // Stringable
}
```

### カスタム型をサポートする

Livewireでは、2つの強力な仕組みを通じて、アプリケーションでカスタム型をサポートできます。

* Wireable
* Synthesizer

Wireableはほとんどのアプリケーションで簡単に使えるため、ここで説明します。より高度なユーザーやパッケージ作成者で、より柔軟な仕組みが必要な場合は、[Synthesizerが適しています](/synthesizers)。

#### Wireable

Wireableは、アプリケーション内で`Wireable`インターフェースを実装する任意のクラスです。

例えば、顧客の主要なデータを持つ`Customer`オブジェクトがアプリケーションにあるとします。

```php
class Customer
{
    protected $name;
    protected $age;

    public function __construct($name, $age)
    {
        $this->name = $name;
        $this->age = $age;
    }
}
```

このクラスのインスタンスをLivewireコンポーネントのプロパティに設定しようとすると、`Customer`プロパティの型はサポートされていないというエラーになります。

```php
new class extends Component {
    public Customer $customer;

    public function mount()
    {
        $this->customer = new Customer('Caleb', 29);
    }
};
```

しかし、`Wireable`インターフェースを実装し、クラスに`toLivewire()`と`fromLivewire()`メソッドを追加すれば解決できます。これらのメソッドは、Livewireにこの型のプロパティをJSONへ変換し、元の形に戻す方法を伝えます。

```php
use Livewire\Wireable;

class Customer implements Wireable
{
    protected $name;
    protected $age;

    public function __construct($name, $age)
    {
        $this->name = $name;
        $this->age = $age;
    }

    public function toLivewire()
    {
        return [
            'name' => $this->name,
            'age' => $this->age,
        ];
    }

    public static function fromLivewire($value)
    {
        $name = $value['name'];
        $age = $value['age'];

        return new static($name, $age);
    }
}
```

これでLivewireコンポーネントのプロパティに`Customer`オブジェクトを自由に設定でき、LivewireはそのオブジェクトをJSONへ変換したり、PHPへ戻したりできるようになります。

前述のとおり、より広範かつ強力に型をサポートしたい場合、LivewireにはSynthesizerがあります。これはさまざまなプロパティの型を扱うための高度な内部機構です。[Synthesizerについて詳しく学ぶ](/synthesizers)

## JavaScriptからプロパティにアクセスする

LivewireのプロパティはJavaScriptを通じてブラウザでも利用できるため、[AlpineJS](https://alpinejs.dev/)からJavaScript表現へアクセスし、操作できます。

AlpineはLivewireに含まれる軽量なJavaScriptライブラリです。Alpineを使うと、サーバーとの完全な往復処理を行わずに、Livewireコンポーネントへ軽量なインタラクションを組み込めます。

Livewireのフロントエンドは内部的にAlpineを基盤として構築されています。実際、すべてのLivewireコンポーネントは内部ではAlpineコンポーネントです。つまり、Livewireコンポーネント内でAlpineを自由に利用できます。

このページの残りでは、Alpineの基本的な知識があることを前提とします。Alpineに詳しくない場合は、[Alpineのドキュメント](https://alpinejs.dev/docs)を確認してください。

### プロパティにアクセスする

LivewireはAlpineにマジックな`$wire`オブジェクトを公開しています。Livewireコンポーネント内の任意のAlpine式から`$wire`オブジェクトへアクセスできます。

`$wire`オブジェクトは、LivewireコンポーネントをJavaScriptで表したものとして扱えます。PHP版のコンポーネントと同じプロパティとメソッドをすべて持つほか、テンプレートで特定の処理を行う専用メソッドもいくつか含まれています。

例えば、`$wire`を使って`todo`入力欄の文字数をリアルタイムに表示できます。

```blade
<div>
    <input type="text" wire:model="todo">

    Todoの文字数: <h2 x-text="$wire.todo.length"></h2>
</div>
```

ユーザーが入力欄に文字を入力すると、入力中のTodoの現在の文字数が、サーバーへネットワークリクエストを送信することなくページ上で表示・更新されます。

### プロパティを操作する

同様に、`$wire`を使ってJavaScriptからLivewireコンポーネントのプロパティを操作できます。

例えば、JavaScriptだけで入力欄をリセットできるよう、`todos`コンポーネントに「クリア」ボタンを追加してみましょう。

```blade
<div>
    <input type="text" wire:model="todo">

    <button x-on:click="$wire.todo = ''">クリア</button>
</div>
```

ユーザーが「クリア」をクリックすると、サーバーへネットワークリクエストを送信せず、入力欄が空文字列にリセットされます。

次のリクエストでは、サーバー側の`$todo`の値が更新・同期されます。

より明示的な`.set()`メソッドを使って、クライアント側でプロパティを設定することもできます。ただし、`.set()`はデフォルトで直ちにネットワークリクエストを発生させ、状態をサーバーと同期する点に注意してください。それが望ましい場合は、優れたAPIです。

```blade
<button x-on:click="$wire.set('todo', '')">クリア</button>
```

サーバーへネットワークリクエストを送信せずにプロパティを更新するには、3番目のboolパラメータを渡します。これによりネットワークリクエストが遅延され、次のリクエストでサーバー側の状態が同期されます。

```blade
<button x-on:click="$wire.set('todo', '', false)">クリア</button>
```

## セキュリティ上の注意点

Livewireのプロパティは強力な機能ですが、使う前に知っておくべきセキュリティ上の注意点がいくつかあります。

要点として、publicプロパティはユーザー入力、つまり従来のエンドポイントへのリクエスト入力と同じように必ず扱ってください。そのため、コントローラーでリクエスト入力を扱う場合と同じように、データベースへ保存する前にプロパティをバリデーションし、認可することが重要です。

### プロパティの値を信頼しない

プロパティの認可・バリデーションを怠るとアプリケーションにセキュリティホールが生じることを示すため、次の`post.edit`コンポーネントは攻撃に対して脆弱です。

```php
<?php // resources/views/components/post/⚡edit.blade.php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public $id;
    public $title;
    public $content;

    public function mount(Post $post)
    {
        $this->id = $post->id;
        $this->title = $post->title;
        $this->content = $post->content;
    }

    public function update()
    {
        $post = Post::findOrFail($this->id);

        $post->update([
            'title' => $this->title,
            'content' => $this->content,
        ]);

        session()->flash('message', '投稿を正常に更新しました！');
    }
};
```

```blade
<form wire:submit="update">
    <input type="text" wire:model="title">
    <input type="text" wire:model="content">

    <button type="submit">更新</button>
</form>
```

一見すると、このコンポーネントにはまったく問題がないように見えるかもしれません。しかし、攻撃者がこのコンポーネントを使ってアプリケーション上で認可されていない操作を行う方法を見てみましょう。

投稿の`id`をコンポーネントのpublicプロパティとして保存しているため、`title`や`content`プロパティと同じようにクライアント側から操作できます。

`wire:model="id"`を指定した入力欄を自分で書いていないことは関係ありません。悪意のあるユーザーは、ブラウザのDevToolsを使って簡単にビューを次のように変更できます。

```blade
<form wire:submit="update">
    <input type="text" wire:model="id"> <!-- [tl! highlight] -->
    <input type="text" wire:model="title">
    <input type="text" wire:model="content">

    <button type="submit">更新</button>
</form>
```

これで悪意のあるユーザーは、`id`入力欄を別の投稿モデルのIDに変更できます。フォームを送信して`update()`が呼び出されると、`Post::findOrFail()`はユーザーが所有していない投稿を返し、その投稿を更新します。

この種の攻撃を防ぐには、次の戦略の一方または両方を使います。

* 入力を認可する
* プロパティを更新からロックする

#### 入力を認可する

コントローラーと同じように、`$id`は`wire:model`などを使ってクライアント側から操作できるため、[Laravelの認可](https://laravel.com/docs/authorization)を使って現在のユーザーが投稿を更新できることを確認します。

```php
public function update()
{
    $post = Post::findOrFail($this->id);

    $this->authorize('update', $post); // [tl! highlight]

    $post->update(...);
}
```

悪意のあるユーザーが`$id`プロパティを変更しても、追加した認可処理がそれを検出してエラーを投げます。

#### プロパティをロックする

Livewireでは、クライアント側でプロパティが変更されないよう、プロパティを「ロック」することもできます。`#[Locked]`属性を使うと、クライアント側からの操作に対してプロパティを「ロック」できます。

```php
use Livewire\Attributes\Locked;
use Livewire\Component;

new class extends Component {
    #[Locked] // [tl! highlight]
    public $id;

    // ...
};
```

これで、ユーザーがフロントエンドから`$id`を変更しようとすると、エラーが発生します。

`#[Locked]`を使うことで、このプロパティがコンポーネントクラスの外部で操作されていないとみなせます。

プロパティのロックについて詳しくは、[Locked属性のドキュメント](/attribute-locked)を参照してください。

#### Eloquentモデルとロック

EloquentモデルをLivewireコンポーネントのプロパティに割り当てると、Livewireは自動的にプロパティをロックし、IDが変更されないことを保証します。そのため、この種の攻撃から安全です。

```php
<?php // resources/views/components/post/⚡edit.blade.php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public Post $post; // [tl! highlight]
    public $title;
    public $content;

    public function mount(Post $post)
    {
        $this->post = $post;
        $this->title = $post->title;
        $this->content = $post->content;
    }

    public function update()
    {
        $this->post->update([
            'title' => $this->title,
            'content' => $this->content,
        ]);

        session()->flash('message', '投稿を正常に更新しました！');
    }
};
```

### プロパティはシステム情報をブラウザに公開する

もう1つ重要なのは、Livewireのプロパティはブラウザへ送信される前にシリアライズ、つまり「デハイドレート」されることです。これは、値がネットワーク経由で送信でき、JavaScriptが理解できる形式へ変換されるという意味です。この形式によって、プロパティの名前やクラス名など、アプリケーションに関する情報がブラウザに公開される可能性があります。

例えば、`$post`というpublicプロパティを定義するLivewireコンポーネントがあり、このプロパティがデータベースの`Post`モデルのインスタンスを持っているとします。この場合、ネットワーク経由で送信されるこのプロパティのデハイドレートされた値は、次のようになります。

```json
{
    "type": "model",
    "class": "App\\Models\\Post",
    "key": 1,
    "relationships": []
}
```

ご覧のとおり、`$post`プロパティのデハイドレートされた値には、モデルのクラス名（`App\Models\Post`）、ID、Eagerロードされたリレーションが含まれています。

モデルのクラス名を公開したくない場合は、サービスプロバイダーでLaravelの「morphMap」機能を使い、モデルのクラス名にエイリアスを割り当てられます。

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;

class AppServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Relation::morphMap([
            'post' => 'App\\Models\\Post',
        ]);
    }
}
```

これでEloquentモデルが「デハイドレート」（シリアライズ）されると、元のクラス名は公開されず、「post」エイリアスだけが公開されます。

```json
{
    "type": "model",
    "class": "App\\Models\\Post", // [tl! remove]
    "class": "post", // [tl! add]
    "key": 1,
    "relationships": []
}
```

### リクエスト間でEloquentの制約は保持されない

通常、Livewireはリクエスト間でサーバー側のプロパティを保持し、再構築できます。しかし、リクエスト間で値を保持できない状況もあります。

例えば、EloquentコレクションをLivewireのプロパティとして保存する場合、`select(...)`のような追加のクエリ制約は後続のリクエストで再適用されません。

これを示すため、`Todos` Eloquentコレクションに`select()`制約を適用する次の`show-todos`コンポーネントを考えてみましょう。

```php
<?php // resources/views/components/⚡show-todos.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Component;

new class extends Component {
    public $todos;

    public function mount()
    {
        $this->todos = Auth::user()
            ->todos()
            ->select(['title', 'content']) // [tl! highlight]
            ->get();
    }
};
```

このコンポーネントが最初に読み込まれると、`$todos`プロパティにはユーザーのTodoのEloquentコレクションが設定されます。ただし、データベースの各行からクエリ・取得され、各モデルに読み込まれるのは`title`と`content`フィールドだけです。

Livewireが後続のリクエストでこのプロパティのJSONをPHPへ_ハイドレート_すると、select制約は失われます。

Eloquentクエリの完全性を保つため、プロパティではなく[算出プロパティ](/computed-properties)を使うことをおすすめします。

算出プロパティは、`#[Computed]`属性でマークしたコンポーネントのメソッドです。コンポーネントの状態の一部として保存されず、その場で評価される動的なプロパティとしてアクセスできます。

先ほどの例を算出プロパティで書き直すと、次のようになります。

```php
<?php // resources/views/components/⚡show-todos.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;

new class extends Component {
    #[Computed] // [tl! highlight]
    public function todos()
    {
        return Auth::user()
            ->todos()
            ->select(['title', 'content'])
            ->get();
    }
};
```

Bladeビューからこの_Todo_にアクセスする方法は次のとおりです。

```blade
<ul>
    @foreach ($this->todos as $todo)
        <li wire:key="{{ $loop->index }}">{{ $todo }}</li>
    @endforeach
</ul>
```

ビュー内では、次のように`$this`オブジェクトを通してのみ算出プロパティにアクセスできる点に注意してください: `$this->todos`。

クラス内から`$todos`にアクセスすることもできます。例えば、`markAllAsComplete()`アクションがあるとします。

```php
<?php // resources/views/components/⚡show-todos.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;

new class extends Component {
    #[Computed]
    public function todos()
    {
        return Auth::user()
            ->todos()
            ->select(['title', 'content'])
            ->get();
    }

    public function markAllComplete() // [tl! highlight:3]
    {
        $this->todos->each->complete();
    }
};
```

必要な場所で`$this->todos()`をメソッドとして直接呼び出せばよいのに、なぜわざわざ`#[Computed]`を使うのか、疑問に思うかもしれません。

その理由は、算出プロパティにはパフォーマンス上の利点があるためです。1回のリクエスト中に初めて使われた後、算出プロパティは自動的にメモ化されます。つまりコンポーネント内で`$this->todos`に自由にアクセスしても、実際のメソッドは1回しか呼び出されないため、同じリクエスト中にコストの高いクエリが何度も実行される心配がありません。

詳しくは、[算出プロパティのドキュメント](/computed-properties)を参照してください。

## 関連項目

- **[フォーム](/forms)** — `wire:model`でプロパティをフォーム入力にバインドする
- **[算出プロパティ](/computed-properties)** — 自動メモ化による派生値を作成する
- **[バリデーション](/validation)** — 保存前にプロパティの値を検証する
- **[Locked Attribute](/attribute-locked)** — クライアント側からプロパティを操作できないようにする
- **[Alpine](/alpine)** — JavaScriptからプロパティにアクセスし、操作する

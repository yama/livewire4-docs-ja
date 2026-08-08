# コンポーネントのネスト

Livewireでは、親コンポーネントの中に追加のLivewireコンポーネントをネストできます。この機能は非常に強力です。アプリケーション全体で共有するLivewireコンポーネント内に、動作を再利用してカプセル化できるためです。

> [!warning] Livewireコンポーネントは必要ないかもしれません
> テンプレートの一部をネストされたLivewireコンポーネントへ取り出す前に、次のことを自問してください。このコンポーネントのコンテンツは「live」である必要がありますか？そうでなければ、単純な[Bladeコンポーネント](https://laravel.com/docs/blade#components)を作ることをおすすめします。Livewireコンポーネントの動的な性質にメリットがある場合や、直接的なパフォーマンス上のメリットがある場合にだけ、Livewireコンポーネントを作成してください。

> [!tip] 分離した更新にはIslandを検討する
> 独立した子コンポーネントを作成する負荷なしに、コンポーネントの特定領域だけ再レンダリングを分離したい場合は、代わりに[Island](https://livewire.laravel.com/docs/4.x/islands)の利用を検討してください。Islandを使うと、Props、イベント、子コンポーネント間の通信を管理せずに、1つのコンポーネント内で独立して更新される領域を作成できます。

ネストされたLivewireコンポーネントのパフォーマンス、利用上の影響、制約については、[Livewireコンポーネントのネストに関する詳しい技術的解説](https://livewire.laravel.com/docs/4.x/understanding-nesting)を参照してください。

## コンポーネントをネストする

Livewireコンポーネントを親コンポーネント内にネストするには、親コンポーネントのBladeビューに含めるだけです。以下は、`todos`コンポーネントをネストした`dashboard`親コンポーネントの例です。

```php
<?php // resources/views/components/⚡dashboard.blade.php

use Livewire\Component;

new class extends Component {
    //
};
?>

<div>
    <h1>ダッシュボード</h1>

    <livewire:todos /> <!-- [tl! highlight] -->
</div>
```

このページの初回レンダリングでは、`dashboard`コンポーネントが`<livewire:todos />`に遭遇し、その場所に描画します。`dashboard`への後続のネットワークリクエストでは、ネストされた`todos`コンポーネントはページ上の独立したコンポーネントになっているため、描画をスキップします。ネストとレンダリングの技術的な考え方については、[ネストされたコンポーネントは独立している](https://livewire.laravel.com/docs/4.x/understanding-nesting#every-component-is-an-island)ドキュメントを参照してください。

コンポーネントを描画する構文については、[コンポーネントを描画する](/components#コンポーネントを描画する)ドキュメントを参照してください。

## 子コンポーネントにPropsを渡す

親コンポーネントから子コンポーネントへデータを渡すのは簡単です。一般的な[Bladeコンポーネント](https://laravel.com/docs/blade#components)にPropsを渡す方法とよく似ています。

例えば、`$todos`のコレクションを`todo-count`という子コンポーネントに渡す`todos`コンポーネントを見てみましょう。

```php
<?php // resources/views/components/⚡todos.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;

new class extends Component {
    #[Computed]
    public function todos()
    {
        return Auth::user()->todos,
    }
};
?>

<div>
    <livewire:todo-count :todos="$this->todos" />

    <!-- ... -->
</div>
```

ご覧のとおり、`:todos="$this->todos"`という構文で`$this->todos`を`todo-count`へ渡しています。

`$todos`が子コンポーネントへ渡されたら、子コンポーネントの`mount()`メソッドでデータを受け取れます。

```php
<?php // resources/views/components/⚡todo-count.blade.php

use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Todo;

new class extends Component {
    public $todos;

    public function mount($todos)
    {
        $this->todos = $todos;
    }

    #[Computed]
    public function count()
    {
        return $this->todos->count(),
    }
};
?>

<div>
    件数: {{ $this->count }}
</div>
```

> [!tip] 短い代替方法として`mount()`を省略する
> 上の例の`mount()`メソッドが冗長な定型コードに感じられる場合、プロパティ名とパラメータ名が一致していれば省略できます。
> ```php
> public $todos; // [tl! highlight]
> ```

### 静的なPropsを渡す

前の例では、PHP式をサポートするLivewireの動的なProp構文で子コンポーネントにPropsを渡しました。

```blade
<livewire:todo-count :todos="$todos" />
```

しかし、文字列などの単純な静的値をコンポーネントに渡したい場合もあります。その場合は、文の先頭からコロンを省略できます。

```blade
<livewire:todo-count :todos="$todos" label="Todoの件数:" />
```

キーだけを指定して、ブール値をコンポーネントに渡すこともできます。例えば、値が`true`の`$inline`変数をコンポーネントに渡すには、コンポーネントタグに`inline`だけを記述します。

```blade
<livewire:todo-count :todos="$todos" inline />
```

### 属性構文を短縮する

コンポーネントにPHP変数を渡すとき、変数名とProp名が同じことはよくあります。同じ名前を2回書かずに済むよう、Livewireでは変数にコロンを付けるだけの構文を使えます。

```blade
<livewire:todo-count :todos="$todos" /> <!-- [tl! remove] -->

<livewire:todo-count :$todos /> <!-- [tl! add] -->
```

## ループ内で子コンポーネントを描画する

ループ内で子コンポーネントを描画する場合は、反復ごとに一意な`key`値を含める必要があります。

コンポーネントのキーは、後続のレンダリングで各コンポーネントをLivewireが追跡するためのものです。特に、コンポーネントがすでに描画されている場合や、ページ上で複数のコンポーネントが並べ替えられた場合に使われます。

子コンポーネントに`:key` Propを指定して、コンポーネントのキーを設定できます。

```blade
<div>
    <h1>Todo</h1>

    @foreach ($todos as $todo)
        <livewire:todo-item :$todo :wire:key="$todo->id" />
    @endforeach
</div>
```

ご覧のとおり、各子コンポーネントには各`$todo`のIDを使った一意のキーが設定されます。これにより、Todoが並べ替えられてもキーが一意で追跡されます。

> [!warning] キーは省略できません
> VueやAlpineのようなフロントエンドフレームワークを使ったことがあれば、ループ内のネストされた要素にキーを追加することに馴染みがあるでしょう。ただし、それらのフレームワークではキーは_必須ではない_ため、要素は描画されますが並べ替えが正しく追跡されないことがあります。一方Livewireはキーに大きく依存しており、キーがないと正しく動作しません。

## リアクティブなProps

Livewireを始めたばかりの開発者は、Propsがデフォルトで「リアクティブ」だと考えがちです。つまり、親が子コンポーネントに渡したPropの値を変更すると、子コンポーネントも自動的に更新されると期待します。しかし、LivewireのPropsはデフォルトではリアクティブではありません。

Livewireでは、[すべてのコンポーネントが独立しています](https://livewire.laravel.com/docs/4.x/understanding-nesting#every-component-is-an-island)。親で更新が発生してネットワークリクエストがディスパッチされると、再レンダリングのためにサーバーへ送信されるのは親コンポーネントの状態だけで、子コンポーネントの状態は送信されません。この動作の意図は、サーバーとクライアント間でやり取りするデータ量を最小限にし、更新をできるだけ高性能にすることです。

ただし、Propをリアクティブにしたい、またはその必要がある場合は、`#[Reactive]`属性パラメータを使って簡単に有効化できます。

例えば、親の`todos`コンポーネントのテンプレートは次のようになります。中で`todo-count`コンポーネントを描画し、現在のTodoリストを渡しています。

```blade
<div>
    <h1>Todo:</h1>

    <livewire:todo-count :$todos />

    <!-- ... -->
</div>
```

ここで、`todo-count`コンポーネントの`$todos` Propに`#[Reactive]`を追加します。これで、親コンポーネント内でTodoが追加・削除されると、`todo-count`コンポーネント内でも自動的に更新が発生します。

```php
<?php // resources/views/components/⚡todo-count.blade.php

use Livewire\Attributes\Reactive;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Todo;

new class extends Component {
    #[Reactive] // [tl! highlight]
    public $todos;

    #[Computed]
    public function count()
    {
        return $this->todos->count(),
    }
};
?>

<div>
    件数: {{ $this->count }}
</div>
```

リアクティブプロパティは非常に強力な機能で、LivewireをVueやReactのようなフロントエンドコンポーネントライブラリに近づけます。しかし、この機能がパフォーマンスに与える影響を理解し、特定のシナリオで意味がある場合にだけ`#[Reactive]`を追加することが重要です。

> [!tip] Islandを使えばリアクティブなPropsが不要になる
> 更新を分離することを主な目的として子コンポーネントを作成し、同期を保つために`#[Reactive]`を使っている場合は、[Island](https://livewire.laravel.com/docs/4.x/islands)の利用を検討してください。Islandは、リアクティブなPropsや子コンポーネント間の通信なしに、1つのコンポーネント内で分離した再レンダリングを実現します。

## `wire:model`で子のデータにバインドする

親と子のコンポーネント間で状態を共有するもう1つの強力なパターンは、Livewireの`Modelable`機能を使い、子コンポーネントへ直接`wire:model`を指定する方法です。

これは、入力要素を専用のLivewireコンポーネントへ取り出しながら、親コンポーネントからその状態にもアクセスしたい場合によく必要になります。

以下は、ユーザーが追加しようとしている現在のTodoを追跡する`$todo`プロパティを持つ、親の`todos`コンポーネントの例です。

```php
<?php // resources/views/components/⚡todos.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Todo;

new class extends Component {
    public $todo = '';

    public function add()
    {
        Todo::create([
            'content' => $this->pull('todo'),
        ]);
    }

    #[Computed]
    public function todos()
    {
        return Auth::user()->todos,
    }
};
```

`todos`のテンプレートでは、`wire:model`を使って`$todo`プロパティをネストされた`todo-input`コンポーネントへ直接バインドしています。

```blade
<div>
    <h1>Todo</h1>

    <livewire:todo-input wire:model="todo" /> <!-- [tl! highlight] -->

    <button wire:click="add">Todoを追加</button>

    <div>
        @foreach ($this->todos as $todo)
            <livewire:todo-item :$todo :wire:key="$todo->id" />
        @endforeach
    </div>
</div>
```

Livewireには`#[Modelable]`属性があり、子コンポーネントのプロパティに追加すると、親コンポーネントから_モデル可能_になります。

以下は、`$value`プロパティの上に`#[Modelable]`属性を追加した`todo-input`コンポーネントです。親がコンポーネントに`wire:model`を宣言した場合、このプロパティにバインドするようLivewireへ伝えます。

```php
<?php // resources/views/components/⚡todo-input.blade.php

use Livewire\Attributes\Modelable;
use Livewire\Component;

new class extends Component {
    #[Modelable] // [tl! highlight]
    public $value = '';
};
?>

<div>
    <input type="text" wire:model="value" >
</div>
```

これで親の`todos`コンポーネントは、`todo-input`を他の入力要素と同じように扱い、`wire:model`で値に直接バインドできます。

> [!warning]
> 現在Livewireがサポートする`#[Modelable]`属性は1つだけなので、バインドされるのは最初の1つだけです。

## スロット

スロットを使うと、親コンポーネントから子コンポーネントへBladeコンテンツを渡せます。子コンポーネントが独自のコンテンツを描画しながら、親が特定の場所にカスタムコンテンツを注入できるため便利です。

以下はコメントの一覧を描画する親コンポーネントの例です。各コメントは`Comment`子コンポーネントで描画しますが、親はスロットを通じて「削除」ボタンを渡します。

```php
<?php

use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public Post $post;

    #[Computed]
    public function comments()
    {
        return $this->post->comments;
    }

    public function removeComment($id)
    {
        $this->post->comments()->find($id)->delete();
    }
};
?>

<div>
    @foreach ($this->comments as $comment)
        <livewire:comment :$comment :wire:key="$comment->id">
            <button wire:click="removeComment({{ $comment->id }})">
                削除
            </button>
        </livewire:comment>
    @endforeach
</div>
```

`Comment`子コンポーネントへコンテンツを渡したので、`$slot`変数を使って描画できます。

```php
<?php

use Livewire\Component;
use App\Models\Comment;

new class extends Component {
    public Comment $comment;
};
?>

<div>
    <p>{{ $comment->author }}</p>
    <p>{{ $comment->body }}</p>

    {{ $slot }}
</div>
```

`Comment`コンポーネントが`$slot`を描画すると、Livewireは親から渡されたコンテンツを注入します。

スロットは親コンポーネントのコンテキストで評価される点を理解しておくことが重要です。つまり、スロット内で参照されるプロパティやメソッドは子ではなく親に属します。上の例では、`removeComment()`メソッドは`Comment`子コンポーネントではなく親コンポーネント上で呼び出されます。

### 名前付きスロット

デフォルトスロットに加えて、複数の名前付きスロットを子コンポーネントへ渡すこともできます。子コンポーネントの複数の領域にコンテンツを提供したい場合に便利です。

以下は、デフォルトスロットと`actions`という名前付きスロットの両方を`Comment`コンポーネントへ渡す例です。

```blade
<div>
    @foreach ($this->comments as $comment)
        <livewire:comment :$comment :wire:key="$comment->id">
            <livewire:slot name="actions">
                <button wire:click="removeComment({{ $comment->id }})">
                    削除
                </button>
            </livewire:slot>

            <span>投稿日時: {{ $comment->created_at }}</span>
        </livewire:comment>
    @endforeach
</div>
```

子コンポーネントでは、`$slots`変数へスロット名を渡して名前付きスロットにアクセスできます。

```blade
<div>
    <p>{{ $comment->author }}</p>
    <p>{{ $comment->body }}</p>

    <div class="actions">
        {{ $slots['actions'] }}
    </div>

    <div class="metadata">
        {{ $slot }}
    </div>
</div>
```

### スロットが渡されたか確認する

`$slots`変数の`has()`メソッドを使って、親からスロットが渡されたか確認できます。スロットの有無に応じてコンテンツを条件付きで描画したい場合に便利です。

```blade
<div>
    <p>{{ $comment->author }}</p>
    <p>{{ $comment->body }}</p>

    @if ($slots->has('actions'))
        <div class="actions">
            {{ $slots['actions'] }}
        </div>
    @endif

    {{ $slot }}
</div>
```

## HTML属性を転送する

Bladeコンポーネントと同様に、Livewireコンポーネントも`$attributes`変数を使って親から子へHTML属性を転送できます。

以下は、親コンポーネントから子コンポーネントへ`class`属性を渡す例です。

```blade
<livewire:comment :$comment class="border-b" />
```

子コンポーネントでは、`$attributes`変数を使ってこれらの属性を適用できます。

```blade
<div {{ $attributes->class('bg-white rounded-md') }}>
    <p>{{ $comment->author }}</p>
    <p>{{ $comment->body }}</p>
</div>
```

publicプロパティの名前と一致する属性は自動的にPropsとして渡され、`$attributes`から除外されます。`class`、`id`、`data-*`など、残りの属性は`$attributes`から利用できます。

## Islandとネストされたコンポーネント

Livewireアプリケーションを構築するとき、ネストされた子コンポーネントを作るか、Islandを使うか選択することがよくあります。どちらも特定の領域への更新を分離できますが、目的は異なります。

### Islandを使う場合

Islandは、アーキテクチャを複雑にせずパフォーマンスを分離したい場合に適しています。次のような場合にIslandを使います。

**負荷なしにパフォーマンスを最適化したい**

高コストな計算が不必要に実行されるのを防ぐことが主な目的なら、Islandがより単純な解決策です。

```blade
{{-- Island: シンプルなパフォーマンス分離 --}}
@island
    <div>
        売上: {{ $this->expensiveRevenue }}
        <button wire:click="$refresh">更新</button>
    </div>
@endisland
```

これは子コンポーネントと同じパフォーマンス上のメリットを実現しながら、別のコンポーネントファイルを作成したり、Propsを管理したり、イベント通信を設定したりする必要がありません。

**コンテンツの読み込みを遅延またはLazyにしたい**

Islandは、初回ページ読み込み後まで高コストな処理を遅延するのに適しています。

```blade
@island(lazy: true)
    <div>{{ $this->slowApiCall }}</div>
@endisland
```

**複数の独立したUI領域がある**

別々のロジックは必要としないものの、独立して更新される複数の領域がある場合です。

```blade
@island(name: 'stats')
    <div>統計: {{ $this->stats }}</div>
@endisland

@island(name: 'chart')
    <div>グラフ: {{ $this->chartData }}</div>
@endisland
```

**分離した領域に独自のライフサイクルが必要ない**

Islandは親コンポーネントのライフサイクル、状態、メソッドを共有します。そのため、その領域が概念的に同じコンポーネントの一部である場合に適しています。

### ネストされたコンポーネントを使う場合

真のカプセル化と再利用性が必要な場合は、ネストされたコンポーネントが適しています。次のような場合にネストされたコンポーネントを使います。

**再利用可能で自己完結した機能が必要**

コンポーネントを独自のロジックと状態とともに複数の場所で使う場合です。

```blade
{{-- このtodo-itemはアプリケーション全体で再利用できます --}}
<livewire:todo-item :$todo :wire:key="$todo->id" />
```

**独立したライフサイクルフックが必要**

子に独自の`mount()`、`updated()`、その他のライフサイクルメソッドが必要な場合です。

```php
public function mount($todo)
{
    $this->authorize('view', $todo);
}

public function updated($property)
{
    // 子固有の更新ロジック
}
```

**カプセル化された状態とロジックが必要**

子に複雑な状態管理があり、分離する必要がある場合です。

```php
// 独自にカプセル化された状態を持つ子コンポーネント
public $editMode = false;
public $draft = '';

public function startEdit() { /* ... */ }
public function saveEdit() { /* ... */ }
public function cancelEdit() { /* ... */ }
```

**コンポーネントを真に独立させたい**

ネストされたコンポーネントは真に独立しており、親の更新にかかわらず自身の状態を保持します。親の再レンダリングから子を影響させたくない場合に便利です。

**コンポーネントライブラリを構築している**

チームや組織向けに再利用可能なコンポーネントを作成する場合、ネストされたコンポーネントが適切なカプセル化の境界を提供します。

### 簡単な判断ガイド

まだ確信が持てない場合は、次の質問を自分に問いかけてください。

- **「再利用する必要がありますか？」** → ネストされたコンポーネント
- **「独自のライフサイクルメソッドが必要ですか？」** → ネストされたコンポーネント
- **「パフォーマンスを最適化しようとしていますか？」** → Island
- **「高コストなコンテンツの読み込みを遅延したいですか？」** → Island（`lazy`または`defer`付き）
- **「1か所でしか使いませんか？」** → おそらくIsland
- **「複雑で分離された状態が必要ですか？」** → ネストされたコンポーネント

まずは単純さのためにIslandから始め、追加のカプセル化が必要になったら後でネストされたコンポーネントにリファクタリングすることもできます。

## 子からのイベントをリッスンする

親子コンポーネント間の通信には、Livewireのイベントシステムを使う方法もあります。サーバーまたはクライアントでイベントをディスパッチし、他のコンポーネントで捕捉できます。

[Livewireのイベントシステムに関する完全なドキュメント](https://livewire.laravel.com/docs/4.x/events)にはイベントの詳しい情報があります。ここでは、イベントで親コンポーネントの更新を発生させる簡単な例を説明します。

Todoを表示・削除する機能を持つ`todos`コンポーネントを考えてみましょう。

```php
<?php // resources/views/components/⚡todos.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Todo;

new class extends Component {
    public function remove($todoId)
    {
        $todo = Todo::find($todoId);

        $this->authorize('delete', $todo);

        $todo->delete();
    }

    #[Computed]
    public function todos()
    {
        return Auth::user()->todos,
    }
};
?>

<div>
    @foreach ($this->todos as $todo)
        <livewire:todo-item :$todo :wire:key="$todo->id" />
    @endforeach
</div>
```

子の`todo-item`コンポーネント内部から`remove()`を呼び出すには、`#[On]`属性を使って`todos`にイベントリスナーを追加します。

```php
<?php // resources/views/components/⚡todos.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Attributes\On;
use Livewire\Component;
use App\Models\Todo;

new class extends Component {
    #[On('remove-todo')] // [tl! highlight]
    public function remove($todoId)
    {
        $todo = Todo::find($todoId);

        $this->authorize('delete', $todo);

        $todo->delete();
    }

    #[Computed]
    public function todos()
    {
        return Auth::user()->todos,
    }
};
?>

<div>
    @foreach ($this->todos as $todo)
        <livewire:todo-item :$todo :wire:key="$todo->id" />
    @endforeach
</div>
```

アクションに属性を追加したら、`todo-item`子コンポーネントから`remove-todo`イベントをディスパッチできます。

```php
<?php // resources/views/components/⚡todo-item.blade.php

use Livewire\Component;
use App\Models\Todo;

new class extends Component {
    public Todo $todo;

    public function remove()
    {
        $this->dispatch('remove-todo', todoId: $this->todo->id); // [tl! highlight]
    }
};
?>

<div>
    <span>{{ $todo->content }}</span>

    <button wire:click="remove">削除</button>
</div>
```

これで`todo-item`内の「削除」ボタンをクリックすると、親の`todos`コンポーネントがディスパッチされたイベントを捕捉し、Todoを削除します。

親でTodoが削除されるとリストが再レンダリングされ、`remove-todo`イベントをディスパッチした子がページから削除されます。

### クライアント側でディスパッチしてパフォーマンスを改善する

上の例は動作しますが、1つのアクションを実行するのに2つのネットワークリクエストが必要です。

1. `todo-item`コンポーネントからの最初のネットワークリクエストが`remove`アクションを発生させ、`remove-todo`イベントをディスパッチする。
2. 2つ目のネットワークリクエストは、`remove-todo`イベントがクライアント側でディスパッチされた後に発生し、`todos`がそれを捕捉して`remove`アクションを呼び出す。

`remove-todo`イベントをクライアント側で直接ディスパッチすれば、最初のリクエストを完全に避けられます。以下は、`remove-todo`イベントのディスパッチ時にネットワークリクエストを発生させない、更新後の`todo-item`コンポーネントです。

```php
<?php // resources/views/components/⚡todo-item.blade.php

use Livewire\Component;
use App\Models\Todo;

new class extends Component {
    public Todo $todo;
};
?>

<div>
    <span>{{ $todo->content }}</span>

    <button wire:click="$dispatch('remove-todo', { todoId: {{ $todo->id }} })">削除</button>
</div>
```

経験則として、可能な場合は常にクライアント側でのディスパッチを優先してください。

> [!tip] Islandはイベント通信のオーバーヘッドをなくせる
> イベントで親の更新を発生させることを主な目的として子コンポーネントを作成している場合は、[Island](https://livewire.laravel.com/docs/4.x/islands)の利用を検討してください。Islandは同じコンポーネントコンテキストを共有するため、イベントを介さずにコンポーネントメソッドを直接呼び出せます。

## 子から親へ直接アクセスする

イベント通信は間接層を追加します。親が子からディスパッチされないイベントをリッスンすることも、子が親に捕捉されないイベントをディスパッチすることもできます。

この間接性が望ましい場合もありますが、子コンポーネントから親コンポーネントへ直接アクセスしたい場合もあります。

Livewireでは、Bladeテンプレートにマジックな`$parent`変数を提供しています。これを使うと、子からアクションやプロパティに直接アクセスできます。先ほどの`TodoItem`テンプレートを書き換え、マジックな`$parent`変数で親の`remove()`アクションを直接呼び出すと次のようになります。

```blade
<div>
    <span>{{ $todo->content }}</span>

    <button wire:click="$parent.remove({{ $todo->id }})">削除</button>
</div>
```

イベントと親への直接通信は、親子コンポーネント間で双方向に通信する方法の一部です。それぞれのトレードオフを理解することで、特定のシナリオでどのパターンを使うべきか、より適切に判断できます。

## 動的な子コンポーネント

実行時まで、ページにどの子コンポーネントを描画すべきか分からない場合があります。そのためLivewireでは、`:is` Propを受け取る`<livewire:dynamic-component ...>`を使って、実行時に子コンポーネントを選択できます。

```blade
<livewire:dynamic-component :is="$current" />
```

動的な子コンポーネントはさまざまなシナリオで便利です。以下は、動的コンポーネントを使って複数ステップのフォームの各ステップを描画する例です。

```php
<?php // resources/views/components/⚡steps.blade.php

use Livewire\Component;

new class extends Component {
    public $current = 'step-one';

    protected $steps = [
        'step-one',
        'step-two',
        'step-three',
    ];

    public function next()
    {
        $currentIndex = array_search($this->current, $this->steps);

        $this->current = $this->steps[$currentIndex + 1];
    }
};
?>

<div>
    <livewire:dynamic-component :is="$current" :wire:key="$current" />

    <button wire:click="next">次へ</button>
</div>
```

これで、`steps`コンポーネントの`$current` Propが「step-one」に設定されている場合、Livewireは次のように「step-one」という名前のコンポーネントを描画します。

```php
<?php // resources/views/components/⚡step-one.blade.php

use Livewire\Component;

new class extends Component {
    //
};
?>

<div>
    ステップ1のコンテンツ
</div>
```

代わりに、次の構文を使うこともできます。

```blade
<livewire:is :component="$current" :wire:key="$current" />
```

> [!warning]
> 各子コンポーネントに一意のキーを割り当てることを忘れないでください。Livewireは`<livewire:dynamic-child />`と`<livewire:is />`にキーを自動生成しますが、同じキーが_すべて_の子コンポーネントに適用されるため、後続のレンダリングがスキップされます。
>
> キーがコンポーネントの描画に与える影響をより深く理解するには、[子コンポーネントを強制的に再レンダリングする](#子コンポーネントを強制的に再レンダリングする)を参照してください。

## 再帰的なコンポーネント

ほとんどのアプリケーションでは必要になることは稀ですが、Livewireコンポーネントを再帰的にネストできます。つまり、親コンポーネントが自分自身を子として描画します。

例えば、`survey-question`コンポーネント自身にサブ質問を紐付けられるアンケートを考えてみましょう。

```php
<?php // resources/views/components/⚡survey-question.blade.php

use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Question;

new class extends Component {
    public Question $question;

    #[Computed]
    public function subQuestions()
    {
        return $this->question->subQuestions,
    }
};
?>

<div>
    質問: {{ $question->content }}

    @foreach ($this->subQuestions as $subQuestion)
        <livewire:survey-question :question="$subQuestion" :wire:key="$subQuestion->id" />
    @endforeach
</div>
```

> [!warning]
> 当然ながら、再帰的なコンポーネントにも再帰の標準的なルールが適用されます。特に、テンプレートが無限に再帰しないようにするロジックをテンプレートに用意してください。上の例で、`$subQuestion`が元の質問を自身の`$subQuestion`として持っていると、無限ループが発生します。

## 子コンポーネントを強制的に再レンダリングする

Livewireは内部で、テンプレート内の各ネストされたLivewireコンポーネントにキーを生成します。

例えば、次のネストされた`todo-count`コンポーネントを考えてみましょう。

```blade
<div>
    <livewire:todo-count :$todos />
</div>
```

Livewireは内部で、次のようにランダムな文字列キーをコンポーネントに付与します。

```blade
<div>
    <livewire:todo-count :$todos wire:key="lska" />
</div>
```

親コンポーネントが描画中に上のような子コンポーネントに遭遇すると、子のリストにキーを保存します。

```php
'children' => ['lska'],
```

Livewireは後続のレンダリングでこのリストを参照し、子コンポーネントが以前のリクエストで描画済みか検出します。描画済みの場合はコンポーネントをスキップします。[ネストされたコンポーネントは独立しています](https://livewire.laravel.com/docs/4.x/understanding-nesting#every-component-is-an-island)。ただし、子のキーがリストにない、つまりまだ描画されていない場合、Livewireはコンポーネントの新しいインスタンスを作成し、その場所に描画します。

これらはほとんどのユーザーが意識する必要のない内部動作ですが、子にキーを設定するという考え方は、子の描画を制御する強力なツールです。

この知識を使うと、キーを変更するだけでコンポーネントを強制的に再レンダリングできます。

以下は、コンポーネントに渡す`$todos`が変更された場合に`todo-count`コンポーネントを破棄して再初期化したい例です。

```blade
<div>
    <livewire:todo-count :todos="$todos" :wire:key="$todos->pluck('id')->join('-')" />
</div>
```

上の例では、`$todos`の内容に基づいて動的な`:key`文字列を生成しています。これにより、`$todos`自体が変わるまでは`todo-count`コンポーネントが通常どおり描画され、存在し続けます。変わった時点でコンポーネント全体が最初から再初期化され、古いコンポーネントは破棄されます。

## 関連項目

- **[イベント](/events)** — ネストされたコンポーネント間で通信する
- **[コンポーネント](/components)** — コンポーネントの描画と整理について学ぶ
- **[Island](https://livewire.laravel.com/docs/4.x/islands)** — 分離した更新のためのネストの代替手段
- **[ネストを理解する](https://livewire.laravel.com/docs/4.x/understanding-nesting)** — ネストのパフォーマンスと動作を深く理解する
- **[Reactive Attribute](https://livewire.laravel.com/docs/4.x/attribute-reactive)** — ネストされたコンポーネントでPropsをリアクティブにする

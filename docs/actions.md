# アクション

Livewireのアクションは、ボタンのクリックやフォームの送信など、フロントエンドの操作によって呼び出せるコンポーネントのメソッドです。ブラウザからPHPメソッドを直接呼び出せる開発者体験を提供するため、アプリケーションのフロントエンドとバックエンドを接続する定型コードを書くことに煩わされず、アプリケーションのロジックに集中できます。

まず、`save`アクションを呼び出す基本的な例を見てみましょう。

```php
<?php // resources/views/components/post/⚡create.blade.php

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

        return redirect()->to('/posts');
    }
};
?>

<form wire:submit="save"> <!-- [tl! highlight] -->
    <input type="text" wire:model="title">

    <textarea wire:model="content"></textarea>

    <button type="submit">保存</button>
</form>
```

上の例では、ユーザーが「保存」をクリックしてフォームを送信すると、`wire:submit`が`submit`イベントを横取りし、サーバー上の`save()`アクションを呼び出します。

つまりアクションは、AJAXリクエストを手動で送信・処理する面倒な作業なしに、ユーザー操作をサーバー側の機能へ簡単に対応付ける仕組みです。

## パラメータを渡す

Livewireでは、Bladeテンプレートからコンポーネントのアクションへパラメータを渡せます。これにより、アクションが呼び出されたときにフロントエンドから追加のデータや状態を渡せます。

例えば、ユーザーが投稿を削除できる`ShowPosts`コンポーネントがあるとします。Livewireコンポーネントの`delete()`アクションへ、投稿のIDをパラメータとして渡せます。するとアクションは対象の投稿を取得し、データベースから削除できます。

```php
<?php // resources/views/components/post/⚡index.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Computed]
    public function posts()
    {
        return Auth::user()->posts;
    }

    public function delete($id)
    {
        $post = Post::findOrFail($id);

        $this->authorize('delete', $post);

        $post->delete();
    }
};
```

```blade
<div>
    @foreach ($this->posts as $post)
        <div wire:key="{{ $post->id }}">
            <h1>{{ $post->title }}</h1>
            <span>{{ $post->content }}</span>

            <button wire:click="delete({{ $post->id }})">削除</button> <!-- [tl! highlight] -->
        </div>
    @endforeach
</div>
```

投稿のIDが2の場合、上のBladeテンプレートの「削除」ボタンはブラウザ上で次のようにレンダリングされます。

```blade
<button wire:click="delete(2)">削除</button>
```

このボタンをクリックすると`delete()`メソッドが呼び出され、`$id`には「2」という値が渡されます。

> [!warning] アクションのパラメータを信頼しない
> アクションのパラメータはHTTPリクエストの入力と同じように扱う必要があります。つまり、パラメータの値を信頼してはいけません。データベースを更新する前に、エンティティの所有権を必ず認可してください。
>
> 詳しくは、[セキュリティ上の注意点とベストプラクティス](/actions#security-concerns)のドキュメントを参照してください。

さらに便利な機能として、パラメータとしてアクションに渡されたモデルIDから、Eloquentモデルを自動的に解決できます。これは[ルートモデルバインディング](/components#using-route-model-binding)とよく似ています。利用するには、アクションのパラメータにモデルクラスの型を指定します。すると、対応するモデルがデータベースから自動的に取得され、IDの代わりにアクションへ渡されます。

```php
<?php // resources/views/components/post/⚡index.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Computed]
    public function posts()
    {
        return Auth::user()->posts;
    }

    public function delete(Post $post) // [tl! highlight]
    {
        $this->authorize('delete', $post);

        $post->delete();
    }
};
```

## 依存性注入

アクションのシグネチャでパラメータに型を指定することで、[Laravelの依存性注入](https://laravel.com/docs/controllers#dependency-injection-and-controllers)システムを利用できます。LivewireとLaravelは、アクションの依存性をコンテナから自動的に解決します。

```php
<?php // resources/views/components/post/⚡index.blade.php

use Illuminate\Support\Facades\Auth;
use App\Repositories\PostRepository;
use Livewire\Attributes\Computed;
use Livewire\Component;

new class extends Component {
    #[Computed]
    public function posts()
    {
        return Auth::user()->posts;
    }

    public function delete(PostRepository $posts, $postId) // [tl! highlight]
    {
        $posts->deletePost($postId);
    }
};
```

```blade
<div>
    @foreach ($this->posts as $post)
        <div wire:key="{{ $post->id }}">
            <h1>{{ $post->title }}</h1>
            <span>{{ $post->content }}</span>

            <button wire:click="delete({{ $post->id }})">削除</button> <!-- [tl! highlight] -->
        </div>
    @endforeach
</div>
```

この例では、`delete()`メソッドは、渡された`$postId`パラメータを受け取る前に、[Laravelのサービスコンテナ](https://laravel.com/docs/container#main-content)によって解決された`PostRepository`のインスタンスを受け取ります。

## イベントリスナー

Livewireはさまざまなイベントリスナーをサポートしているため、複数の種類のユーザー操作に応答できます。

| リスナー | 説明 |
|---|---|
| `wire:click` | 要素がクリックされたときに発生 |
| `wire:submit` | フォームが送信されたときに発生 |
| `wire:keydown` | キーが押し下げられたときに発生 |
| `wire:keyup` | キーが離されたときに発生 |
| `wire:mouseenter` | マウスが要素に入ったときに発生 |
| `wire:*` | `wire:`の後に続く文字列がリスナーのイベント名として使われる |

`wire:`の後のイベント名には何でも指定できるため、Livewireでは必要なブラウザイベントをすべてリッスンできます。例えば、`transitionend`をリッスンするには`wire:transitionend`を使います。

### 特定のキーをリッスンする

Livewireが用意している便利なエイリアスを使うと、キー押下イベントのリスナーを特定のキーやキーの組み合わせに絞り込めます。

例えば検索ボックスへの入力後、ユーザーが`Enter`を押したときに検索を実行するには、`wire:keydown.enter`を使います。

```blade
<input wire:model="query" wire:keydown.enter="searchPosts">
```

最初のエイリアスの後に別のキーエイリアスをつなげると、キーの組み合わせをリッスンできます。例えば、`Shift`キーを押している間だけ`Enter`キーをリッスンするには次のように書きます。

```blade
<input wire:keydown.shift.enter="...">
```

利用できるすべてのキーモディファイアは次のとおりです。

| モディファイア | キー |
|---|---|
| `.shift` | Shift |
| `.enter` | Enter |
| `.space` | Space |
| `.ctrl` | Ctrl |
| `.cmd` | Cmd |
| `.meta` | MacではCmd、WindowsではWindowsキー |
| `.alt` | Alt |
| `.up` | 上矢印 |
| `.down` | 下矢印 |
| `.left` | 左矢印 |
| `.right` | 右矢印 |
| `.escape` | Escape |
| `.tab` | Tab |
| `.caps-lock` | Caps Lock |
| `.equal` | Equal、`=` |
| `.period` | Period、`.` |
| `.slash` | スラッシュ、`/` |

### イベントハンドラのモディファイア

Livewireには、よくあるイベント処理を簡単にする便利なモディファイアもあります。

例えば、イベントリスナー内から`event.preventDefault()`を呼び出す必要がある場合、イベント名に`.prevent`を付けます。

```blade
<input wire:keydown.prevent="...">
```

利用できるすべてのイベントリスナーのモディファイアと、その機能は次のとおりです。

| モディファイア | 機能 |
|---|---|
| `.prevent` | `.preventDefault()`を呼び出すのと同じ |
| `.stop` | `.stopPropagation()`を呼び出すのと同じ |
| `.window` | `window`オブジェクトのイベントをリッスン |
| `.outside` | 要素の「外側」でのクリックだけをリッスン |
| `.document` | `document`オブジェクトのイベントをリッスン |
| `.once` | リスナーが一度だけ呼び出されるようにする |
| `.debounce` | デフォルトで250ミリ秒のデバウンスを行う |
| `.debounce.100ms` | 指定した時間でデバウンスを行う |
| `.throttle` | 少なくとも250ミリ秒ごとにリスナーを呼び出すようスロットルする |
| `.throttle.100ms` | 指定した時間でスロットルする |
| `.self` | 子要素ではなく、この要素で発生したイベントだけでリスナーを呼び出す |
| `.camel` | イベント名をキャメルケースに変換（`wire:custom-event` → `customEvent`） |
| `.dot` | イベント名をドット記法に変換（`wire:custom-event` → `custom.event`） |
| `.passive` | `wire:touchstart.passive`はスクロールのパフォーマンスを妨げない |
| `.capture` | イベントの「キャプチャ」フェーズでリッスン |

`wire:`は内部で[Alpineの](https://alpinejs.dev) `x-on`ディレクティブを使っているため、これらのモディファイアはAlpineによって利用可能になっています。モディファイアをいつ使うべきか詳しく知りたい場合は、[Alpineのイベントドキュメント](https://alpinejs.dev/essentials/events)を参照してください。

### サードパーティイベントを処理する

Livewireでは、サードパーティライブラリが発火するカスタムイベントもリッスンできます。

例えば、プロジェクトで[Trix](https://trix-editor.org/)のリッチテキストエディタを使っていて、`trix-change`イベントをリッスンしてエディタの内容を取得したいとします。その場合は`wire:trix-change`ディレクティブを使います。

```blade
<form wire:submit="save">
    <!-- ... -->

    <trix-editor
        wire:trix-change="setPostContent($event.target.value)"
    ></trix-editor>

    <!-- ... -->
</form>
```

この例では、`trix-change`イベントが発生するたびに`setPostContent`アクションが呼び出され、Trixエディタの現在の値でLivewireコンポーネントの`content`プロパティが更新されます。

> [!info] `$event`でイベントオブジェクトにアクセスできます
> Livewireのイベントハンドラ内では、`$event`でイベントオブジェクトにアクセスできます。これはイベントに関する情報を参照するときに便利です。例えば、`$event.target`でイベントを発生させた要素にアクセスできます。

> [!warning]
> 上のTrixのデモコードは不完全で、イベントリスナーの説明だけを目的としています。そのまま使うと、キーストロークごとにネットワークリクエストが発生します。よりパフォーマンスのよい実装は次のとおりです。
>
> ```blade
> <trix-editor
>    x-on:trix-change="$wire.content = $event.target.value"
>></trix-editor>
> ```

### ディスパッチされたカスタムイベントをリッスンする

アプリケーションがAlpineからカスタムイベントをディスパッチする場合、Livewireでそのイベントをリッスンすることもできます。

```blade
<div wire:custom-event="...">

    <!-- このコンポーネントの深くネストされた場所にある要素: -->
    <button x-on:click="$dispatch('custom-event')">...</button>

</div>
```

上の例でボタンをクリックすると`custom-event`イベントがディスパッチされ、Livewireコンポーネントのルートまでバブルアップします。そこで`wire:custom-event`がイベントを捕捉し、指定されたアクションを呼び出します。

アプリケーションの別の場所からディスパッチされたイベントをリッスンしたい場合は、イベントが`window`オブジェクトまでバブルアップするのを待ち、そこでリッスンする必要があります。Livewireでは、任意のイベントリスナーに`.window`モディファイアを付けるだけで簡単に実現できます。

```blade
<div wire:custom-event.window="...">
    <!-- ... -->
</div>

<!-- コンポーネントの外側、ページ上のどこかでディスパッチ: -->
<button x-on:click="$dispatch('custom-event')">...</button>
```

### フォーム送信中の入力を無効にする

先ほど説明した`CreatePost`の例を考えてみましょう。

```blade
<form wire:submit="save">
    <input wire:model="title">

    <textarea wire:model="content"></textarea>

    <button type="submit">保存</button>
</form>
```

ユーザーが「保存」をクリックすると、Livewireコンポーネント上の`save()`アクションを呼び出すため、サーバーへネットワークリクエストが送信されます。

しかし、ユーザーが遅いインターネット接続でこのフォームに入力しているとします。ユーザーが「保存」をクリックしても、ネットワークリクエストに通常より時間がかかるため、最初は何も起きません。送信に失敗したのかと思い、最初のリクエストがまだ処理中なのに「保存」ボタンをもう一度クリックしてしまうかもしれません。

この場合、同じアクションに対する2つのリクエストが同時に処理されることになります。

この状況を防ぐため、`wire:submit`アクションの処理中は、Livewireが`<form>`要素内の送信ボタンとすべてのフォーム入力を自動的に無効にします。これによりフォームが誤って2回送信されるのを防ぎます。

遅い接続のユーザーの混乱をさらに減らすには、背景色を控えめに変えたりSVGをアニメーションさせたりするなど、ローディングインジケーターを表示するとよいでしょう。

Livewireには、ページ上のどこにでもローディングインジケーターを簡単に表示・非表示にできる`wire:loading`ディレクティブがあります。「保存」ボタンの下にローディングメッセージを表示する短い例を見てみましょう。

```blade
<form wire:submit="save">
    <textarea wire:model="content"></textarea>

    <button type="submit">保存</button>

    <span wire:loading>保存中...</span> <!-- [tl! highlight] -->
</form>
```

別の方法として、TailwindとLivewireが自動的に付与する`data-loading`属性を使って、ローディング状態を直接スタイルできます。

```blade
<form wire:submit="save">
    <textarea wire:model="content"></textarea>

    <button type="submit" class="data-loading:opacity-50">保存</button>

    <span class="not-data-loading:hidden">保存中...</span>
</form>
```

ほとんどの場合、`data-loading`セレクターのほうが`wire:loading`よりも簡単で柔軟です。[ローディング状態について詳しく学ぶ →](/loading-states)

## コンポーネントを更新する

コンポーネントを単純に「更新」したい場合があります。例えば、データベース内の何かの状態を確認するコンポーネントがあり、表示結果を更新できるボタンをユーザーに提供したい場合です。

通常なら自分のコンポーネントメソッドを参照する場所で、Livewireの単純な`$refresh`アクションを使えば実現できます。

```blade
<button type="button" wire:click="$refresh">...</button>
```

`$refresh`アクションが発生すると、Livewireはサーバーとの往復を行い、メソッドを呼び出さずにコンポーネントを再レンダリングします。

コンポーネントに保留中のデータ更新（例えば`wire:model`バインディング）がある場合、コンポーネントの更新時にサーバーへ適用される点に注意してください。

Livewireコンポーネント内では、AlpineJSを使ってコンポーネントの更新を開始することもできます。

```blade
<button type="button" x-on:click="$wire.$refresh()">...</button>
```

[Livewire内でAlpineを使うドキュメント](/alpine)を読んで、さらに詳しく学んでください。

## アクションを確認する

投稿をデータベースから削除するなど、危険な操作をユーザーに許可する場合は、その操作を実行したいか確認するアラートを表示するとよいでしょう。

Livewireでは、`wire:confirm`という単純なディレクティブで簡単に実現できます。

```blade
<button
    type="button"
    wire:click="delete"
    wire:confirm="この投稿を削除してもよいですか？"
>
    投稿を削除 <!-- [tl! highlight:-2,1] -->
</button>
```

Livewireアクションを含む要素に`wire:confirm`を追加すると、ユーザーがそのアクションを実行しようとしたとき、指定したメッセージを含む確認ダイアログが表示されます。「OK」を押してアクションを確認するか、「キャンセル」を押すかEscapeキーを押します。

詳しくは[`wire:confirm`のドキュメントページ](/wire-confirm)を参照してください。

## Alpineからアクションを呼び出す

Livewireは[Alpine](https://alpinejs.dev/)とシームレスに連携します。実際、内部ではすべてのLivewireコンポーネントがAlpineコンポーネントでもあります。これにより、コンポーネント内でAlpineを最大限に活用し、JavaScriptによるクライアント側のインタラクティブ性を追加できます。

この組み合わせをさらに強力にするため、LivewireはAlpineにマジックな`$wire`オブジェクトを公開しています。これはPHPコンポーネントをJavaScriptで表現したものとして扱えます。[`$wire`によるパブリックプロパティへのアクセスと変更](/properties#accessing-properties-from-javascript)に加え、アクションも呼び出せます。`$wire`オブジェクトでアクションを呼び出すと、対応するPHPメソッドがバックエンドのLivewireコンポーネントで呼び出されます。

```blade
<button x-on:click="$wire.save()">投稿を保存</button>
```

もう少し複雑な例として、Alpineの[`x-intersect`](https://alpinejs.dev/plugins/intersect)ユーティリティを使い、要素がページ上で表示されたときに`incrementViewCount()` Livewireアクションを呼び出せます。

```blade
<div x-intersect="$wire.incrementViewCount()">...</div>
```

### パラメータを渡す

`$wire`メソッドに渡したパラメータは、PHPクラスのメソッドにも渡されます。例えば、次のLivewireアクションを考えてみましょう。

```php
public function addTodo($todo)
{
    $this->todos[] = $todo;
}
```

コンポーネントのBladeテンプレート内では、Alpineからこのアクションを呼び出し、アクションに渡すパラメータを指定できます。

```blade
<div x-data="{ todo: '' }">
    <input type="text" x-model="todo">

    <button x-on:click="$wire.addTodo(todo)">Todoを追加</button>
</div>
```

ユーザーがテキスト入力に「ゴミを出す」と入力して「Todoを追加」ボタンを押すと、`$todo`パラメータの値が「ゴミを出す」となった状態で`addTodo()`メソッドが呼び出されます。

### 戻り値を受け取る

さらに強力な機能として、呼び出した`$wire`アクションはネットワークリクエストの処理中にPromiseを返します。サーバーからのレスポンスを受け取ると、そのPromiseはバックエンドのアクションが返した値で解決されます。

例えば、次のアクションを持つLivewireコンポーネントを考えてみましょう。

```php
use App\Models\Post;

public function getPostCount()
{
    return Post::count();
}
```

`$wire`を使うと、アクションを呼び出して返された値を解決できます。

```blade
<span x-init="$el.innerHTML = await $wire.getPostCount()"></span>
```

この例で`getPostCount()`メソッドが「10」を返すと、`<span>`タグにも「10」が入ります。

> [!tip] JavaScriptから利用するアクションには#[Json]を使う
> 主にJavaScriptから利用するアクションには、[`#[Json]`属性](/attribute-json)の使用を検討してください。Promiseの解決・拒否を通じてデータを返し、バリデーションエラーを自動的にPromiseの拒否として処理し、パフォーマンス向上のため再レンダリングを省略します。

Livewireを使うためにAlpineの知識は必要ありません。しかしAlpineは非常に強力なツールであり、Alpineを知ることでLivewireの体験と生産性が向上します。

## JavaScriptアクション

Livewireでは、サーバーリクエストを行わず、完全にクライアント側で実行されるJavaScriptアクションを定義できます。これは次の2つの場面で役立ちます。

1. サーバーとの通信を必要としない、単純なUI更新を行いたい場合
2. サーバーリクエストを行う前に、JavaScriptでUIを楽観的に更新したい場合

JavaScriptアクションを定義するには、コンポーネント内の`<script>`タグで`$js()`関数を使います。

ここでは、JavaScriptアクションでサーバーリクエスト前にUIを楽観的に更新する、投稿のブックマーク例を見てみましょう。JavaScriptアクションは塗りつぶされたブックマークアイコンをすぐに表示し、その後データベースにブックマークを保存するリクエストを行います。

```php
<?php // resources/views/components/post/⚡show.blade.php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public Post $post;

    public $bookmarked = false;

    public function mount()
    {
        $this->bookmarked = $this->post->bookmarkedBy(auth()->user());
    }

    public function bookmarkPost()
    {
        $this->post->bookmark(auth()->user());

        $this->bookmarked = $this->post->bookmarkedBy(auth()->user());
    }
};
```

```blade
<div>
    <button wire:click="$js.bookmark" class="flex items-center gap-1">
        {{-- 輪郭だけのブックマークアイコン... --}}
        <svg wire:show="!bookmarked" wire:cloak xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
        </svg>

        {{-- 塗りつぶしのブックマークアイコン... --}}
        <svg wire:show="bookmarked" wire:cloak xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
            <path fill-rule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clip-rule="evenodd" />
        </svg>
    </button>
</div>

<script>
    this.$js.bookmark = () => {
        $wire.bookmarked = !$wire.bookmarked

        $wire.bookmarkPost()
    }
</script>
```

ユーザーがハートボタンをクリックすると、次の順序で処理されます。

1. `bookmark` JavaScriptアクションが呼び出される
2. クライアント側で`$wire.bookmarked`を切り替え、ハートアイコンがすぐに更新される
3. 変更をデータベースへ保存するため`bookmarkPost()`メソッドが呼び出される

これにより、ブックマークの状態を確実に保存しながら、即座に視覚的なフィードバックを提供できます。

> [!warning] クラスベースコンポーネントには@@scriptラッパーが必要
> 上の例では単独の`<script>`タグを使っています。これはシングルファイルコンポーネントとマルチファイルコンポーネントで機能します。クラスベースコンポーネントを使う場合は、`@@script`ディレクティブでscriptタグを囲む必要があります。
> ```blade
> @@script
> <script>
>     this.$js.bookmark = () => { /* ... */ }
> </script>
> @@endscript
> ```
> これによりJavaScriptがコンポーネントに正しくスコープされます。

### Alpineから呼び出す

Alpineから`$wire`オブジェクトを使って、JavaScriptアクションを直接呼び出せます。例えば、`$wire`オブジェクトを使って`bookmark` JavaScriptアクションを呼び出せます。

```blade
<button x-on:click="$wire.$js.bookmark()">ブックマーク</button>
```

### PHPから呼び出す

PHPから`js()`メソッドを使ってJavaScriptアクションを呼び出すこともできます。

```php
<?php // resources/views/components/post/⚡create.blade.php

use Livewire\Component;

new class extends Component {
    public $title = '';

    public function save()
    {
        // ...

        $this->js('onPostSaved'); // [tl! highlight]
    }
};
```

```blade
<div>
    <!-- ... -->

    <button wire:click="save">保存</button>
</div>

<script>
    this.$js.onPostSaved = () => {
        alert('投稿が正常に保存されました！')
    }
</script>
```

この例では、`save()`アクションが完了すると`postSaved` JavaScriptアクションが実行され、アラートダイアログが表示されます。

## マジックアクション

Livewireには、カスタムメソッドを定義せずにコンポーネントでよくある処理を実行できる「マジック」アクションが用意されています。これらのマジックアクションは、Bladeテンプレートで定義したイベントリスナー内で利用できます。

### `$parent`

`$parent`マジック変数を使うと、子コンポーネントから親コンポーネントのプロパティへアクセスし、親コンポーネントのアクションを呼び出せます。

```blade
<button wire:click="$parent.removePost({{ $post->id }})">削除</button>
```

上の例で親コンポーネントに`removePost()`アクションがある場合、子コンポーネントはBladeテンプレートから`$parent.removePost()`を使って直接呼び出せます。

### `$set`

`$set`マジックアクションを使うと、BladeテンプレートからLivewireコンポーネントのプロパティを直接更新できます。`$set`を使うには、更新するプロパティと新しい値を引数として渡します。

```blade
<button wire:click="$set('query', '')">検索をリセット</button>
```

この例でボタンをクリックするとネットワークリクエストがディスパッチされ、コンポーネントの`$query`プロパティが`''`に設定されます。

### `$refresh`

`$refresh`アクションはLivewireコンポーネントを再レンダリングします。プロパティの値を変更せずにコンポーネントのビューを更新したい場合に便利です。

```blade
<button wire:click="$refresh">更新</button>
```

ボタンをクリックするとコンポーネントが再レンダリングされ、ビューの最新の変更を確認できます。

### `$toggle`

`$toggle`アクションは、Livewireコンポーネントのブール型プロパティの値を切り替えるために使います。

```blade
<button wire:click="$toggle('sortAsc')">
    {{ $sortAsc ? '降順' : '昇順' }}
</button>
```

この例でボタンをクリックすると、`$sortAsc`プロパティが`true`と`false`の間で切り替わります。

### `$dispatch`

`$dispatch`アクションを使うと、ブラウザ上でLivewireイベントを直接ディスパッチできます。次は、クリックすると`post-deleted`イベントをディスパッチするボタンの例です。

```blade
<button type="submit" wire:click="$dispatch('post-deleted')">投稿を削除</button>
```

### `$event`

`$event`アクションは、`wire:click`などのイベントリスナー内で使えます。このアクションを使うと、実際に発生したJavaScriptイベントにアクセスでき、イベントを発生させた要素などの情報を参照できます。

```blade
<input type="text" wire:keydown.enter="search($event.target.value)">
```

ユーザーが上の入力欄で入力中にEnterキーを押すと、入力欄の内容がパラメータとして`search()`アクションに渡されます。

> マジックアクションの詳細は[JavaScriptリファレンス](/javascript#wireオブジェクト)を参照してください。

### Alpineからマジックアクションを使う

`$wire`オブジェクトを使えば、Alpineからマジックアクションを呼び出すこともできます。例えば、`$wire`オブジェクトで`$refresh`マジックアクションを呼び出せます。

```blade
<button x-on:click="$wire.$refresh()">更新</button>
```

## 再レンダリングをスキップする

コンポーネントのアクションを呼び出しても、レンダリングされたBladeテンプレートを変更する副作用がない場合があります。その場合、アクションメソッドの上に`#[Renderless]`属性を追加することで、Livewireのライフサイクルにおける`render`部分をスキップできます。

例として、下の`ShowPost`コンポーネントでは、ユーザーが投稿の末尾までスクロールしたときに「閲覧数」を記録します。

```php
<?php // resources/views/components/post/⚡show.blade.php

use Livewire\Attributes\Renderless;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public Post $post;

    public function mount(Post $post)
    {
        $this->post = $post;
    }

    #[Renderless] // [tl! highlight]
    public function incrementViewCount()
    {
        $this->post->incrementViewCount();
    }
};
```

```blade
<div>
    <h1>{{ $post->title }}</h1>
    <p>{{ $post->content }}</p>

    <div wire:intersect="incrementViewCount"></div>
</div>
```

上の例では`wire:intersect`を使い、要素がビューポートに入ったとき（通常はユーザーがページ下部の要素までスクロールしたことを検知するとき）にアクションを呼び出しています。

このように、ユーザーが投稿の末尾までスクロールすると`incrementViewCount()`が呼び出されます。アクションに`#[Renderless]`を追加しているため、閲覧数は記録されますがテンプレートは再レンダリングされず、ページのどの部分も影響を受けません。

メソッド属性を使いたくない場合や、条件によってレンダリングをスキップする必要がある場合は、コンポーネントのアクション内で`skipRender()`メソッドを呼び出せます。

```php
<?php // resources/views/components/post/⚡show.blade.php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public Post $post;

    public function mount(Post $post)
    {
        $this->post = $post;
    }

    public function incrementViewCount()
    {
        $this->post->incrementViewCount();

        $this->skipRender(); // [tl! highlight]
    }
};
```

`.renderless`モディファイアを使えば、要素から直接レンダリングをスキップすることもできます。

```blade
<button type="button" wire:click.renderless="incrementViewCount">
```

## asyncによる並列実行

デフォルトでは、予測可能な状態更新を確実にするため、Livewireは同じコンポーネント内のアクションを直列化します。1つのアクションが実行中の場合、後続のアクションはキューに入り、完了を待ちます。これにより競合状態を防ぎ、コンポーネントの状態を一貫させられますが、待たずにアクションをすぐ実行したい場合、つまり順次実行ではなく並列実行したい場合もあります。

`#[Async]`属性と`wire:click.async`モディファイアを使うと、通常のリクエストキューを迂回してアクションを並列実行するようLivewireに指示できます。

### asyncモディファイアを使う

イベントリスナーに`.async`モディファイアを付けると、任意のアクションをasyncにできます。

```blade
<button wire:click.async="logActivity">イベントを記録</button>
```

このボタンをクリックすると、他のリクエストが実行中でも`logActivity`アクションはすぐに発火します。このアクションは後続のリクエストを妨げず、他のリクエストから妨げられることもありません。

### Async属性を使う

別の方法として、`#[Async]`属性を使ってメソッドをasyncとしてマークできます。これにより、どこから呼び出してもアクションがasyncになります。

```php
<?php // resources/views/components/post/⚡show.blade.php

use Livewire\Attributes\Async;
use Livewire\Component;

new class extends Component {
    public Post $post;

    #[Async]
    public function logActivity()
    {
        Activity::log('post-viewed', $this->post);
    }

    // ...
};
```

```blade
<div wire:intersect="logActivity">
    <!-- ... -->
</div>
```

この例では、要素がビューポートに入ると`logActivity()`が非同期に呼び出され、実行中の他のリクエストを妨げません。

### asyncアクションを使う場合

asyncアクションは、結果がページに表示される内容へ影響しない、fire-and-forget型の操作に適しています。一般的な用途には次のようなものがあります。

- **アナリティクスとロギング:** ユーザー行動、ページビュー、インタラクションの追跡
- **バックグラウンド処理:** ジョブの起動、通知の送信、外部サービスの更新
- **JavaScriptだけで使う結果:** JavaScriptだけで利用する`await $wire.getData()`によるデータ取得

外部リンクをユーザーがクリックしたことを追跡する例を見てみましょう。

```php
<?php

use Livewire\Attributes\Async;
use Livewire\Component;

new class extends Component {
    public $url;

    #[Async]
    public function trackClick()
    {
        Analytics::track('external-link-clicked', [
            'url' => $this->url,
            'user_id' => auth()->id(),
        ]);
    }

    // ...
};
```

```blade
<a href="{{ $url }}" target="_blank" wire:click.async="trackClick">
    外部サイトを訪問
</a>
```

追跡処理は非同期で行われるため、ユーザーのクリックがネットワークリクエストによって遅延することはありません。

### asyncアクションを使わない場合

> [!warning] asyncアクションと状態変更は相性が悪い
> **UIに反映されるコンポーネントの状態を変更する場合、asyncアクションは絶対に使わないでください。** asyncアクションは並列で実行されるため、予測できない競合状態が発生し、複数の同時リクエスト間でコンポーネントの状態が食い違う可能性があります。

次の危険な例を考えてみましょう。

```php
// 警告: このスニペットは、してはいけないことを示す例です...

<?php // resources/views/components/⚡counter.blade.php

use Livewire\Attributes\Async;
use Livewire\Component;

new class extends Component {
    public $count = 0;

    #[Async] // これは行わないでください！
    public function increment()
    {
        $this->count++; // asyncアクション内での状態変更
    }

    // ...
};
```

ユーザーが増加ボタンを素早くクリックすると、複数のasyncリクエストが同時に発生します。各リクエストは同じ初期`$count`値から開始するため、更新が失われます。5回クリックしたのに、カウンターが1しか増えないことがあります。

**経験則:** asyncは純粋な副作用、つまりコンポーネントのビューに影響するプロパティを変更しない操作だけに使ってください。

### JavaScriptのためにデータを取得する

もう1つの正当な用途は、コンポーネントのレンダリング状態に影響を与えず、完全にJavaScriptで利用するサーバー上のデータを取得することです。

```php
<?php

use Livewire\Attributes\Async;
use Livewire\Component;

new class extends Component {
    #[Async]
    public function fetchSuggestions($query)
    {
        return Post::where('title', 'like', "%{$query}%")
            ->limit(5)
            ->pluck('title');
    }

    // ...
};
```

```blade
<div x-data="{ suggestions: [] }">
    <input
        type="text"
        x-on:input.debounce="suggestions = await $wire.fetchSuggestions($event.target.value)"
    >

    <template x-for="suggestion in suggestions">
        <div x-text="suggestion"></div>
    </template>
</div>
```

候補はAlpineの`suggestions`データだけに保存され、Livewireのコンポーネント状態には保存されないため、非同期で取得しても安全です。

## スクロール位置を保持する

コンテンツを更新すると、ブラウザが別のスクロール位置へ移動することがあります。`.preserve-scroll`モディファイアは、更新中も現在のスクロール位置を維持します。

```blade
<button wire:click.preserve-scroll="loadMore">さらに読み込む</button>

<select wire:model.live.preserve-scroll="category">...</select>
```

これは、ページが移動してほしくない無限スクロール、フィルター、動的なコンテンツ更新に便利です。

## セキュリティ上の注意点

Livewireコンポーネントのpublicメソッドは、呼び出す`wire:click`ハンドラが対応付けられていなくても、クライアント側から呼び出せることを忘れないでください。このような場合でも、ユーザーはブラウザのDevToolsからアクションを実行できます。

以下では、Livewireコンポーネントで見落としやすい脆弱性を3つ紹介します。それぞれ、最初に脆弱なコンポーネントを示し、その後に安全なコンポーネントを示します。練習として、解決策を見る前に最初の例の脆弱性を見つけてみてください。

脆弱性を見つけるのが難しく、自分のアプリケーションを安全に保てるか不安になったとしても、これらの脆弱性はリクエストとコントローラーを使う標準的なWebアプリケーションにもすべて当てはまることを覚えておいてください。コンポーネントメソッドをコントローラーメソッドの代理として使い、そのパラメータをリクエスト入力の代理として使うなら、既存のアプリケーションセキュリティの知識をLivewireコードにも適用できるはずです。

### アクションのパラメータを必ず認可する

コントローラーのリクエスト入力と同様、アクションのパラメータは任意のユーザー入力であるため、必ず認可することが重要です。

以下は、ユーザーが自分の投稿を1ページですべて表示できる`ShowPosts`コンポーネントです。投稿にある「削除」ボタンの1つを使って、好きな投稿を削除できます。

これは脆弱なコンポーネントです。

```php
<?php // resources/views/components/post/⚡index.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Computed]
    public function posts()
    {
        return Auth::user()->posts;
    }

    public function delete($id)
    {
        $post = Post::find($id);

        $post->delete();
    }
};
```

```blade
<div>
    @foreach ($this->posts as $post)
        <div wire:key="{{ $post->id }}">
            <h1>{{ $post->title }}</h1>
            <span>{{ $post->content }}</span>

            <button wire:click="delete({{ $post->id }})">削除</button>
        </div>
    @endforeach
</div>
```

悪意のあるユーザーはJavaScriptコンソールから`delete()`を直接呼び出し、アクションに好きなパラメータを渡せることを覚えておいてください。つまり、自分の投稿を見ているユーザーが、所有していない投稿のIDを`delete()`に渡すことで、別のユーザーの投稿を削除できます。

これを防ぐには、削除しようとしている投稿をユーザーが所有していることを認可する必要があります。

```php
<?php // resources/views/components/post/⚡index.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Computed]
    public function posts()
    {
        return Auth::user()->posts;
    }

    public function delete($id)
    {
        $post = Post::find($id);

        $this->authorize('delete', $post); // [tl! highlight]

        $post->delete();
    }
};
```

### サーバー側で必ず認可する

標準的なLaravelコントローラーと同様、Livewireアクションは、UIからアクションを呼び出す手段がなくても、すべてのユーザーが呼び出せます。

次の`BrowsePosts`コンポーネントを考えてみましょう。誰でもアプリケーション内のすべての投稿を閲覧できますが、投稿を削除できるのは管理者だけです。

```php
<?php // resources/views/components/post/⚡index.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Computed]
    public function posts()
    {
        return Auth::user()->posts;
    }

    public function deletePost($id)
    {
        $post = Post::find($id);

        $post->delete();
    }
};
```

```blade
<div>
    @foreach ($this->posts as $post)
        <div wire:key="{{ $post->id }}">
            <h1>{{ $post->title }}</h1>
            <span>{{ $post->content }}</span>

            @if (Auth::user()->isAdmin())
                <button wire:click="deletePost({{ $post->id }})">削除</button>
            @endif
        </div>
    @endforeach
</div>
```

ご覧のとおり、「削除」ボタンを表示できるのは管理者だけです。しかし、どのユーザーでもブラウザのDevToolsからコンポーネントの`deletePost()`を呼び出せます。

この脆弱性を修正するには、次のようにサーバー側でアクションを認可します。

```php
<?php // resources/views/components/post/⚡index.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Computed]
    public function posts()
    {
        return Auth::user()->posts;
    }

    public function deletePost($id)
    {
        if (! Auth::user()->isAdmin) { // [tl! highlight:2]
            abort(403);
        }

        $post = Post::find($id);

        $post->delete();
    }
};
```

この変更により、このコンポーネントから投稿を削除できるのは管理者だけになります。

### 危険なメソッドはprotectedまたはprivateにする

Livewireコンポーネント内のすべてのpublicメソッドは、クライアントから呼び出せます。`wire:click`ハンドラから参照していないメソッドも同様です。クライアント側から呼び出すことを意図していないメソッドをユーザーに呼び出されないようにするには、`protected`または`private`にしてください。これにより、その機密性の高いメソッドの可視性がコンポーネントのクラスとサブクラスに制限され、クライアント側から呼び出せなくなります。

先ほどの`BrowsePosts`の例を考えてみましょう。ユーザーはアプリケーション内のすべての投稿を閲覧できますが、投稿を削除できるのは管理者だけです。[サーバー側で必ず認可する](/actions#always-authorize-server-side)セクションでは、サーバー側の認可を追加してアクションを安全にしました。ここで、コードを簡単にするため、投稿の実際の削除処理を専用メソッドにリファクタリングしたとします。

```php
// 警告: このスニペットは、してはいけないことを示す例です...
<?php // resources/views/components/post/⚡index.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Computed]
    public function posts()
    {
        return Auth::user()->posts;
    }

    public function deletePost($id)
    {
        if (! Auth::user()->isAdmin) {
            abort(403);
        }

        $this->delete($id); // [tl! highlight]
    }

    public function delete($postId)  // [tl! highlight:5]
    {
        $post = Post::find($postId);

        $post->delete();
    }
};
```

```blade
<div>
    @foreach ($posts as $post)
        <div wire:key="{{ $post->id }}">
            <h1>{{ $post->title }}</h1>
            <span>{{ $post->content }}</span>

            <button wire:click="deletePost({{ $post->id }})">削除</button>
        </div>
    @endforeach
</div>
```

ご覧のとおり、投稿の削除ロジックを`delete()`という名前の専用メソッドにリファクタリングしました。このメソッドはテンプレートのどこからも参照されていませんが、ユーザーがその存在を知れば、`public`なのでブラウザのDevToolsから呼び出せます。

これを解決するには、メソッドを`protected`または`private`にします。メソッドを`protected`または`private`にすると、ユーザーが呼び出そうとしたときにエラーが発生します。

```php
<?php // resources/views/components/post/⚡index.blade.php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Computed]
    public function posts()
    {
        return Auth::user()->posts;
    }

    public function deletePost($id)
    {
        if (! Auth::user()->isAdmin) {
            abort(403);
        }

        $this->delete($id);
    }

    protected function delete($postId) // [tl! highlight]
    {
        $post = Post::find($postId);

        $post->delete();
    }
};
```

<!--
## ミドルウェアを適用する

デフォルトでは、初回のページ読み込みリクエストに認証・認可関連のミドルウェアが適用されていた場合、Livewireは後続のリクエストにもそのミドルウェアを再適用します。

例えば、`auth`ミドルウェアが割り当てられたルート内でコンポーネントが読み込まれ、ユーザーのセッションが終了したとします。ユーザーが別のアクションを実行すると、`auth`ミドルウェアが再適用され、ユーザーはエラーを受け取ります。

特定のアクションに特定のミドルウェアを適用したい場合は、`#[Middleware]`属性を使えます。例えば、投稿を作成するアクションに`LogPostCreation`ミドルウェアを適用できます。

```php
<?php

namespace App\Livewire;

use App\Http\Middleware\LogPostCreation;
use Livewire\Component;

class CreatePost extends Component
{
    public $title;

    public $content;

    #[Middleware(LogPostCreation::class)] // [tl! highlight]
    public function save()
    {
        // 投稿を作成...
    }

    // ...
}
```

これで`LogPostCreation`ミドルウェアは`createPost`アクションにだけ適用され、ユーザーが新しい投稿を作成したときだけアクティビティが記録されます。

-->

## 関連項目

- **[イベント](/events)** — イベントを使ってコンポーネント間で通信する
- **[フォーム](/forms)** — アクションでフォーム送信を処理する
- **[ローディング状態](/loading-states)** — アクション処理中のフィードバックを表示する
- **[wire:click](/wire-click)** — ボタンのクリックからアクションを呼び出す
- **[バリデーション](/validation)** — アクション処理前にデータを検証する

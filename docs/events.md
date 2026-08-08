# イベント

Livewireには、ページ上の異なるコンポーネント間で通信するための堅牢なイベントシステムがあります。内部ではブラウザイベントを使っているため、LivewireのイベントシステムをAlpineコンポーネントや、通常の素のJavaScriptとの通信にも使えます。

イベントを発生させるには、コンポーネント内のどこからでも`dispatch()`メソッドを使い、ページ上の別のコンポーネントからそのイベントをリッスンします。

## イベントをディスパッチする

Livewireコンポーネントからイベントをディスパッチするには、`dispatch()`メソッドを呼び出し、イベント名とイベントと一緒に送りたい追加データを渡します。

以下は、`post.create`コンポーネントから`post-created`イベントをディスパッチする例です。

```php
<?php // resources/views/components/post/⚡create.blade.php

use Livewire\Component;

new class extends Component {
    public function save()
    {
		// ...

		$this->dispatch('post-created'); // [tl! highlight]
    }
};
```

この例では、`dispatch()`メソッドが呼び出されると`post-created`イベントがディスパッチされ、ページ上でこのイベントをリッスンしている他のすべてのコンポーネントに通知されます。

イベントと一緒に追加データを渡すには、`dispatch()`メソッドの2番目のパラメータとしてデータを渡します。

```php
$this->dispatch('post-created', title: $post->title);
```

## イベントをリッスンする

Livewireコンポーネントでイベントをリッスンするには、イベントがディスパッチされたときに呼び出したいメソッドの上に`#[On]`属性を追加します。

> [!warning] Attributeクラスをインポートする
> Attributeクラスを必ずインポートしてください。例えば、下の`#[On()]`属性には`use Livewire\Attributes\On;`のインポートが必要です。

```php
<?php // resources/views/components/⚡dashboard.blade.php

use Livewire\Component;
use Livewire\Attributes\On; // [tl! highlight]

new class extends Component {
	#[On('post-created')] // [tl! highlight]
    public function updatePostList($title)
    {
		// ...
    }
};
```

これで`post.create`から`post-created`イベントがディスパッチされると、ネットワークリクエストが発生し、`updatePostList()`アクションが呼び出されます。

ご覧のとおり、イベントと一緒に送信した追加データは、アクションの最初の引数として渡されます。

### 動的なイベント名をリッスンする

コンポーネントのデータを使って、実行時にイベントリスナー名を動的に生成したい場合があります。

例えば、特定のEloquentモデルにイベントリスナーを限定したい場合、次のようにディスパッチ時のイベント名にモデルのIDを追加します。

```php
<?php // resources/views/components/post/⚡edit.blade.php

use Livewire\Component;

new class extends Component {
    public function update()
    {
        // ...

        $this->dispatch("post-updated.{$post->id}"); // [tl! highlight]
    }
};
```

そして、その特定のモデルをリッスンします。

```php
<?php // resources/views/components/post/⚡show.blade.php

use Livewire\Attributes\On; // [tl! highlight]
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public Post $post;

	#[On('post-updated.{post.id}')] // [tl! highlight]
    public function refreshPost()
    {
		// ...
    }
};
```

上の`$post`モデルのIDが`3`なら、`refreshPost()`メソッドは`post-updated.3`という名前のイベントによってだけ呼び出されます。

### 特定の子コンポーネントからのイベントをリッスンする

Bladeテンプレートで、個別の子コンポーネントから直接イベントをリッスンできます。

```blade
<div>
    <livewire:edit-post @saved="$refresh">

    <!-- ... -->
</div>
```

上のシナリオで`edit-post`子コンポーネントが`saved`イベントをディスパッチすると、親の`$refresh`が呼び出され、親が更新されます。

`$refresh`の代わりに、`wire:click`のような場所で通常渡す任意のメソッドを渡せます。例えば、モーダルダイアログを閉じるような`close()`メソッドを呼び出す例です。

```blade
<livewire:edit-post @saved="close">
```

子がリクエストと一緒にパラメータをディスパッチした場合、例えば`$this->dispatch('saved', postId: 1)`のような場合は、次の構文で親メソッドへ値を転送できます。

```blade
<livewire:edit-post @saved="close($event.detail.postId)">
```

## JavaScriptでイベントを操作する

アプリケーション内のJavaScriptからイベントシステムを操作すると、Livewireのイベントシステムはさらに強力になります。これにより、アプリケーション内の他のJavaScriptからページ上のLivewireコンポーネントへ通信できます。

### コンポーネントスクリプト内でイベントをリッスンする

次のように、`<script>`タグからコンポーネントのテンプレート内で`post-created`イベントを簡単にリッスンできます。

```html
<script>
    this.$on('post-created', () => {
        //
    });
</script>
```

上のスニペットは、登録されたコンポーネントからの`post-created`をリッスンします。コンポーネントがページ上からなくなると、イベントリスナーも呼び出されなくなります。

[Livewireコンポーネント内でJavaScriptを使う方法を詳しく読む →](https://livewire.laravel.com/docs/4.x/javascript#using-javascript-in-livewire-components)

### コンポーネントスクリプトからイベントをディスパッチする

コンポーネントの`<script>`タグ内からイベントをディスパッチすることもできます。

```html
<script>
    this.$dispatch('post-created');
</script>
```

上のスクリプトを実行すると、定義されたコンポーネントへ`post-created`イベントがディスパッチされます。

スクリプトが存在するコンポーネントだけにイベントを送り、ページ上の他のコンポーネントには送らない（イベントが「バブルアップ」するのを防ぐ）には、`dispatchSelf()`を使います。

```js
this.$dispatchSelf('post-created');
```

イベントに追加パラメータを渡すには、`dispatch()`の2番目の引数としてオブジェクトを渡します。

```html
<script>
    this.$dispatch('post-created', { refreshPosts: true });
</script>
```

これでLivewireクラスと、他のJavaScriptイベントリスナーの両方からイベントパラメータにアクセスできます。

Livewireクラス内で`refreshPosts`パラメータを受け取る例は次のとおりです。

```php
use Livewire\Attributes\On;

// ...

#[On('post-created')]
public function handleNewPost($refreshPosts = false)
{
    //
}
```

JavaScriptイベントリスナーからは、イベントの`detail`プロパティを使って`refreshPosts`パラメータにアクセスできます。

```html
<script>
    this.$on('post-created', (event) => {
        let refreshPosts = event.detail.refreshPosts

        // ...
    });
</script>
```

[Livewireコンポーネント内でJavaScriptを使う方法を詳しく読む →](https://livewire.laravel.com/docs/4.x/javascript#using-javascript-in-livewire-components)

### グローバルJavaScriptからLivewireイベントをリッスンする

別の方法として、アプリケーションのどのスクリプトからでも`Livewire.on`を使い、Livewireイベントをグローバルにリッスンできます。

```html
<script>
    document.addEventListener('livewire:init', () => {
       Livewire.on('post-created', (event) => {
           //
       });
    });
</script>
```

上のスニペットは、ページ上の任意のコンポーネントからディスパッチされた`post-created`イベントをリッスンします。

何らかの理由でこのイベントリスナーを削除したい場合は、返された`cleanup`関数を使います。

```html
<script>
    document.addEventListener('livewire:init', () => {
        let cleanup = Livewire.on('post-created', (event) => {
            //
        });

        // 「cleanup()」を呼ぶと上のイベントリスナーを登録解除できます...
        cleanup();
    });
</script>
```

## Alpineでイベントを扱う

Livewireのイベントは内部では通常のブラウザイベントなので、Alpineでリッスンしたり、ディスパッチしたりできます。

### AlpineでLivewireイベントをリッスンする

例えば、Alpineで`post-created`イベントを簡単にリッスンできます。

```blade
<div x-on:post-created="..."></div>
```

上のスニペットは、`x-on`ディレクティブを割り当てたHTML要素の子である、Livewireコンポーネントからの`post-created`イベントをリッスンします。

ページ上のすべてのLivewireコンポーネントからのイベントをリッスンするには、リスナーに`.window`を追加します。

```blade
<div x-on:post-created.window="..."></div>
```

イベントと一緒に送信された追加データにアクセスするには、`$event.detail`を使います。

```blade
<div x-on:post-created="notify('新しい投稿: ' + $event.detail.title)"></div>
```

Alpineのドキュメントには、[イベントをリッスンする方法](https://alpinejs.dev/directives/on)についてさらに詳しい情報があります。

### AlpineからLivewireイベントをディスパッチする

Alpineからディスパッチしたイベントは、Livewireコンポーネントで捕捉できます。

例えば、Alpineから`post-created`イベントを簡単にディスパッチできます。

```blade
<button x-on:click="$dispatch('post-created')">...</button>
```

Livewireの`dispatch()`メソッドと同様に、メソッドの2番目のパラメータとしてデータを渡すことで、イベントと一緒に追加データを渡せます。

```blade
<button x-on:click="$dispatch('post-created', { title: '投稿タイトル' })">...</button>
```

Alpineでイベントをディスパッチする方法について詳しくは、[Alpineのドキュメント](https://alpinejs.dev/magics/dispatch)を参照してください。

> [!tip] イベントは必要ないかもしれません
> 子から親の処理を呼び出すためにイベントを使っている場合、Bladeテンプレートで子から`$parent`を使ってアクションを直接呼び出せます。例えば次のようにします。
>
> ```blade
> <button wire:click="$parent.showCreatePostForm()">投稿作成フォームを表示</button>
> ```
>
> [$parentについて詳しく学ぶ](/nesting#子から親へ直接アクセスする)

## 別のコンポーネントへ直接ディスパッチする

ページ上の2つのコンポーネント間で直接通信するためにイベントを使いたい場合は、`dispatch()->to()`モディファイアを使います。

以下は、`post.create`コンポーネントが`post-created`イベントを`dashboard`コンポーネントへ直接ディスパッチし、そのイベントをリッスンしている他のコンポーネントをスキップする例です。

```php
<?php // resources/views/components/post/⚡create.blade.php

use Livewire\Component;

new class extends Component {
    public function save()
    {
		// ...

		$this->dispatch('post-created')->to(component: Dashboard::class);
    }
};
```

## コンポーネント自身にイベントをディスパッチする

`dispatch()->self()`モディファイアを使うと、イベントを発生させたコンポーネントだけがイベントを捕捉するよう制限できます。

```php
<?php // resources/views/components/post/⚡create.blade.php

use Livewire\Component;

new class extends Component {
    public function save()
    {
		// ...

		$this->dispatch('post-created')->to(self: true);
    }
};
```

## Bladeテンプレートからイベントをディスパッチする

JavaScriptの`$dispatch`関数を使って、Bladeテンプレートから直接イベントをディスパッチできます。ボタンのクリックなど、ユーザー操作からイベントを発生させたい場合に便利です。

```blade
<button wire:click="$dispatch('show-post-modal', { id: {{ $post->id }} })">
    EditPost
</button>
```

この例では、ボタンをクリックすると指定したデータとともに`show-post-modal`イベントがディスパッチされます。

イベントを別のコンポーネントへ直接ディスパッチしたい場合は、JavaScriptの`$dispatchTo()`関数を使います。

```blade
<button wire:click="$dispatchTo('posts', 'show-post-modal', { id: {{ $post->id }} })">
    EditPost
</button>
```

この例では、ボタンをクリックすると`Posts`コンポーネントへ`show-post-modal`イベントが直接ディスパッチされます。

## ディスパッチしたイベントをテストする

コンポーネントがディスパッチしたイベントをテストするには、Livewireテストで`assertDispatched()`メソッドを使います。このメソッドは、コンポーネントのライフサイクル中に特定のイベントがディスパッチされたことを確認します。

```php
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Livewire\CreatePost;
use Livewire\Livewire;

class CreatePostTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_dispatches_post_created_event()
    {
        Livewire::test(CreatePost::class)
            ->call('save')
            ->assertDispatched('post-created');
    }
}
```

この例では、`post.create`コンポーネントで`save()`メソッドを呼び出したとき、指定されたデータとともに`post-created`イベントがディスパッチされることをテストしています。

### イベントリスナーをテストする

イベントリスナーをテストするには、テスト環境からイベントをディスパッチし、イベントに応じて期待するアクションが実行されることを確認します。

```php
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Livewire\Dashboard;
use Livewire\Livewire;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_updates_post_count_when_a_post_is_created()
    {
        Livewire::test(Dashboard::class)
            ->assertSee('Posts created: 0')
            ->dispatch('post-created')
            ->assertSee('Posts created: 1');
    }
}
```

この例では、テストが`post-created`イベントをディスパッチし、`dashboard`コンポーネントがイベントを正しく処理して更新された件数を表示することを確認しています。

## Laravel Echoによるリアルタイムイベント

Livewireは[Laravel Echo](https://laravel.com/docs/broadcasting#client-side-installation)と組み合わせることで、WebSocketを使ったWebページのリアルタイム機能を提供します。

> [!warning] Laravel Echoのインストールが前提です
> この機能は、Laravel Echoがインストールされ、アプリケーションで`window.Echo`オブジェクトがグローバルに利用できることを前提としています。Echoのインストールについて詳しくは、[Laravel Echoのドキュメント](https://laravel.com/docs/broadcasting#client-side-installation)を参照してください。

### Echoイベントをリッスンする

Laravelアプリケーションに`OrderShipped`というイベントがあるとします。

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderShipped implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Order $order;

    public function broadcastOn()
    {
        return new Channel('orders');
    }
}
```

アプリケーションの別の場所から、このイベントを次のようにディスパッチできます。

```php
use App\Events\OrderShipped;

OrderShipped::dispatch();
```

Laravel Echoだけを使ってJavaScriptでこのイベントをリッスンする場合は、次のようになります。

```js
Echo.channel('orders')
    .listen('OrderShipped', e => {
        console.log(e.order)
    })
```

Laravel Echoをインストールして設定済みであれば、Livewireコンポーネント内からこのイベントをリッスンできます。

以下は、ユーザーに新しい注文を視覚的に知らせるため、`OrderShipped`イベントをリッスンする`order-tracker`コンポーネントの例です。

```php
<?php // resources/views/components/⚡order-tracker.blade.php

use Livewire\Attributes\On; // [tl! highlight]
use Livewire\Component;

new class extends Component {
    public $showNewOrderNotification = false;

    #[On('echo:orders,OrderShipped')]
    public function notifyNewOrder()
    {
        $this->showNewOrderNotification = true;
    }

    // ...
};
```

Echoチャンネルに変数（Order IDなど）が埋め込まれている場合、`#[On]`属性の代わりに`getListeners()`メソッドでリスナーを定義できます。

```php
<?php // resources/views/components/⚡order-tracker.blade.php

use Livewire\Attributes\On; // [tl! highlight]
use Livewire\Component;
use App\Models\Order;

new class extends Component {
    public Order $order;

    public $showOrderShippedNotification = false;

    public function getListeners()
    {
        return [
            "echo:orders.{$this->order->id},OrderShipped" => 'notifyShipped',
        ];
    }

    public function notifyShipped()
    {
        $this->showOrderShippedNotification = true;
    }

    // ...
};
```

また、動的なイベント名の構文を使うこともできます。

```php
#[On('echo:orders.{order.id},OrderShipped')]
public function notifyNewOrder()
{
    $this->showNewOrderNotification = true;
}
```

イベントのペイロードにアクセスする必要がある場合は、渡される`$event`パラメータを使います。

```php
#[On('echo:orders.{order.id},OrderShipped')]
public function notifyNewOrder($event)
{
    $order = Order::find($event['orderId']);

    //
}
```

### broadcastAs()でブロードキャストイベント名をカスタマイズする

デフォルトでは、Laravelはイベントクラス名を使ってイベントをブロードキャストします。ただし、イベントクラスに`broadcastAs()`メソッドを実装して、ブロードキャストイベント名をカスタマイズできます。

例えば、`ScoreSubmitted`イベントを`score.submitted`としてブロードキャストしたいとします。

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ScoreSubmitted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function broadcastOn()
    {
        return new Channel('scores');
    }

    public function broadcastAs(): string
    {
        return 'score.submitted';
    }
}
```

Livewireコンポーネントでこのイベントをリッスンするときは、クラス名ではなく`broadcastAs()`が返すカスタムブロードキャスト名を使います。**重要:** カスタムブロードキャスト名を使う場合は、名前空間付きイベントクラス名と区別するため、先頭にドット（`.`）を付ける必要があります。これは[Laravel Echoの規約](https://laravel.com/docs/broadcasting#broadcast-name)です。

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\On;
use Livewire\Component;

class ScoreBoard extends Component
{
    public $scores = [];

    #[On('echo:scores,.score.submitted')]
    public function handleScoreSubmitted($event)
    {
        $this->scores[] = $event['score'];
    }
}
```

上の例では、Livewireコンポーネントは`ScoreSubmitted`（クラス名）ではなく、`.score.submitted`（先頭にドットを付けたカスタムブロードキャスト名）をリッスンしています。先頭のドットはLaravel Echoに、アプリケーションの名前空間（`App\Events`）をイベント名に付けないよう伝えます。

動的なチャンネル名でもカスタムブロードキャスト名を使えます。

```php
#[On('echo:scores.{game.id},.score.submitted')]
public function handleScoreSubmitted($event)
{
    $this->scores[] = $event['score'];
}
```

### プライベートチャンネルとプレゼンスチャンネル

プライベートチャンネルやプレゼンスチャンネルへブロードキャストされたイベントもリッスンできます。

> [!info]
> 先に進む前に、ブロードキャストチャンネルの<a href="https://laravel.com/docs/master/broadcasting#defining-authorization-callbacks">認証コールバック</a>を定義していることを確認してください。

```php
<?php // resources/views/components/⚡order-tracker.blade.php

use Livewire\Component;

new class extends Component {
    public $showNewOrderNotification = false;

    public function getListeners()
    {
        return [
            // パブリックチャンネル
            "echo:orders,OrderShipped" => 'notifyNewOrder',

            // プライベートチャンネル
            "echo-private:orders,OrderShipped" => 'notifyNewOrder',

            // プレゼンスチャンネル
            "echo-presence:orders,OrderShipped" => 'notifyNewOrder',
            "echo-presence:orders,here" => 'notifyNewOrder',
            "echo-presence:orders,joining" => 'notifyNewOrder',
            "echo-presence:orders,leaving" => 'notifyNewOrder',
        ];
    }

    public function notifyNewOrder()
    {
        $this->showNewOrderNotification = true;
    }
};
```

## 関連項目

- **[ネスト](/nesting)** — 親コンポーネントと子コンポーネント間で通信する
- **[アクション](/actions)** — コンポーネントのアクションからイベントを発生させる
- **[Alpine](https://livewire.laravel.com/docs/4.x/alpine)** — Alpineでイベントをディスパッチし、リッスンする
- **[On Attribute](https://livewire.laravel.com/docs/4.x/attribute-on)** — `#[On]`属性でイベントをリッスンする

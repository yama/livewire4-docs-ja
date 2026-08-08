# イベント

Livewireには、ページ上のコンポーネント間で通信するためのイベントシステムがあります。内部ではブラウザーイベントを使うため、Alpineコンポーネントや通常のJavaScriptとも通信できます。

## イベントをディスパッチする

コンポーネント内のどこからでも`dispatch()`を呼び出し、イベント名と追加データを渡せます。

```php
public function save()
{
    $this->dispatch('post-created', title: $this->post->title);
}
```

## イベントをリッスンする

イベントを受け取るメソッドの上に`#[On]` Attributeを追加します。

```php
use Livewire\Attributes\On;

#[On('post-created')]
public function updatePostList($title)
{
    // ...
}
```

Attributeクラスを必ずimportしてください。イベント名には実行時の値を埋め込めます。

```php
#[On('post-updated.{post.id}')]
public function refreshPost()
{
    // ...
}
```

子コンポーネントのイベントを、Bladeのコンポーネントタグ上で直接受け取ることもできます。

```blade
<livewire:edit-post @saved="$refresh" />
<livewire:edit-post @saved="close($event.detail.postId)" />
```

## JavaScriptからイベントを扱う

コンポーネント内の`<script>`から`this.$on()`でリッスンし、`this.$dispatch()`でディスパッチできます。イベントを自分自身だけに届けるには`this.$dispatchSelf()`を使います。

```html
<script>
    this.$on('post-created', (event) => {
        console.log(event.detail.title)
    })

    this.$dispatch('post-created', { refreshPosts: true })
</script>
```

アプリケーション全体からは`Livewire.on()`を使います。戻り値の`cleanup`関数でリスナーを解除できます。

```html
<script>
    document.addEventListener('livewire:init', () => {
        let cleanup = Livewire.on('post-created', (event) => {})
        cleanup()
    })
</script>
```

## Alpineでイベントを扱う

Livewireイベントはブラウザーイベントなので、Alpineの`x-on`でリッスンできます。

```blade
<div x-on:post-created="..." />
<div x-on:post-created.window="..." />
<div x-on:post-created="notify($event.detail.title)" />
```

Alpineからは`$dispatch()`でLivewireイベントを発生させます。

```blade
<button x-on:click="$dispatch('post-created')">作成</button>
```

親の処理を子から呼ぶだけなら、イベントではなくBladeの`$parent`を使える場合があります。

```blade
<button wire:click="$parent.showCreatePostForm()">投稿を作成</button>
```

## 特定のコンポーネントへ送る

`dispatch()->to()`で対象コンポーネントを指定できます。自分自身だけに送る場合は`dispatch()->self()`を使います。

```php
$this->dispatch('post-created')->to(component: Dashboard::class);
$this->dispatch('post-created')->to(self: true);
```

Bladeからは`$dispatchTo()`を使います。

```blade
<button wire:click="$dispatchTo('posts', 'show-post-modal', { id: {{ $post->id }} })">
    編集
</button>
```

## イベントをテストする

`assertDispatched()`でイベントの発生を確認し、テスト側から`dispatch()`してリスナーの動作を確認します。

```php
Livewire::test('post.create')
    ->call('save')
    ->assertDispatched('post-created');

Livewire::test(Dashboard::class)
    ->dispatch('post-created')
    ->assertSee('Posts created: 1');
```

## Laravel Echoによるリアルタイムイベント

Laravel EchoとWebSocketを組み合わせると、ブロードキャストイベントをLivewireで受け取れます。事前にEchoをインストールし、`window.Echo`を利用可能にしてください。

```php
use Livewire\Attributes\On;

#[On('echo:orders,OrderShipped')]
public function notifyNewOrder()
{
    $this->showNewOrderNotification = true;
}
```

チャンネル名にモデルIDなどを含める場合は`getListeners()`または動的イベント名を使います。

```php
public function getListeners()
{
    return [
        "echo:orders.{$this->order->id},OrderShipped" => 'notifyShipped',
    ];
}
```

`broadcastAs()`でイベント名を変更した場合は、Echoの規約に従い名前の先頭に`.`を付けます。privateチャンネルとpresenceチャンネルには、それぞれ`echo-private:`と`echo-presence:`を使います。

## 関連項目

- **[ネスト](/nesting)** — 親子コンポーネント間で通信する
- **[アクション](/actions)** — アクションからイベントを発生させる
- **[Alpine](https://livewire.laravel.com/docs/4.x/alpine)** — Alpineでイベントを送受信する
- **[On Attribute](https://livewire.laravel.com/docs/4.x/attribute-on)** — `#[On]`でイベントをリッスンする

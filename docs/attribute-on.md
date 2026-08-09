`#[On]`属性を使うと、コンポーネントがイベントをリッスンし、イベントがディスパッチされたときにメソッドを実行できます。

## 基本的な使い方

イベントのディスパッチ時に呼び出したいメソッドに`#[On]`属性を適用します。

```php
<?php // resources/views/components/⚡dashboard.blade.php

use Livewire\Attributes\On;
use Livewire\Component;

new class extends Component {
    #[On('post-created')] // [tl! highlight]
    public function updatePostList($title)
    {
        session()->flash('status', "新しい投稿を作成しました：{$title}");
    }
};
```

他のコンポーネントが`post-created`イベントをディスパッチすると、`updatePostList()`メソッドが自動的に呼び出されます。

## イベントをディスパッチする

リスナーをトリガーするイベントをディスパッチするには、`dispatch()`メソッドを使います。

```php
<?php // resources/views/components/post/⚡create.blade.php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public $title = '';

    public function save()
    {
        $post = Post::create(['title' => $this->title]);

        $this->dispatch('post-created', title: $post->title); // [tl! highlight]

        return redirect('/posts');
    }
};
```

`post-created`イベントは、`#[On('post-created')]`で修飾されたメソッドをすべてトリガーします。

## リスナーへデータを渡す

イベントには名前付きパラメータでデータを渡せます。

```php
// 複数のパラメータを付けてディスパッチ
$this->dispatch('post-updated', id: $post->id, title: $post->title);
```

```php
// リッスンしてパラメータを受け取る
#[On('post-updated')]
public function handlePostUpdate($id, $title)
{
    // $idと$titleを使う...
}
```

## 動的なイベント名

コンポーネントのプロパティをイベント名に使うと、スコープを絞ってリッスンできます。

```php
<?php // resources/views/components/post/⚡show.blade.php

use Livewire\Attributes\On;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public Post $post;

    #[On('post-updated.{post.id}')] // [tl! highlight]
    public function refreshPost()
    {
        $this->post->refresh();
    }
};
```

`$post->id`が`3`なら、`post-updated.3`イベントだけをリッスンし、他の投稿の更新は無視します。

## 複数のイベントリスナー

1つのメソッドで複数のイベントをリッスンできます。

```php
#[On('post-created')]
#[On('post-updated')]
#[On('post-deleted')]
public function refreshStats()
{
    // いずれかの投稿が変化したら統計を更新
}
```

## ブラウザイベントをリッスンする

JavaScriptからディスパッチされたブラウザイベントもリッスンできます。

```php
#[On('user-logged-in')]
public function handleUserLogin()
{
    // ログインを処理...
}
```

```javascript
// JavaScriptから
window.dispatchEvent(new CustomEvent('user-logged-in'));
```

## 代替方法：テンプレートでリッスンする

属性の代わりに、Bladeテンプレートの子コンポーネント上でイベントを直接リッスンできます。

```blade
<livewire:post.edit @saved="$refresh" />
```

これは`post.edit`子コンポーネントの`saved`イベントをリッスンし、ディスパッチされたときに親を更新します。

特定のメソッドを呼び出すこともできます。

```blade
<livewire:post.edit @saved="handleSave($event.id)" />
```

## 使用する場面

次のような場合に`#[On]`を使います。

* あるコンポーネントが別のコンポーネントのアクションに反応する
* リアルタイム通知や更新を実装する
* イベントで通信する疎結合なコンポーネントを作る
* ブラウザイベントやLaravel Echoイベントをリッスンする
* 外部の変更時にデータを更新する

## 例：リアルタイム通知

新しい通知をリッスンする通知ベルの実用例です。

```php
<?php // resources/views/components/⚡notification-bell.blade.php

use Livewire\Attributes\On;
use Livewire\Component;

new class extends Component {
    public $unreadCount = 0;

    public function mount()
    {
        $this->unreadCount = auth()->user()->unreadNotifications()->count();
    }

    #[On('notification-sent')] // [tl! highlight]
    public function incrementCount()
    {
        $this->unreadCount++;
    }

    #[On('notifications-read')] // [tl! highlight]
    public function resetCount()
    {
        $this->unreadCount = 0;
    }
};
?>

<button class="relative">
    <svg><!-- ベルアイコン --></svg>
    @if($unreadCount > 0)
        <span class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
            {{ $unreadCount }}
        </span>
    @endif
</button>
```

アプリケーション内の他の場所からイベントをディスパッチして、通知数を更新できます。

```php
// アプリケーション内のどこからでも
$this->dispatch('notification-sent');
```

## さらに詳しく

イベント、特定コンポーネントへのディスパッチ、Laravel Echo統合については、[イベントのドキュメント](/events)を参照してください。

## リファレンス

```php
#[On(
    string $event,
)]
```

| パラメータ | 型 | デフォルト | 説明 |
|-----------|------|---------|-------------|
| `$event` | `string` | *必須* | リッスンするイベント名 |

`#[Js]`属性は、クライアント側で実行するJavaScriptコードを返すメソッドを指定します。`#[Js]`を付けたメソッドは、サーバーリクエストなしでテンプレートから直接呼び出せます。

## 基本的な使い方

JavaScript式を返すメソッドに`#[Js]`属性を適用します。

```php
<?php // resources/views/components/post/⚡create.blade.php

use Livewire\Attributes\Js;
use Livewire\Component;

new class extends Component {
    public $title = '';
    public $content = '';

    #[Js] // [tl! highlight:start]
    public function resetForm()
    {
        return <<<'JS'
            $wire.title = ''
            $wire.content = ''
        JS;
    } // [tl! highlight:end]
};
```

```blade
<form wire:submit="save">
    <input wire:model="title" placeholder="タイトル">
    <textarea wire:model="content" placeholder="本文"></textarea>

    <button type="submit">保存</button>
    <button type="button" @click="$wire.resetForm()">リセット</button> <!-- [tl! highlight] -->
</form>
```

`$wire.resetForm()`が呼び出されると、JavaScriptがブラウザで直接実行され、サーバーとの往復は発生しません。

## サーバーアクション後にJavaScriptを実行する

**サーバーアクションの完了後**にJavaScriptを実行したい場合は、代わりに`js()`メソッドを使います。

```php
<?php // resources/views/components/post/⚡create.blade.php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public $title = '';

    public function save()
    {
        Post::create(['title' => $this->title]);

        $this->js("alert('投稿を保存しました！')"); // [tl! highlight]
    }
};
```

`js()`メソッドは、サーバーの応答が到着したときに実行するJavaScriptをキューに入れます。

## `$wire`へアクセスする

JavaScript式の中では、コンポーネントの`$wire`オブジェクトへアクセスできます。

```php
#[Js]
public function resetForm()
{
    return <<<'JS'
        $wire.title = ''
        $wire.content = ''
    JS;
}
```

## 使用する場面

次のような場合に`#[Js]`を使います。

* サーバー処理なしでフォームの入力欄をリセット・クリアする
* JavaScriptのアニメーションやトランジションを起動する
* 再レンダリングせずクライアント側の状態を更新する
* 複数箇所から再利用できるJavaScriptロジックを実行する
* サードパーティ製JavaScriptライブラリと統合する

## JavaScriptアクションと`#[Js]`メソッド

重要な違いがあります。

* **`#[Js]`メソッド**はPHPで定義され、JavaScriptコードを返します。サーバーリクエストなしで`$wire.methodName()`から呼び出します。
* **JavaScriptアクション（`$js.methodName`）**は、`@script`ブロックを使ってJavaScriptだけで定義します。

どちらもサーバーとの往復なしでクライアント上のJavaScriptを実行します。違いはJavaScriptコードを定義する場所です。

```php
<?php // resources/views/components/⚡example.blade.php

use Livewire\Attributes\Js;
use Livewire\Component;

new class extends Component {
    public $count = 0;

    // PHPで定義したJavaScript
    #[Js]
    public function showCount()
    {
        return "alert('Count is: {$this->count}')";
    }
};
```

```blade
<div>
    <button @click="$wire.showCount()">カウントを表示（PHPから）</button>
    <button @click="$js.incrementLocal()">ローカルを増加（JSから）</button>
</div>

@script
<script>
    // JavaScriptで定義したJavaScript
    $js('incrementLocal', () => {
        console.log('サーバーリクエストは発生しません')
    })
</script>
@endscript
```

## さらに詳しく

LivewireのJavaScript統合については、次を参照してください。

* [JavaScriptのドキュメント](https://livewire.laravel.com/docs/4.x/javascript)
* [JavaScriptアクションのドキュメント](/actions#javascript-actions)

Livewireでは、`wire:submit`ディレクティブを使ってフォーム送信を簡単に処理できます。`<form>`要素に`wire:submit`を追加すると、Livewireがフォームの送信をインターセプトし、ブラウザのデフォルト処理を防いだうえで、Livewireコンポーネントのメソッドを呼び出します。

`wire:submit`で「投稿を作成」フォームの送信を処理する基本的な例を見てみましょう。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    public $title = '';

    public $content = '';

    public function save()
    {
        Post::create([
            'title' => $this->title,
            'content' => $this->content,
        ]);

        $this->redirect('/posts');
    }

    public function render()
    {
        return view('livewire.create-post');
    }
}
```

```blade
<form wire:submit="save"> <!-- [tl! highlight] -->
    <input type="text" wire:model="title">

    <textarea wire:model="content"></textarea>

    <button type="submit">保存</button>
</form>
```

上の例では、ユーザーが「保存」をクリックしてフォームを送信すると、`wire:submit`が`submit`イベントをインターセプトし、サーバー上の`save`アクションを呼び出します。

> [!info] Livewireは自動的に`preventDefault()`を呼び出す
> `wire:submit`は、`.prevent`モディファイアなしで内部的に`event.preventDefault()`を呼び出す点が、ほかのLivewireイベントハンドラーと異なります。これは、`submit`イベントをリッスンしながら、デフォルトのブラウザ処理（エンドポイントへのフォーム全体の送信）を防ぎたくないケースがほとんどないためです。

> [!info] Livewireは送信中にフォームを自動的に無効化する
> デフォルトでは、Livewireがフォーム送信をサーバーへ送信している間、フォームの送信ボタンを無効化し、すべてのフォーム入力を`readonly`にします。これにより、最初の送信が完了するまでユーザーは同じフォームを再送信できません。

## さらに詳しく

`wire:submit`は、Livewireが提供する多数のイベントリスナーの1つにすぎません。アプリケーションで`wire:submit`を使う方法については、次の2ページでさらに詳しく説明しています。

* [Livewireでブラウザイベントに応答する](/actions)
* [Livewireでフォームを作成する](/forms)

## 関連項目

- **[フォーム](/forms)** — Livewireでフォーム送信を処理する
- **[アクション](/actions)** — アクションでフォームデータを処理する
- **[バリデーション](/validation)** — 送信前にフォームをバリデーションする

## リファレンス

```blade
wire:submit="methodName"
wire:submit="methodName(param1, param2)"
```

### モディファイア

| モディファイア | 説明 |
|----------|-------------|
| `.prevent` | ブラウザのデフォルト動作を防ぐ（`wire:submit`では自動） |
| `.stop` | イベントの伝播を停止する |
| `.self` | この要素で発生したイベントの場合のみトリガーする |
| `.once` | リスナーが1回だけ呼び出されるようにする |
| `.debounce` | ハンドラーを250ms単位でデバウンスする（任意の時間には`.debounce.500ms`を使う） |
| `.throttle` | ハンドラーの実行を最低250ms間隔に制限する（任意の時間には`.throttle.500ms`を使う） |
| `.window` | `window`オブジェクトのイベントをリッスンする |
| `.document` | `document`オブジェクトのイベントをリッスンする |
| `.passive` | スクロールのパフォーマンスを妨げない |
| `.capture` | キャプチャリングフェーズでリッスンする |
| `.renderless` | アクション完了後の再レンダリングをスキップする |
| `.preserve-scroll` | 更新中もスクロール位置を維持する |
| `.async` | キューに入れる代わりにアクションを並列実行する |

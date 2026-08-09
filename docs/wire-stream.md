Livewireでは、リクエストが完了する前に`wire:stream` APIを使ってWebページへコンテンツをストリーミングできます。生成と同時に応答をストリーミングするAIチャットボットのような機能に非常に役立ちます。

> [!warning] Laravel Octaneには対応していません
> 現在、LivewireはLaravel Octaneでの`wire:stream`の使用に対応していません。

`wire:stream`の最も基本的な機能を説明するため、ボタンを押すと「3」から「0」までのカウントダウンをユーザーに表示する、シンプルなCountDownコンポーネントを見てみましょう。

```php
use Livewire\Component;

class CountDown extends Component
{
    public $start = 3;

    public function begin()
    {
        while ($this->start >= 0) {
            // 現在のカウントをブラウザへストリーミング...
            $this->stream(  // [tl! highlight:4]
                to: 'count',
                content: $this->start,
                replace: true,
            );

            // 数字の間に1秒待機...
            sleep(1);

            // カウンターを減らす...
            $this->start = $this->start - 1;
        };
    }

    public function render()
    {
        return <<<'HTML'
        <div>
            <button wire:click="begin">カウントダウンを開始</button>

            <h1>カウント: <span wire:stream="count">{{ $start }}</span></h1> <!-- [tl! highlight] -->
        </div>
        HTML;
    }
}
```

ユーザーが「カウントダウンを開始」を押したとき、ユーザーからは次のように見えます。
* ページに「カウント: 3」が表示される
* 「カウントダウンを開始」ボタンを押す
* 1秒経過すると「カウント: 2」が表示される
* 「カウント: 0」が表示されるまでこの処理が続く

これらはすべて、サーバーへ送られる1つのネットワークリクエストの間に発生します。

ボタンが押されたとき、システム内部では次の処理が行われます。
* Livewireへ`begin()`メソッドを呼び出すリクエストが送られる
* `begin()`メソッドが呼び出され、`while`ループが始まる
* `$this->stream()`が呼び出され、ブラウザへの「ストリーミングレスポンス」が直ちに開始される
* ブラウザが、コンポーネント内で`wire:stream="count"`を持つ要素を見つけ、受信したペイロード（最初のストリーミング値では「3」）で内容を置き換えるよう指示するストリーミングレスポンスを受け取る
* `sleep(1)`メソッドによってサーバーが1秒間待機する
* `while`ループが繰り返され、条件が偽になるまで毎秒新しい数字をストリーミングする処理が続く
* `begin()`の実行が終わり、すべてのカウントがブラウザへストリーミングされると、Livewireはリクエストのライフサイクルを完了し、コンポーネントをレンダリングして最終レスポンスをブラウザへ送る

## チャットボットの応答をストリーミングする

`wire:stream`の一般的な用途は、[OpenAIのChatGPT](https://chat.openai.com/)のようなストリーミング応答に対応したAPIから、チャットボットの応答を受信しながらストリーミングすることです。

以下は、`wire:stream`を使ってChatGPTのようなインターフェースを実現する例です。

```php
use Livewire\Component;

class ChatBot extends Component
{
    public $prompt = '';

    public $question = '';

    public $answer = '';

    function submitPrompt()
    {
        $this->question = $this->prompt;

        $this->prompt = '';

        $this->js('$wire.ask()');
    }

    function ask()
    {
        $this->answer = OpenAI::ask($this->question, function ($partial) {
            $this->stream(to: 'answer', content: $partial); // [tl! highlight]
        });
    }

    public function render()
    {
        return <<<'HTML'
        <div>
            <section>
                <div>チャットボット</div>

                @if ($question)
                    <article>
                        <hgroup>
                            <h3>ユーザー</h3>
                            <p>{{ $question }}</p>
                        </hgroup>

                        <hgroup>
                            <h3>チャットボット</h3>
                            <p wire:stream="answer">{{ $answer }}</p> <!-- [tl! highlight] -->
                        </hgroup>
                    </article>
                @endif
            </section>

            <form wire:submit="submitPrompt">
                <input wire:model="prompt" type="text" placeholder="メッセージを送信" autofocus>
            </form>
        </div>
        HTML;
    }
}
```

上の例では、次の処理が行われます。
* ユーザーが「メッセージを送信」と表示されたテキストフィールドに入力して、チャットボットへ質問する
* [Enter]キーを押す
* ネットワークリクエストがサーバーへ送られ、メッセージが`$question`プロパティに設定され、`$prompt`プロパティがクリアされる
* 応答がブラウザへ返されて入力欄がクリアされる。`$this->js('...')`が呼び出されたため、サーバーへの新しいリクエストが開始され、`ask()`メソッドが呼び出される
* `ask()`メソッドがChatBot APIを呼び出し、コールバックの`$partial`パラメータを介してストリーミングされた応答の断片を受け取る
* 各`$partial`がページ上の`wire:stream="answer"`要素へストリーミングされ、回答が徐々に表示される
* 応答全体を受信するとLivewireのリクエストが完了し、ユーザーは完全な応答を受け取る

## 置き換えと追加

`$this->stream()`を使って要素へコンテンツをストリーミングするとき、Livewireに対象要素の内容をストリーミングされた内容で置き換えるか、既存の内容へ追加するかを指定できます。

状況によっては置き換えと追加のどちらも便利です。たとえば、チャットボットの応答をストリーミングする場合は通常追加が望ましく、そのためデフォルトになっています。一方、カウントダウンのようなものを表示する場合は置き換えが適しています。

`$this->stream`に`replace:`パラメータを真偽値で渡すことで、どちらかを設定できます。

```php
// 内容を追加...
$this->stream(to: 'target', content: '...');

// 内容を置き換え...
$this->stream(to: 'target', content: '...', replace: true);
```

対象要素に`.replace`モディファイアを追加・削除することでも、追加と置き換えを指定できます。

```blade
// 内容を追加...
<div wire:stream="target">

// 内容を置き換え...
<div wire:stream.replace="target">
```

## リファレンス

```blade
wire:stream="name"
```

### モディファイア

| モディファイア | 説明 |
|----------|-------------|
| `.replace` | 追加する代わりに要素の内容を置き換える |

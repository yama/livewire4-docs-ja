Livewireのrefは、Livewire内の個々の要素やコンポーネントに名前を付け、対象にするための仕組みです。

特定の要素へイベントをディスパッチしたり、コンテンツをストリーミングしたりするときに便利です。

クラスやIDで要素を対象にする方法と概念的には似ていますが、より整理された代替手段です。

利用例は次のとおりです。

- 特定のコンポーネントへイベントをディスパッチする
- `$refs`を使って要素を対象にする
- 特定の要素へコンテンツをストリーミングする

それぞれ見ていきましょう。

## イベントをディスパッチする

refは、Livewireのイベントシステムで特定の子コンポーネントを対象にするのに適しています。

次の、_close_イベントをリッスンするLivewireモーダルコンポーネントを考えてみましょう。

```php
<?php

new class extends Livewire\Component {
    public bool $isOpen = false;

    // ...

    #[On('close')]
    public function close()
    {
        $this->isOpen = false;
    }
};
?>

<div wire:show="isOpen">
    {{ $slot }}
</div>
```

コンポーネントタグに`wire:ref`を追加すると、`ref:`パラメータを使って_close_イベントを直接ディスパッチできます。

```php
<?php

new class extends Livewire\Component {
    public function save()
    {
        //

        $this->dispatch('close')->to(ref: 'modal');
    }
};
?>

<div>
    <!-- ... -->

    <livewire:modal wire:ref="modal">
        <!-- ... -->

        <button wire:click="save">保存</button>
    </livewire:modal>
</div>
```

## DOM要素へアクセスする

HTML要素に`wire:ref`を追加すると、`$refs`マジックプロパティを介してアクセスできます。

次の、リアルタイムに更新される文字数カウンターを考えてみましょう。

```php
<div>
    <textarea wire:model="message" wire:ref="message"></textarea>

    文字数: <span wire:ref="count">0</span>

    <!-- ... -->
</div>

<script>
    this.$refs.message.addEventListener('input', (e) => {
        this.$refs.count.textContent = e.target.value.length
    })
</script>
```

## `$wire`へアクセスする

refを持つコンポーネントの`$wire`へアクセスするには、要素の`.$wire`プロパティを使います。

```php
<div>
    <!-- ... -->

    <livewire:modal wire:ref="modal">
        <!-- ... -->

        <button wire:click="save()">保存</button>
    </livewire:modal>
</div>

<script>
    this.$intercept('save', ({ onFinish }) => {
        onFinish(() => {
            this.$refs.modal.$wire.close()
        })
    })
</script>
```

## コンテンツをストリーミングする

LivewireはCSSセレクターを使ってコンポーネント内の要素へ直接コンテンツをストリーミングできますが、`wire:ref`のほうが便利で見つけやすい方法です。

次の、生成された回答をLLMから直接ストリーミングするコンポーネントを考えてみましょう。

```php
<?php

new class extends Livewire\Component {
    public $question = '';

    public function ask()
    {
        Ai::ask($this->question, function ($chunk) {
            $this->stream($chunk)->to(ref: 'answer');
        });

        $this->reset('question');
    }
};
?>

<div>
    <input type="text" wire:model="question">

    <button wire:click="ask"></button>

    <h2>回答:</h2>

    <p wire:ref="answer"></p>
</div>
```

## 動的なref

refは、ループやその他の動的なコンテキストでも問題なく動作します。

複数のモーダルインスタンスを扱う例を見てみましょう。

```blade
@foreach($users as $index => $user)
    <livewire:modal
        wire:key="{{ $user->id }}"
        wire:ref="{{ 'user-modal-' . $user->id }}"
    >
        <!-- ... -->
    </livewire:modal>
@endforeach
```

## スコープの動作

refのスコープは現在のコンポーネントです。つまり、コンポーネント内の任意の要素を対象にできますが、ページ上の別のコンポーネントにある要素は対象にできません。

1つのコンポーネント内に同じref名を持つ要素が複数ある場合は、最初に見つかった要素が使われます。

## リファレンス

```blade
wire:ref="name"
```

このディレクティブにモディファイアはありません。

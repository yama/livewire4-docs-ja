`#[Modelable]`属性は、親コンポーネントから`wire:model`でバインドできる子コンポーネントのプロパティを指定します。

## 基本的な使い方

バインド可能にしたい子コンポーネントのプロパティに`#[Modelable]`を適用します。

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
    <input type="text" wire:model="value">
</div>
```

親コンポーネントは、他の入力要素と同じようにこの子コンポーネントへバインドできます。

```php
<?php // resources/views/components/⚡todos.blade.php

use Livewire\Component;

new class extends Component {
    public $todo = '';

    public function addTodo()
    {
        // ここで$this->todoを使う...
    }
};
?>

<div>
    <livewire:todo-input wire:model="todo" /> <!-- [tl! highlight] -->

    <button wire:click="addTodo">Todoを追加</button>
</div>
```

ユーザーが`todo-input`コンポーネントへ入力すると、親の`$todo`プロパティが自動的に更新されます。

## 仕組み

`#[Modelable]`がなければ、親子間の双方向通信を手動で処理する必要があります。

```php
// #[Modelable]なし - 手動の方法
<livewire:todo-input
    :value="$todo"
    @input="todo = $event.value"
/> 
```

`#[Modelable]`を使うと、コンポーネント上で`wire:model`を直接動作させられます。

## 再利用可能な入力コンポーネントを作る

`#[Modelable]`は、ネイティブHTML入力のように使えるカスタム入力コンポーネントを作るのに適しています。

```php
<?php // resources/views/components/⚡date-picker.blade.php

use Livewire\Attributes\Modelable;
use Livewire\Component;

new class extends Component {
    #[Modelable]
    public $date = '';
};
?>

<div>
    <input
        type="date"
        wire:model="date"
        class="border rounded px-3 py-2"
    >
</div>
```

```blade
{{-- 親での使用 --}}
<livewire:date-picker wire:model="startDate" />
<livewire:date-picker wire:model="endDate" />
```

> [!warning]
> コンポーネントのルート要素を`wire:model`付きのフォームコントロールにすることはできません。入力を`<div>`などのラッパー要素で囲んでください。Livewireは親のバインディングを接続するためルート要素に`wire:model`と`x-modelable`を注入するため、同じ要素に2つ目の`wire:model`を置くと競合します。

## モディファイア

親ではタイミングやネットワーク制御のため`wire:model`モディファイアを使えます。

```blade
{{-- キー入力ごとにライブ更新 --}}
<livewire:todo-input wire:model.live="todo" />

{{-- 更新をデバウンス --}}
<livewire:todo-input wire:model.live.debounce.500ms="todo" />

{{-- 更新をスロットリング --}}
<livewire:todo-input wire:model.live.throttle.500ms="todo" />
```

> [!note] コンポーネント上のイベントベースモディファイア
> `.blur`、`.change`、`.enter`のようなイベントベースモディファイアは、リアクティブなコンポーネントバインディングではなく特定の要素のDOMイベントを制御します。Modelableコンポーネントの同期タイミングを制御するには、子コンポーネント内の実際の入力要素にモディファイアを置いてください。
>
> ```blade
> {{-- 親 --}}
> <livewire:todo-input wire:model="todo" />
>
> {{-- 子コンポーネント --}}
> <input wire:model.blur="value" />
> ```

## 例：カスタムリッチテキストエディター

より複雑なリッチテキストエディターコンポーネントの例です。

```php
<?php // resources/views/components/⚡rich-editor.blade.php

use Livewire\Attributes\Modelable;
use Livewire\Component;

new class extends Component {
    #[Modelable]
    public $content = '';
};
?>

<div>
    <div
        x-init="
            // ここでリッチテキストエディターライブラリを初期化
            editor.on('change', () => {
                $wire.content = editor.getContent()
            })
        "
    >
        <!-- リッチテキストエディターUI -->
    </div>
</div>
```

```blade
{{-- 使用例 --}}
<livewire:rich-editor wire:model="postContent" />
```

## 制限

> [!warning] 1コンポーネントにつき1つのModelableプロパティだけ
> 現在Livewireがサポートする`#[Modelable]`属性はコンポーネントごとに1つだけです。そのためバインドされるのは最初の属性だけです。

## 使用する場面

次のような場合に`#[Modelable]`を使います。

* 再利用可能な入力コンポーネント（datepicker、カラーピッカー、リッチテキストエディター）を作る
* `wire:model`で動作するフォームコンポーネントを構築する
* サードパーティのJavaScriptライブラリをLivewireコンポーネントでラップする
* 特別なバリデーションやフォーマットを持つカスタム入力を作る

## さらに詳しく

親子通信とデータバインディングについては、[コンポーネントのネストのドキュメント](/nesting#binding-to-child-data-using-wiremodel)を参照してください。

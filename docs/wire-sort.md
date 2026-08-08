Livewireでは、`wire:sort`ディレクティブを使ってドラッグ＆ドロップによる並べ替えを実装できます。親要素に追加し、各子要素に`wire:sort:item`を使うと、リストをすぐに滑らかなアニメーション付きで並べ替えられます。

## 基本的な使い方

リストを並べ替えられるようにするには、ハンドラーメソッド名を指定して親要素に`wire:sort`を追加し、各子要素に一意の識別子を指定して`wire:sort:item`を追加します。

```php
<?php

use Livewire\Component;

new class extends Component {
    public TodoList $list;

    public function handleSort($id, $position)
    {
        $task = $this->list->tasks()->findOrFail($id);

        // タスクの位置を更新し、ほかのタスクを並べ替える...
    }
};
```

```blade
<ul wire:sort="handleSort">
    @foreach ($list->tasks as $task)
        <li wire:key="{{ $task->id }}" wire:sort:item="{{ $task->id }}">
            {{ $task->title }}
        </li>
    @endforeach
</ul>
```

ユーザーがアイテムを新しい位置へドラッグ＆ドロップすると、Livewireはハンドラーを2つのパラメータで呼び出します。パラメータはアイテムの識別子（`wire:sort:item`の値）と、新しい0始まりの位置です。

新しい順序をデータベースへ保存する処理は、あなたの責任で実装してください。

## グループ間で並べ替える

複数のリスト間でアイテムをドラッグできるようにするには、各コンテナで同じグループ名を指定して`wire:sort:group`を使います。

アイテムがどのグループへドロップされたかを識別するには、各コンテナに`wire:sort:group-id`を追加します。その値はハンドラーの3番目のパラメータとして渡されます。

```php
<?php

use Livewire\Component;
use Livewire\Attributes\Computed;
use App\Models\Card;

new class extends Component {
    public Board $board;

    #[Computed]
    public function columns()
    {
        return $this->board->columns;
    }

    public function handleSort($id, $position, $columnId)
    {
        $card = $this->board->cards()->findOrFail($id);

        // カードの位置を更新し、ほかのカードを並べ替える...
    }
};
```

```blade
<div>
    @foreach ($this->columns as $column)
        <ul wire:sort="handleSort" wire:sort:group="cards" wire:sort:group-id="{{ $column->id }}">
            @foreach ($column->cards as $card)
                <li wire:key="{{ $card->id }}" wire:sort:item="{{ $card->id }}">
                    {{ $card->title }}
                </li>
            @endforeach
        </ul>
    @endforeach
</div>
```

アイテムが別のグループへドラッグされると、移動先グループのハンドラーだけが実行されます。

## ソートハンドル

デフォルトでは、アイテム上のどこをクリックしてもドラッグできます。特定のハンドルにドラッグ操作を制限するには、`wire:sort:handle`を使います。

```blade
<ul wire:sort="handleSort">
    @foreach ($list->tasks as $task)
        <li wire:key="{{ $task->id }}" wire:sort:item="{{ $task->id }}">
            <div wire:sort:handle>
                <!-- ドラッグアイコン... -->
            </div>

            {{ $task->title }}
        </li>
    @endforeach
</ul>
```

これで、ユーザーはハンドル要素からのみドラッグを開始できます。

## 要素を無視する

特定の領域がドラッグ操作をトリガーしないようにするには、`wire:sort:ignore`を使います。並べ替え可能なアイテム内のボタンなど、操作可能な要素に便利です。

```blade
<ul wire:sort="handleSort">
    @foreach ($list->tasks as $task)
        <li wire:key="{{ $task->id }}" wire:sort:item="{{ $task->id }}">
            {{ $task->title }}

            <div wire:sort:ignore>
                <button type="button">編集</button>
            </div>
        </li>
    @endforeach
</ul>
```

## リファレンス

```blade
wire:sort="method"
wire:sort:item="id"
wire:sort:group="name"
wire:sort:group-id="identifier"
wire:sort:handle
wire:sort:ignore
```

このディレクティブにモディファイアはありません。

`#[Transition]`属性はアクションメソッドのView Transition動作を設定し、トランジションの種類を指定したり完全にスキップしたりできます。

## 基本的な使い方

特定のトランジションアニメーションを実行したいアクションメソッドに`#[Transition]`を適用します。

```php
<?php

use Livewire\Attributes\Transition;
use Livewire\Component;

class Wizard extends Component
{
    public $step = 1;

    #[Transition(type: 'forward')] // [tl! highlight]
    public function next()
    {
        $this->step++;
    }

    #[Transition(type: 'backward')] // [tl! highlight]
    public function previous()
    {
        $this->step--;
    }
}
```

```blade
<div>
    <div wire:transition="content">
        ステップ {{ $step }}
    </div>

    <button wire:click="previous">戻る</button>
    <button wire:click="next">次へ</button>
</div>
```

`:active-view-transition-type()`セレクターでCSSから種類を対象にできます。

```css
html:active-view-transition-type(forward) {
    &::view-transition-old(content) {
        animation: 300ms ease-out both slide-out-left;
    }
    &::view-transition-new(content) {
        animation: 300ms ease-in both slide-in-right;
    }
}

html:active-view-transition-type(backward) {
    &::view-transition-old(content) {
        animation: 300ms ease-out both slide-out-right;
    }
    &::view-transition-new(content) {
        animation: 300ms ease-in both slide-in-left;
    }
}

@keyframes slide-out-left {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(-100%); opacity: 0; }
}

@keyframes slide-in-right {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-out-right {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

@keyframes slide-in-left {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
```

## トランジションをスキップする

`skip: true`を指定すると、特定のアクションでトランジションを無効にできます。

```php
#[Transition(skip: true)]
public function reset()
{
    $this->step = 1;
}
```

「リセット」や「キャンセル」のように、アニメーションなしで即時更新したいアクションに便利です。

## パラメータ

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `type` | `string` | トランジションの種類（例：`'forward'`、`'backward'`） |
| `skip` | `bool` | このアクションのトランジションを無効にするには`true` |

## 代替方法

### transition()を使う

実行時のロジックで種類が決まる動的なトランジションには、代わりに`transition()`メソッドを使います。

```php
public function goToStep($step)
{
    $this->transition(type: $step > $this->step ? 'forward' : 'backward');

    $this->step = $step;
}
```

### skipTransition()を使う

命令的にトランジションをスキップすることもできます。

```php
public function reset()
{
    $this->skipTransition();

    $this->step = 1;
}
```

## さらに詳しく

View Transitionsについては、[`wire:transition`のドキュメント](/wire-transition)を参照してください。

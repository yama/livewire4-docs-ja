`#[Lazy]`属性は、コンポーネントがビューポートに表示されたときだけ読み込まれるようにし、遅いコンポーネントが初回ページレンダリングをブロックするのを防ぎます。

## 基本的な使い方

遅延読み込みしたいコンポーネントに`#[Lazy]`を適用します。

```php
<?php // resources/views/components/⚡revenue.blade.php

use Livewire\Attributes\Lazy;
use Livewire\Component;
use App\Models\Transaction;

new #[Lazy] class extends Component { // [tl! highlight]
    public $amount;

    public function mount()
    {
        // 遅いデータベースクエリ...
        $this->amount = Transaction::monthToDate()->sum('amount');
    }
};
?>

<div>
    今月の売上: {{ $amount }}
</div>
```

`#[Lazy]`を指定すると、最初は空の`<div></div>`としてレンダリングされ、ビューポートに入ったとき（通常はユーザーがスクロールしたとき）に読み込まれます。

## LazyとDefer

* **遅延読み込み（`#[Lazy]`）** — ビューポートに表示されたときに読み込む
* **遅延実行（`#[Defer]`）** — 初回ページ読み込み完了直後に読み込む

画面下部にありユーザーがスクロールしない可能性があるコンポーネントにはLazyを使います。常に表示されるがページのレンダリング後に読み込みたいコンポーネントにはDeferを使います。

## プレースホルダーをレンダリングする

デフォルトでは、読み込み前に空の`<div></div>`をレンダリングします。`placeholder()`メソッドでカスタムプレースホルダーを指定できます。

```php
<?php // resources/views/components/⚡revenue.blade.php

use Livewire\Attributes\Lazy;
use Livewire\Component;
use App\Models\Transaction;

new #[Lazy] class extends Component {
    public $amount;

    public function mount()
    {
        $this->amount = Transaction::monthToDate()->sum('amount');
    }

    public function placeholder() // [tl! highlight:start]
    {
        return <<<'HTML'
        <div>
            <div class="animate-pulse bg-gray-200 h-20 rounded"></div>
        </div>
        HTML;
    } // [tl! highlight:end]
};
?>

<div>
    今月の売上: {{ $amount }}
</div>
```

コンポーネントがビューポートに入り読み込まれるまで、ユーザーにはスケルトンが表示されます。

> [!warning] プレースホルダーの要素タイプを合わせる
> プレースホルダーのルート要素が`<div>`なら、コンポーネントも`<div>`要素を使う必要があります。

## リクエストを束ねる

デフォルトでは、Lazyコンポーネントは独立したネットワークリクエストで並列に読み込まれます。複数を1つのリクエストにまとめるには`bundle`パラメータを使います。

```php
<?php // resources/views/components/⚡revenue.blade.php

use Livewire\Attributes\Lazy;
use Livewire\Component;

new #[Lazy(bundle: true)] class extends Component { // [tl! highlight]
    // ...
};
```

`revenue`コンポーネントが10個あっても、10個の並列リクエストではなく1つの束ねられたリクエストで読み込まれます。

## 代替方法

### lazyパラメータを使う

属性の代わりに`lazy`パラメータで特定のインスタンスを遅延読み込みできます。

```blade
<livewire:revenue lazy />
```

特定のインスタンスだけ遅延させたい場合に便利です。

### 属性を上書きする

コンポーネントに`#[Lazy]`があっても、場合によってすぐ読み込みたい場合は上書きできます。

```blade
<livewire:revenue :lazy="false" />
```

## 使用する場面

次のような場合に`#[Lazy]`を使います。

* ページ読み込みを遅延させる遅い処理（データベースクエリ、API呼び出し）がコンポーネントに含まれる
* コンポーネントが画面下部にあり、ユーザーがスクロールしない可能性がある
* ページを速く表示して体感速度を改善したい
* 1ページに高コストなコンポーネントが複数ある

## さらに詳しく

プレースホルダー、リクエストの束ね方、propsの渡し方を含む遅延読み込みの完全な説明は、[Lazy Loadingのドキュメント](/lazy)を参照してください。

## リファレンス

```php
#[Lazy(
    bool|null $bundle = null,
)]
```

| パラメータ | 型 | デフォルト | 説明 |
|-----------|------|---------|-------------|
| `$bundle` | `bool\|null` | `null` | 複数のLazyコンポーネントを1つのネットワークリクエストにまとめる |

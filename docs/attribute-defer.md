`#[Defer]`属性を使うと、初回ページの読み込みが完了した直後にコンポーネントを読み込み、遅いコンポーネントがページのレンダリングをブロックするのを防げます。

## 基本的な使い方

遅延させたいコンポーネントに`#[Defer]`を適用します。

```php
<?php // resources/views/components/⚡revenue.blade.php

use Livewire\Attributes\Defer;
use Livewire\Component;
use App\Models\Transaction;

new #[Defer] class extends Component { // [tl! highlight]
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

`#[Defer]`を指定すると、最初は空の`<div></div>`としてレンダリングされ、ページの読み込み完了直後に読み込まれます。ビューポートに入るのを待ちません。

## LazyとDefer

Livewireにはコンポーネントの読み込みを遅らせる方法が2つあります。

* **遅延読み込み（`#[Lazy]`）** — ビューポートに表示されたとき（ユーザーがスクロールして到達したとき）に読み込む
* **遅延実行（`#[Defer]`）** — 初回ページ読み込みの完了直後に読み込む

どちらも遅いコンポーネントによる初回ページのレンダリングのブロックを防ぎますが、実際に読み込まれるタイミングが異なります。

## プレースホルダーをレンダリングする

デフォルトでは、読み込み前に空の`<div></div>`をレンダリングします。`placeholder()`メソッドでカスタムプレースホルダーを指定できます。

```php
<?php // resources/views/components/⚡revenue.blade.php

use Livewire\Attributes\Defer;
use Livewire\Component;
use App\Models\Transaction;

new #[Defer] class extends Component {
    public $amount;

    public function mount()
    {
        $this->amount = Transaction::monthToDate()->sum('amount');
    }

    public function placeholder() // [tl! highlight:start]
    {
        return <<<'HTML'
        <div>
            <svg><!-- ローディングスピナー... --></svg>
        </div>
        HTML;
    } // [tl! highlight:end]
};
?>

<div>
    今月の売上: {{ $amount }}
</div>
```

コンポーネントが完全に読み込まれるまで、ユーザーにはローディングスピナーが表示されます。

> [!warning] プレースホルダーの要素タイプを合わせる
> プレースホルダーのルート要素が`<div>`なら、コンポーネントも`<div>`要素を使う必要があります。

## リクエストを束ねる

デフォルトでは、遅延コンポーネントは独立したネットワークリクエストで並列に読み込まれます。複数の遅延コンポーネントを1つのリクエストにまとめるには、`bundle`パラメータを使います。

```php
<?php // resources/views/components/⚡revenue.blade.php

use Livewire\Attributes\Defer;
use Livewire\Component;

new #[Defer(bundle: true)] class extends Component { // [tl! highlight]
    // ...
};
```

ページに`revenue`コンポーネントが10個ある場合、10個の並列リクエストではなく、1つの束ねられたリクエストで読み込まれます。

## 代替方法

### deferパラメータを使う

属性の代わりに、`defer`パラメータで特定のコンポーネントインスタンスを遅延できます。

```blade
<livewire:revenue defer />
```

特定のインスタンスだけ遅延させたい場合に便利です。

### 属性を上書きする

コンポーネントに`#[Defer]`があっても、場合によってすぐ読み込みたい場合は上書きできます。

```blade
<livewire:revenue :defer="false" />
```

## 使用する場面

次のような場合に`#[Defer]`を使います。

* ページ読み込みを遅延させる遅い処理（データベースクエリ、API呼び出し）がコンポーネントに含まれる
* 初回ページ読み込み時に常に表示される（画面下部なら`#[Lazy]`を使う）
* ページを速く表示して体感速度を改善したい

## さらに詳しく

プレースホルダーやリクエストの束ね方を含む遅延・延期読み込みの完全な説明は、[Lazy Loadingのドキュメント](/lazy)を参照してください。

## リファレンス

```php
#[Defer(
    bool|null $bundle = null,
)]
```

| パラメータ | 型 | デフォルト | 説明 |
|-----------|------|---------|-------------|
| `$bundle` | `bool\|null` | `null` | 複数の遅延コンポーネントを1つのネットワークリクエストにまとめる |

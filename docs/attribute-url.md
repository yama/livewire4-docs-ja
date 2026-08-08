`#[Url]`属性はプロパティの値をURLのクエリ文字列に保存し、特定のページ状態を共有・ブックマークできるようにします。

## 基本的な使い方

URLに保存したいプロパティに`#[Url]`を適用します。

```php
<?php // resources/views/components/user/⚡index.blade.php

use Livewire\Attributes\Computed;
use Livewire\Attributes\Url;
use Livewire\Component;
use App\Models\User;

new class extends Component {
    #[Url] // [tl! highlight]
    public $search = '';

    #[Computed]
    public function users()
    {
        return User::search($this->search)->get();
    }
};
?>

<div>
    <input type="text" wire:model.live="search" placeholder="ユーザーを検索...">

    <ul>
        @foreach ($this->users as $user)
            <li wire:key="{{ $user->id }}">{{ $user->name }}</li>
        @endforeach
    </ul>
</div>
```

検索欄に「bob」と入力するとURLが`https://example.com/users?search=bob`に更新され、URLを共有・更新しても検索値が保持されます。

## 仕組み

`#[Url]`属性は2つのことを行います。

1. **URLへ書き込む** — プロパティが変わるとクエリ文字列を更新する
2. **URLから読み込む** — ページ読み込み時にクエリ文字列からプロパティを初期化する

コンポーネントの状態を共有・ブックマーク可能にします。

## URLとSessionの違い

| 機能 | `#[Url]` | `#[Session]` |
|---------|----------|-------------|
| 更新後も保持 | ✅ | ✅ |
| URL共有時も保持 | ✅ | ❌ |
| URLをきれいに保つ | ❌ | ✅ |
| ユーザーに見える | ✅ | ❌ |
| 状態を共有できる | ✅ | ❌ |

現在の状態を共有・ブックマークさせたい場合は`#[Url]`を使い、状態を非公開にする場合は`#[Session]`を使います。

## エイリアスを使う

`as`パラメータでURL内のプロパティ名を短縮・隠蔽できます。

```php
<?php // resources/views/components/user/⚡index.blade.php

use Livewire\Attributes\Url;
use Livewire\Component;

new class extends Component {
    #[Url(as: 'q')] // [tl! highlight]
    public $search = '';
};
```

URLは`?search=bob`ではなく`?q=bob`になります。

## 値を除外する

デフォルトでは初期値と異なる場合だけクエリパラメータを追加します。`except`で変更できます。

```php
<?php // resources/views/components/user/⚡index.blade.php

use Livewire\Attributes\Url;
use Livewire\Component;

new class extends Component {
    #[Url(except: '')] // [tl! highlight]
    public $search = '';

    public function mount()
    {
        $this->search = auth()->user()->username;
    }
};
```

これで初期ユーザー名と同じ場合ではなく、空文字列の場合だけ`search`をURLから除外します。

## URLに常に表示する

空でも常にパラメータを含めるには`keep`を使います。

```php
#[Url(keep: true)] // [tl! highlight]
public $search = '';
```

値が空でもURLには常に`?search=`が表示されます。

## nullableプロパティ

nullable型を使うと、空のクエリパラメータを空文字列ではなく`null`として扱えます。

```php
<?php // resources/views/components/user/⚡index.blade.php

use Livewire\Attributes\Url;
use Livewire\Component;

new class extends Component {
    #[Url]
    public ?string $search; // [tl! highlight]
};
```

`?search=`で`$search`は`''`ではなく`null`になります。

## ブラウザ履歴

デフォルトでは`history.replaceState()`で履歴エントリを追加せずURLを変更します。履歴を追加して戻るボタンで以前の値を復元するには`history`を使います。

```php
#[Url(history: true)] // [tl! highlight]
public $search = '';
```

戻るボタンで前のページへ移動する代わりに、以前の検索値が復元されます。

## 使用する場面

次のような場合に`#[Url]`を使います。

* 検索・フィルターインターフェースを作る
* ページネーションを実装する
* 共有可能なビュー（地図位置、選択したフィルターなど）を作る
* 特定の状態をブックマークできるようにする
* 状態間のブラウザ戻る・進むをサポートする

## 例：商品のフィルタリング

複数のURLパラメータで商品を絞り込む実用例です。

```php
<?php // resources/views/pages/⚡products.blade.php

use Livewire\Attributes\Computed;
use Livewire\Attributes\Url;
use Livewire\Component;
use App\Models\Product;

new class extends Component {
    #[Url(as: 'q')]
    public $search = '';
    #[Url]
    public $category = 'all';
    #[Url]
    public $minPrice = 0;
    #[Url]
    public $maxPrice = 1000;
    #[Url]
    public $sort = 'name';

    #[Computed]
    public function products()
    {
        return Product::query()
            ->when($this->search, fn($q) => $q->search($this->search))
            ->when($this->category !== 'all', fn($q) => $q->where('category', $this->category))
            ->whereBetween('price', [$this->minPrice, $this->maxPrice])
            ->orderBy($this->sort)
            ->paginate(20);
    }
};
?>

<div>
    <input type="text" wire:model.live="search" placeholder="商品を検索...">
    <select wire:model.live="category">
        <option value="all">すべてのカテゴリ</option>
        <option value="electronics">電子機器</option>
        <option value="clothing">衣類</option>
    </select>
    <input type="range" wire:model.live="minPrice" min="0" max="1000">
    <input type="range" wire:model.live="maxPrice" min="0" max="1000">
    <select wire:model.live="sort">
        <option value="name">名前</option>
        <option value="price">価格</option>
        <option value="created_at">新着順</option>
    </select>
    @foreach($this->products as $product)
        <div wire:key="{{ $product->id }}">{{ $product->name }} - ${{ $product->price }}</div>
    @endforeach
</div>
```

ユーザーは次のようなURLを共有できます。
```
https://example.com/products?q=laptop&category=electronics&minPrice=500&maxPrice=1500&sort=price
```

## SEO上の注意

クエリパラメータは検索エンジンにインデックスされ、アナリティクスにも含まれます。

* **SEOに有効** — 組み合わせごとに固有URLができ、インデックス可能
* **アナリティクス追跡** — ユーザーが使うフィルターや検索を追跡できる
* **SNSで共有可能** — リンク共有時もクエリパラメータが保持される

## さらに詳しく

クエリ文字列メソッドやtraitフックを含むURLクエリパラメータについては、[URLクエリパラメータのドキュメント](/url)を参照してください。

## リファレンス

```php
#[Url(
    ?string $as = null,
    bool $history = false,
    bool $keep = false,
    mixed $except = null,
    mixed $nullable = null,
)]
```

| パラメータ | 型 | デフォルト | 説明 |
|-----------|------|---------|-------------|
| `$as` | `?string` | `null` | URLのクエリパラメータに使うカスタム名 |
| `$history` | `bool` | `false` | URL変更をブラウザ履歴へ追加する（戻るボタンを有効化） |
| `$keep` | `bool` | `false` | 移動時もクエリパラメータを保持する |
| `$except` | `mixed` | `null` | URLから除外する値 |
| `$nullable` | `mixed` | `null` | URLにクエリパラメータがない場合に使う値 |

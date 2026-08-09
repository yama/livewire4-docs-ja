`@island`ディレクティブはコンポーネント内に独立した領域を作り、コンポーネント全体を再レンダリングせずに個別更新できるようにします。

## 基本的な使い方

テンプレートの任意の部分を`@island`で囲みます。

```blade
<?php // resources/views/components/⚡dashboard.blade.php

use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Revenue;

new class extends Component {
    #[Computed]
    public function revenue()
    {
        // 高コストな計算...
        return Revenue::yearToDate();
    }
};
?>

<div>
    @island
        <div>
            売上: {{ $this->revenue }}
            <button type="button" wire:click="$refresh">更新</button>
        </div>
    @endisland

    <div>
        <!-- その他のコンテンツ... -->
    </div>
</div>
```

「更新」をクリックすると、islandだけが再レンダリングされ、コンポーネントの残りは変更されません。

## islandを遅延読み込みする

`lazy`パラメータを使うと、ページ読み込み後までislandの初回レンダリングを遅らせられます。

```blade
@island(lazy: true)
    <div>
        売上: {{ $this->revenue }}
    </div>
@endisland
```

最初はローディング状態を表示し、別のリクエストでコンテンツを取得します。

### LazyとDefer

デフォルトでは`lazy`はislandがビューポートに表示されるまで待ちます。ページ読み込み直後に読み込むには`defer`を使います。

```blade
{{-- ビューへスクロールされたら読み込む --}}
@island(lazy: true)
    <!-- ... -->
@endisland

{{-- ページ読み込み直後に読み込む --}}
@island(defer: true)
    <!-- ... -->
@endisland
```

## カスタムローディング状態

読み込み中の表示をカスタマイズするには`@placeholder`を使います。

```blade
@island(lazy: true)
    @placeholder
        <div class="animate-pulse">
            <div class="h-32 bg-gray-200 rounded"></div>
        </div>
    @endplaceholder
    <div>売上: {{ $this->revenue }}</div>
@endisland
```

## 名前付きisland

islandに名前を付けると、コンポーネントの別の場所から対象にできます。

```blade
@island(name: 'revenue')
    <div>売上: {{ $this->revenue }}</div>
@endisland

<button type="button" wire:click="$refresh" wire:island="revenue">売上を更新</button>
```

`wire:island`ディレクティブは更新を特定のislandに限定します。

## islandを使う理由

islandは、子コンポーネントを別に作ったり、propsを管理したり、コンポーネント間通信を処理したりするオーバーヘッドなしでパフォーマンスを分離できます。

**次のような場合に使います。**
* 高コストな計算を分離したい
* 1つのコンポーネント内に独立した更新領域が必要
* ネストしたコンポーネントよりシンプルな設計にしたい

[islandについて詳しく見る →](/islands)

## リファレンス

```blade
@island(
    ?string $name = null,
    bool $lazy = false,
    bool $defer = false,
)
    <!-- コンテンツ -->
@endisland
```

| パラメータ | 型 | デフォルト | 説明 |
|-----------|------|---------|-------------|
| `$name` | `?string` | `null` | `wire:island`で対象にする一意の名前 |
| `$lazy` | `bool` | `false` | ビューポートに表示されるまでレンダリングを遅延する |
| `$defer` | `bool` | `false` | ビューポートを待たずページ読み込み直後に読み込む |

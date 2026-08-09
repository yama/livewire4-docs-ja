`@placeholder`ディレクティブは、遅延・延期コンポーネントやislandの読み込み中にカスタムコンテンツを表示します。

## Lazyコンポーネントでの基本的な使い方

シングルファイル・マルチファイルコンポーネントでは`@placeholder`で読み込み中の表示を指定します。

```php
<?php // resources/views/components/⚡revenue.blade.php

use Livewire\Component;
use App\Models\Transaction;

new class extends Component {
    public $amount;
    public function mount()
    {
        // 遅いデータベースクエリ...
        $this->amount = Transaction::monthToDate()->sum('amount');
    }
};
?>

@placeholder
    <div>
        <!-- ローディングスピナー -->
        <svg class="animate-spin h-5 w-5">...</svg>
    </div>
@endplaceholder

<div>今月の売上: {{ $amount }}</div>
```

`<livewire:revenue lazy />`で表示すると、コンポーネントの読み込みまでプレースホルダーが表示されます。

> [!tip] ビュー形式のコンポーネント専用
> `@@placeholder`はシングルファイル・マルチファイルコンポーネントで動作します。クラスベースのコンポーネントでは代わりに`placeholder()`メソッドを使います。

> [!warning] ルート要素のタイプを合わせる
> プレースホルダーとコンポーネントは同じルート要素タイプを使う必要があります。プレースホルダーが`<div>`なら、コンポーネントも`<div>`にします。

## islandで使う

遅延island内で`@placeholder`を使い、ローディング状態をカスタマイズします。

```blade
@island(lazy: true)
    @placeholder
        <div class="animate-pulse"><div class="h-32 bg-gray-200 rounded"></div></div>
    @endplaceholder
    <div>
        売上: {{ $this->revenue }}
        <button type="button" wire:click="$refresh">更新</button>
    </div>
@endisland
```

islandの読み込み中にプレースホルダーが表示され、実際のコンテンツに置き換わります。

## スケルトンプレースホルダー

コンテンツのレイアウトに合わせたスケルトンローダーに適しています。

```blade
@placeholder
    <div class="space-y-4">
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded"></div>
        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
@endplaceholder

<div>
    <!-- 実際のコンテンツ -->
    <h2>{{ $post->title }}</h2>
    <p>{{ $post->content }}</p>
</div>
```

## さらに詳しく

遅延コンポーネントの読み込みは、[Lazy Loadingのドキュメント](/lazy)を参照してください。

islandのローディング状態は、[Islandsのドキュメント](/islands)を参照してください。

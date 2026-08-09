Islandを使うと、Livewireコンポーネント内に独立して更新される領域を作成できます。Island内でアクションが発生したときは、コンポーネント全体ではなく、そのIslandだけが再レンダリングされます。

これにより、個別の子コンポーネントを作成したり、propsを管理したり、コンポーネント間通信を扱ったりする負担なしに、コンポーネントを小さな部分へ分割するパフォーマンス上の利点を得られます。

## 基本的な使い方

Bladeテンプレートの任意の部分を `@island` ディレクティブで囲むと、Islandを作成できます。

```blade
<?php // resources/views/components/⚡dashboard.blade.php

use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Revenue;

new class extends Component {
    #[Computed]
    public function revenue()
    {
        // 高コストな計算やクエリ...
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

「更新」ボタンをクリックすると、売上計算を含むIslandだけが再レンダリングされ、コンポーネントの残りの部分はそのままです。

高コストな計算はオンデマンドで評価される算出プロパティ内にあるため、ページの他の部分が更新されても呼び出されず、Islandが再レンダリングされたときだけ呼び出されます。ただしIslandはデフォルトではページと一緒に読み込まれるため、初回ページロード時には `revenue` プロパティも計算されます。

## 遅延読み込み

初回ページロードをブロックさせたくない高コストな計算や遅いAPI呼び出しがある場合は、`lazy` パラメータでページロード後までIslandの初回レンダリングを遅延できます。

```blade
<?php // resources/views/components/⚡dashboard.blade.php

use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Revenue;

new class extends Component {
    #[Computed]
    public function revenue()
    {
        // 高コストな計算やクエリ...
        return Revenue::yearToDate();
    }
};
?>

<div>
    @island(lazy: true)
        <div>
            売上: {{ $this->revenue }}
            <button type="button" wire:click="$refresh">更新</button>
        </div>
    @endisland
    <div><!-- その他のコンテンツ... --></div>
</div>
```

最初はローディング状態が表示され、その後別のリクエストで内容を取得してレンダリングします。

### 遅延読み込みと遅延実行の違い

デフォルトでは `lazy` はIntersection Observerを使い、Islandがビューポートに表示されたときに読み込みを開始します。表示状態に関係なくページロード直後に読み込むには `defer` を使います。

```blade
{{-- ビューにスクロールされたときに読み込む --}}
@island(lazy: true)
    <!-- ... -->
@endisland

{{-- ページロード直後に読み込む --}}
@island(defer: true)
    <!-- ... -->
@endisland
```

### カスタムローディング状態

`@placeholder` ディレクティブで、遅延Islandの読み込み中に表示する内容をカスタマイズできます。

```blade
@island(lazy: true)
    @placeholder
        <!-- ローディング表示 -->
        <div class="animate-pulse"><div class="h-32 bg-gray-200 rounded"></div></div>
    @endplaceholder
    <div>売上: {{ $this->revenue }} <button type="button" wire:click="$refresh">更新</button></div>
@endisland
```

## 名前付きIsland

コンポーネントの別の場所からIslandを起動するには名前を付け、`wire:island` で参照します。

```blade
<div>
    @island(name: 'revenue')
        <div>売上: {{ $this->revenue }}</div>
    @endisland
    <button type="button" wire:click="$refresh" wire:island="revenue">売上を更新</button>
</div>
```

`wire:island` は `wire:click` や `wire:submit` などのアクションディレクティブと組み合わせて、更新対象を特定のIslandに限定します。同じ名前のIslandが複数ある場合は互いに関連付けられ、常にグループとしてレンダリングされます。

```blade
@island(name: 'revenue')
    <div class="sidebar">
        売上: {{ $this->revenue }}
    </div>
@endisland

@island(name: 'revenue')
    <div class="header">
        売上: {{ $this->revenue }}
    </div>
@endisland

<button type="button" wire:click="$refresh" wire:island="revenue">
    売上を更新
</button>
```

どちらかが起動されると、両方のIslandが一緒に更新されます。

## 追加・先頭追加モード

内容を完全に置き換える代わりに、新しい内容を末尾または先頭へ追加できます。ページネーション、無限スクロール、リアルタイムフィードに適しています。

```blade
<?php // resources/views/components/⚡activity-feed.blade.php

use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Activity;

new class extends Component {
    public $page = 1;

    public function loadMore()
    {
        $this->page++;
    }

    #[Computed]
    public function activities()
    {
        return Activity::latest()
            ->forPage($this->page, 10)
            ->get();
    }
};
?>

<div>
@island(name: 'feed')
    @foreach ($this->activities as $activity)
        <x-activity-item wire:key="{{ $activity->id }}" :activity="$activity" />
    @endforeach
@endisland
<button type="button" wire:click="loadMore" wire:island.append="feed">さらに読み込む</button>
    </div>
```

利用できるモード:
- `wire:island.append` - 末尾に追加
- `wire:island.prepend` - 先頭に追加

## ネストしたIsland

Islandは互いにネストできます。外側のIslandが再レンダリングされると、デフォルトでは内側のIslandはスキップされます。外側の更新ボタンは外側だけを、内側の更新ボタンは内側だけを更新します。

```blade
@island(name: 'revenue')
    <div>
        合計売上: {{ $this->revenue }}

        @island(name: 'breakdown')
            <div>
                月別内訳: {{ $this->monthlyBreakdown }}
                <button type="button" wire:click="$refresh">内訳を更新</button>
            </div>
        @endisland

        <button type="button" wire:click="$refresh">売上を更新</button>
    </div>
@endisland
```

「売上を更新」は外側だけを、「内訳を更新」は内側だけを更新します。

## 親と常に一緒にレンダリングする

コンポーネントの再レンダリング時、デフォルトではIslandはスキップされます。`always: true` を使うと、親コンポーネントの更新時に必ず更新できます。ネストしたIslandでも、親Islandが更新されるたびに `always: true` の内側Islandが更新されます。

```blade
<div>
@island(always: true)
    <div>
        売上: {{ $this->revenue }}
        <button type="button" wire:click="$refresh">売上を更新</button>
    </div>
@endisland
<button type="button" wire:click="$refresh">更新</button>
</div>
```

`always: true` ではコンポーネントのどの部分が更新されてもIslandが再レンダリングされます。コンポーネントの状態と常に同期させたい重要なデータに便利です。

## 初回レンダリングをスキップする

`skip` パラメータは初回のIslandレンダリングを防ぎます。オンデマンドの内容に適しています。

```blade
@island(skip: true)
    @placeholder
        <button type="button" wire:click="$refresh">売上の詳細を読み込む</button>
    @endplaceholder
    <div>
        売上: {{ $this->revenue }}
        <button type="button" wire:click="$refresh">更新</button>
    </div>
@endisland
```

初回はプレースホルダーが表示され、起動するとIslandがレンダリングされて置き換わります。

## Islandのポーリング

Island内で `wire:poll` を使うと、そのIslandだけを一定間隔で更新できます。

```blade
@island(skip: true)
    <div wire:poll.3s>
        売上: {{ $this->revenue }}
        <button type="button" wire:click="$refresh">更新</button>
    </div>
@endisland
```

ポーリングはIslandに限定され、コンポーネント全体ではなく3秒ごとにIslandだけが更新されます。

## JavaScriptからIslandを起動する

`wire:island` はLivewireアクションディレクティブと組み合わせる場合だけ機能します。AlpineやJavaScriptからアクションの対象をIslandに限定するには `$wire.$island()` を使います。

```blade
<button type="button" x-on:click="$wire.$island('feed').loadMore()">
    さらに読み込む
</button>
```

これは `wire:click="loadMore" wire:island="feed"` と同等ですが、Alpine式やJavaScriptロジックを使える柔軟性があります。オプションで追加・先頭追加モードも指定できます。

```blade
<button type="button" x-on:click="$wire.$island('feed', { mode: 'append' }).loadMore()">
    さらに読み込む
</button>
```

`$refresh()`、`$set()`、`$toggle()` を含む、どの `$wire` メソッドでも `$island()` と組み合わせられます。

```blade
<button type="button" x-on:click="$wire.$island('revenue').$refresh()">
    売上を更新
</button>
```

## 注意事項

**データのスコープ**: Islandからコンポーネントのプロパティとメソッドにはアクセスできますが、Islandの外で定義したテンプレート変数にはアクセスできません。親テンプレートの `@php` 変数やループ変数は利用できず、コンポーネントプロパティは利用できます。

```blade
@php
    $localVariable = 'Island内では利用できません';
@endphp

@island
    {{-- ❌ エラーになります - $localVariableにはアクセスできません --}}
    {{ $localVariable }}

    {{-- ✅ コンポーネントプロパティは利用できます --}}
    {{ $this->revenue }}
@endisland
```

**ループや条件分岐内では使えません**: ループ変数や条件分岐のコンテキストへアクセスできないため、`@foreach`、`@if` などの制御構造の内部では使えません。ループや条件分岐をIslandの内側へ置いてください。

```blade
{{-- ❌ 動作しません --}}
@foreach ($items as $item)
    @island
        {{ $item->name }}
    @endisland
@endforeach

{{-- ❌ これも動作しません --}}
@if ($showRevenue)
    @island
        売上: {{ $this->revenue }}
    @endisland
@endif

{{-- ✅ 代わりにループや条件分岐をIslandの内側へ置きます --}}
@island
    @if ($this->showRevenue)
        売上: {{ $this->revenue }}
    @endif

    @foreach ($this->items as $item)
        {{ $item->name }}
    @endforeach
@endisland
```

**状態の同期**: Islandのリクエストは並列実行されますが、Islandとルートコンポーネントは同じ状態を変更できます。複数のリクエストが同時に実行されると状態が分岐する可能性があり、最後に返ったレスポンスが状態を決めます。

**Islandを使う場面**:
- 初回ページロードをブロックさせたくない高コストな計算
- 独自のインタラクションを持つ独立した領域
- UIの一部だけに影響するリアルタイム更新
- 大きなコンポーネントのパフォーマンスボトルネック

静的な内容、密接に結合したUI、すでに高速にレンダリングされる単純なコンポーネントにはIslandは必要ありません。

## 関連項目

- **[ネスト](/nesting)** — 子コンポーネントを使う別の方法
- **[遅延読み込み](/lazy)** — 高コストな内容の読み込みを遅延する
- **[算出プロパティ](/computed-properties)** — メモ化でIslandのパフォーマンスを最適化する
- **[@island](/directive-island)** — 独立した更新領域を作成する

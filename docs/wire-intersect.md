Livewireの`wire:intersect`ディレクティブを使うと、要素がビューポートに入ったとき、または出たときにアクションを実行できます。遅延読み込み、アナリティクスのトリガー、スクロールベースの操作に便利です。

## 基本的な使い方

最も単純な形式では、要素が表示されたときにアクションを実行します。

```blade
<div wire:intersect="loadMore">
    <!-- ビューに入るとコンテンツを読み込む -->
</div>
```

要素がビューポートに入ると、コンポーネントの`loadMore`アクションが呼び出されます。

## 入る・出るイベント

入ったとき、出たとき、またはその両方でアクションを実行するか指定できます。

```blade
<!-- ビューポートに入ったとき（デフォルト） -->
<div wire:intersect="trackView">...</div>

<!-- ビューポートに入ったとき（明示的） -->
<div wire:intersect:enter="trackView">...</div>

<!-- ビューポートから出たとき -->
<div wire:intersect:leave="pauseVideo">...</div>
```

## 表示割合のモディファイア

トリガーする前に、要素がどの程度表示されている必要があるかを制御できます。

```blade
<!-- 一部でも表示されたとき（デフォルト） -->
<div wire:intersect="load">...</div>

<!-- 半分表示されたとき -->
<div wire:intersect.half="load">...</div>

<!-- 完全に表示されたとき -->
<div wire:intersect.full="load">...</div>

<!-- 任意のしきい値（0〜100）でトリガー -->
<div wire:intersect.threshold.25="load">...</div>
```

## マージン

ビューポートの周囲にマージンを追加し、要素が入る前や出た後にアクションをトリガーできます。

```blade
<!-- ビューポートに入る200px前にトリガー -->
<div wire:intersect.margin.200px="loadMore">...</div>

<!-- パーセントによるマージン -->
<div wire:intersect.margin.10%="loadMore">...</div>

<!-- 各辺（上、右、下、左）で異なるマージン -->
<div wire:intersect.margin.10%.25px.25px.25px="loadMore">...</div>
```

## 1回だけ実行する

`.once`モディファイアを使うと、最初の交差時だけアクションが実行されます。

```blade
<div wire:intersect.once="trackImpression">
    <!-- 複数回スクロールして通過しても、アクションは1回だけ実行される -->
</div>
```

ユーザーが最初に何かを見た時だけ記録したいアナリティクスやトラッキングに特に便利です。

## モディファイアの組み合わせ

複数のモディファイアを組み合わせて、正確な動作を作れます。

```blade
<!-- 半分表示されたとき、100pxのマージン付きで1回だけ読み込む -->
<div wire:intersect.once.half.margin.100px="loadSection">
    <!-- ... -->
</div>
```

## 一般的な用途

### 無限スクロール

```blade
<?php

use Livewire\Component;

new class extends Component {
    public $page = 1;
    public $posts = [];

    public function mount()
    {
        $this->loadPosts();
    }

    public function loadPosts()
    {
        $newPosts = Post::latest()
            ->skip(($this->page - 1) * 10)
            ->take(10)
            ->get();

        $this->posts = array_merge($this->posts, $newPosts->toArray());
        $this->page++;
    }
};
?>

<div>
    @foreach ($posts as $post)
        <div>{{ $post['title'] }}</div>
    @endforeach

    <div wire:intersect="loadPosts">
        さらに投稿を読み込み中...
    </div>
</div>
```

### 画像の遅延読み込み

```blade
<?php

use Livewire\Component;

new class extends Component {
    public $imageLoaded = false;

    public function loadImage()
    {
        $this->imageLoaded = true;
    }
};
?>

<div>
    @if ($imageLoaded)
        <img src="/path/to/image.jpg" alt="商品">
    @else
        <div wire:intersect.once="loadImage" class="bg-gray-200 h-64">
            <!-- プレースホルダー -->
        </div>
    @endif
</div>
```

### 表示状態の追跡

```blade
<div wire:intersect:enter.once="trackView" wire:intersect:leave="trackLeave">
    <!-- ユーザーがこのコンテンツを見たとき、離れたときに追跡 -->
</div>
```

## Alpineのx-intersectとの比較

Alpine.jsに慣れているなら、`wire:intersect`は`x-intersect`と同じように動作しますが、Alpineの式ではなくLivewireアクションをトリガーします。モディファイアと動作はAlpineユーザーに馴染みやすいよう設計されています。

## リファレンス

```blade
wire:intersect="action"
wire:intersect:enter="action"
wire:intersect:leave="action"
```

### モディファイア

| モディファイア | 説明 |
|----------|-------------|
| `.once` | 最初の交差時だけアクションを実行する |
| `.half` | 要素の半分が表示されたときにトリガーする |
| `.full` | 要素全体が表示されたときにトリガーする |
| `.threshold.[0-100]` | 任意の表示割合のしきい値でトリガーする |
| `.margin.[value]` | ビューポートの周囲にマージンを追加する（例：`.margin.200px`、`.margin.10%`） |

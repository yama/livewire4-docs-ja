他の多くのコンポーネントベースフレームワークと同様、Livewireのコンポーネントもネストできます。つまり、1つのコンポーネント内で複数のコンポーネントをレンダリングできます。

ただし、Livewireのネストの仕組みは他のフレームワークと異なるため、知っておくべき影響と制約があります。

> [!tip] まずhydrationを理解する
> Livewireのネストを学ぶ前に、Livewireがコンポーネントをhydrateする仕組みを理解しておくと役立ちます。[hydrationのドキュメント](/hydration)を参照してください。

## すべてのコンポーネントは独立している {#every-component-is-an-island}

Livewireでは、ページ上の各コンポーネントが状態を追跡し、他のコンポーネントから独立して更新します。

次の`Posts`と、ネストされた`ShowPost`を考えてみましょう。

```php
<?php
namespace App\Livewire;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;
class Posts extends Component
{
    public $postLimit = 2;
    public function render()
    {
        return view('livewire.posts', [
            'posts' => Auth::user()->posts()->limit($this->postLimit)->get(),
        ]);
    }
}
```

```blade
<div>
    投稿数: <input type="number" wire:model.live="postLimit">
    @foreach ($posts as $post)
        <livewire:show-post :$post :wire:key="$post->id">
    @endforeach
</div>
```

```php
<?php
namespace App\Livewire;
use Livewire\Component;
use App\Models\Post;
class ShowPost extends Component
{
    public Post $post;
    public function render() { return view('livewire.show-post'); }
}
```

```blade
<div>
    <h1>{{ $post->title }}</h1>
    <p>{{ $post->content }}</p>
    <button wire:click="$refresh">投稿を更新</button>
</div>
```

初回ページ読み込み時のコンポーネントツリー全体のHTMLは次のようになります。

```html
<div wire:id="123" wire:snapshot="...">
    投稿数: <input type="number" wire:model.live="postLimit">
    <div wire:id="456" wire:snapshot="...">
        <h1>最初の投稿</h1>
        <p>投稿本文</p>
        <button wire:click="$refresh">投稿を更新</button>
    </div>
    <div wire:id="789" wire:snapshot="...">
        <h1>2番目の投稿</h1>
        <p>投稿本文</p>
        <button wire:click="$refresh">投稿を更新</button>
    </div>
</div>
```

親コンポーネントには、自身のテンプレートと、その中にネストされた全コンポーネントのテンプレートが含まれています。各コンポーネントは独立しているため、それぞれ固有のIDとスナップショット（`wire:id`と`wire:snapshot`）をHTMLに持ちます。

### 子を更新する

子の「投稿を更新」をクリックすると、次がサーバーへ送られます。

```js
{
    memo: { name: 'show-post', id: '456' },
    state: { ... },
}
```

応答HTMLは次のようになります。

```html
<div wire:id="456">
    <h1>最初の投稿</h1>
    <p>投稿本文</p>
    <button wire:click="$refresh">投稿を更新</button>
</div>
```

子で更新がトリガーされた場合、そのコンポーネントのデータだけが送信され、そのコンポーネントだけが再レンダリングされます。

### 親を更新する

念のため、親の`Posts`コンポーネントのBladeテンプレートをもう一度示します。

```blade
<div>
    投稿数: <input type="number" wire:model.live="postLimit">

    @foreach ($posts as $post)
        <livewire:show-post :$post :wire:key="$post->id">
    @endforeach
</div>
```

ユーザーが「投稿数」の値を`2`から`1`へ変更すると、更新が発生するのは親だけです。

リクエストペイロードは、次のようになります。

```js
{
    updates: { postLimit: 1 },
    snapshot: {
        memo: { name: 'posts', id: '123' },
        state: { postLimit: 2, ... },
    },
}
```

サーバーへ送られるのは親のスナップショットだけです。親の再レンダリング時に子のスナップショットがないため、子は再レンダリングされません。Livewireは子コンポーネントに遭遇するとプレースホルダーを描画します。

```html
<div wire:id="123">
    投稿数: <input type="number" wire:model.live="postLimit">
    <div wire:id="456"></div>
</div>
```

フロントエンドで受け取ると、Livewireは子のプレースホルダーを賢くスキップして古いHTMLを新しいHTMLへmorphします。その結果、親の最終DOMは次のようになります。

```html
<div wire:id="123">
    投稿数: <input type="number" wire:model.live="postLimit">
    <div wire:id="456">
        <h1>最初の投稿</h1>
        <p>投稿本文</p>
        <button wire:click="$refresh">投稿を更新</button>
    </div>
</div>
```

## パフォーマンスへの影響

独立コンポーネントの構成には、アプリケーションへ良い影響と悪い影響の両方があります。

高コストな部分を分離できるのは利点です。遅いデータベースクエリを独立コンポーネントへ隔離すれば、その負荷がページ全体へ影響しません。

一方、コンポーネントが完全に分離されるため、コンポーネント間の通信や依存関係が難しくなるのが最大の欠点です。親から子へ渡したプロパティはリアクティブではなく、親のリクエストで値が変わっても子は更新されません。

Livewireはこの問題に対して、[リアクティブプロパティ](/nesting#reactive-props)、[Modelableコンポーネント](/nesting#binding-to-child-data-using-wiremodel)、[`$parent`オブジェクト](/nesting#directly-accessing-the-parent-from-the-child)などのAPIを提供しています。

この仕組みを理解すれば、アプリケーションでいつ、どのようにコンポーネントをネストするかをより適切に判断できます。

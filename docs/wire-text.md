`wire:text` は、コンポーネントのプロパティや式をもとに、要素のテキスト内容を動的に更新するディレクティブです。Bladeの `{{ }}` 構文とは異なり、コンポーネントを再レンダリングするネットワークリクエストなしで内容を更新します。

Alpineの `x-text` ディレクティブに慣れていれば、この2つは基本的に同じものです。

## 基本的な使い方

ネットワークラウンドトリップを待たず、Livewireプロパティの更新を楽観的に表示する例です。

```php
use Livewire\Component;
use App\Models\Post;

class ShowPost extends Component
{
    public Post $post;
    public $likes;

    public function mount()
    {
        $this->likes = $this->post->like_count;
    }

    public function like()
    {
        $this->post->like();
        $this->likes = $this->post->fresh()->like_count;
    }
}
```

```blade
<div>
    <button x-on:click="$wire.likes++" wire:click="like">❤️ いいね</button>

    いいね: <span wire:text="likes"></span>
</div>
```

ボタンをクリックすると、`$wire.likes++` が `wire:text` を通じて表示中の件数を即座に更新します。一方、`wire:click="like"` はバックグラウンドでデータベースへ変更を保存します。

このパターンにより、`wire:text` はLivewireで楽観的UIを作るのに適しています。

## リファレンス

```blade
wire:text="expression"
```

このディレクティブに修飾子はありません。

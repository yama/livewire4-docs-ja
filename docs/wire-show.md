Livewireの `wire:show` ディレクティブを使うと、式の結果に応じて要素を簡単に表示・非表示にできます。

`wire:show` はBladeの `@if` とは異なり、要素をDOMから削除せず、CSS（`display: none`）で表示状態を切り替えます。要素はページに残ったまま隠れるため、サーバーラウンドトリップなしで滑らかなトランジションを実現できます。

## 基本的な使い方

`wire:show` で「投稿を作成」モーダルを切り替える実践的な例です。

```php
use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    public $showModal = false;
    public $content = '';

    public function save()
    {
        Post::create(['content' => $this->content]);
        $this->reset('content');
        $this->showModal = false;
    }
}
```

```blade
<div>
    <button x-on:click="$wire.showModal = true">新しい投稿</button>

    <div wire:show="showModal">
        <form wire:submit="save">
            <textarea wire:model="content"></textarea>
            <button type="submit">投稿を保存</button>
        </form>
    </div>
</div>
```

「新しい投稿」ボタンをクリックすると、サーバーラウンドトリップなしでモーダルが表示されます。投稿の保存に成功すると、モーダルが隠れ、フォームがリセットされます。

## トランジションを使う

`wire:show` とAlpine.jsのトランジションを組み合わせて、滑らかな表示・非表示アニメーションを作れます。`wire:show` はCSSの `display` プロパティだけを切り替えるため、Alpineの `x-transition` ディレクティブと完全に連携します。

```blade
<div>
    <button x-on:click="$wire.showModal = true">新しい投稿</button>

    <div wire:show="showModal" x-transition.duration.500ms>
        <form wire:submit="save">
            <textarea wire:model="content"></textarea>
            <button type="submit">投稿を保存</button>
        </form>
    </div>
</div>
```

上のAlpine.jsトランジションクラスにより、モーダルの表示・非表示時にフェードと拡大縮小の効果が生まれます。

[x-transitionの完全なドキュメントを見る →](https://alpinejs.dev/directives/transition)

## リファレンス

```blade
wire:show="expression"
```

このディレクティブに修飾子はありません。

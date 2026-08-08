`wire:transition`を使うと、ブラウザ標準の[View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)で、要素の表示・非表示・変更時に滑らかなアニメーションを付けられます。

JavaScriptベースのアニメーションライブラリと異なり、View Transitionsはハードウェアアクセラレーションを使ってブラウザがネイティブに処理するため、オーバーヘッドが少なく滑らかです。

## 基本的な使い方

Livewireの更新中に追加・削除・変更される可能性がある要素へ`wire:transition`を追加します。

```php
class ShowPost extends Component
{
    public Post $post;

    public $showComments = false;
}
```

```blade
<div>
    <button wire:click="$toggle('showComments')">コメントを切り替え</button>

    @if ($showComments)
        <div wire:transition> <!-- [tl! highlight] -->
            @foreach ($post->comments as $comment)
                <div>{{ $comment->body }}</div>
            @endforeach
        </div>
    @endif
</div>
```

コメントの表示・非表示が、突然現れたり消えたりせず、ブラウザによって滑らかにクロスフェードされます。

## 名前付きトランジション

デフォルトでは、Livewireは`wire:transition`を持つ要素のview-transition-nameに`match-element`を設定します。カスタム名を指定すると、より高度な効果を使えます。

```blade
<div wire:transition="sidebar">...</div>
```

要素の`view-transition-name` CSSプロパティが`sidebar`になり、CSSで対象にしてカスタムアニメーションを設定できます。

## CSSでアニメーションをカスタマイズする

View TransitionsはCSSだけで制御できます。view-transition疑似要素を対象にしてアニメーションをカスタマイズします。

```css
/* 特定の要素のトランジションをカスタマイズ */
::view-transition-old(sidebar) {
    animation: 300ms ease-out both slide-out;
}

::view-transition-new(sidebar) {
    animation: 300ms ease-in both slide-in;
}

@keyframes slide-out {
    to { transform: translateX(-100%); }
}

@keyframes slide-in {
    from { transform: translateX(100%); }
}
```

View Transitions APIではスタイルできる疑似要素が3つあります。
- `::view-transition-old(name)` — 退出する要素のスナップショット
- `::view-transition-new(name)` — 入ってくる要素のスナップショット
- `::view-transition-group(name)` — 両方のスナップショットのコンテナ

## トランジションの種類

ステップウィザードのように方向によって異なるアニメーションが必要な場合は、トランジションの種類を使えます。これにより「前へ」と「後ろへ」を異なる方法でアニメーションできます。

`$this->transition()`メソッドで種類を設定します。

```php
class Wizard extends Component
{
    public $step = 1;

    public function goToStep($step)
    {
        $this->transition(type: $step > $this->step ? 'forward' : 'backward');

        $this->step = $step;
    }
}
```

CSSの`:active-view-transition-type()`セレクターで種類を対象にします。

```css
html:active-view-transition-type(forward) {
    &::view-transition-old(content) {
        animation: 300ms ease-out both slide-out-left;
    }
    &::view-transition-new(content) {
        animation: 300ms ease-in both slide-in-right;
    }
}

html:active-view-transition-type(backward) {
    &::view-transition-old(content) {
        animation: 300ms ease-out both slide-out-right;
    }
    &::view-transition-new(content) {
        animation: 300ms ease-in both slide-in-left;
    }
}

@keyframes slide-out-left {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(-100%); opacity: 0; }
}

@keyframes slide-in-right {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-out-right {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

@keyframes slide-in-left {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
```

常に同じ方向へ遷移するメソッドには、代わりに`#[Transition]`属性を使えます。

```php
use Livewire\Attributes\Transition;

class Wizard extends Component
{
    public $step = 1;

    #[Transition(type: 'forward')]
    public function next()
    {
        $this->step++;
    }

    #[Transition(type: 'backward')]
    public function previous()
    {
        $this->step--;
    }
}
```

### 型付きswap中の名前なしトランジション

型付きトランジションが有効なとき、Livewireはswapを1つの統合された単位として扱います。そのswap内の*名前なし*`wire:transition`要素は名前なしのまま親のスナップショットに追従し、ブラウザのデフォルトフェードによる独立したグループにはなりません。

```blade
<div wire:transition="slide">
    <p>ステップの内容</p>

    {{-- 名前なし：型付きswap中は親の「slide」に追従する --}}
    <div wire:transition>
        <button>保存</button>
    </div>
</div>
```

型付きswap中に内部要素を独立してアニメーションさせるには、明示的な名前を付けます。

```blade
<div wire:transition="badge">...</div>
```

型付きトランジションの外（バリデーションエラーが表示される通常のモーフなど）では、名前なしの`wire:transition`要素は引き続き`match-element`を使い、以前と同じように独立してアニメーションします。

## トランジションをスキップする

「リセット」ボタンでアニメーションなしに最初のステップへ戻るなど、特定のアクションのトランジションを無効にしたい場合があります。

```php
public function reset()
{
    $this->skipTransition();

    $this->step = 1;
}
```

または`skip: true`を指定した`#[Transition]`属性を使います。

```php
use Livewire\Attributes\Transition;

#[Transition(skip: true)]
public function reset()
{
    $this->step = 1;
}
```

## reduced motionを尊重する

Livewireはユーザーの[`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion#user_preferences)設定を自動的に尊重します。有効な場合、動きに敏感なユーザーの不快感を避けるためトランジションを無効にします。

## ブラウザサポート

View TransitionsはChrome 111以降、Edge 111以降、Safari 18以降でサポートされています。未対応ブラウザでは要素がアニメーションなしで表示・非表示になります。機能は動作しますが、視覚的なトランジションはありません。

> [!warning] Firefoxのサポートは限定的です
> Firefox 144以降は基本的なview transitionsをサポートしますが、トランジションの種類には対応していません。

[caniuse.comでブラウザサポートを確認 →](https://caniuse.com/view-transitions)

## 関連項目

- **[wire:show](/wire-show)** — CSSのdisplayで表示を切り替える
- **[ローディング状態](/loading-states)** — リクエスト中にローディング表示を出す
- **[Alpineのトランジション](https://alpinejs.dev/directives/transition)** — より複雑なアニメーションに使う

## リファレンス

```blade
wire:transition="name"
```

| 式 | 説明 |
|------------|-------------|
| （なし） | view-transition-nameに`match-element`を使う |
| `"name"` | 指定した文字列をview-transition-nameに使う |

このディレクティブにモディファイアはありません。

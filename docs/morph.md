LivewireコンポーネントがブラウザのDOMを更新するとき、Livewireは「morphing」と呼ぶ賢い方法で処理します。_morph_は_replace_の反対の概念です。

コンポーネントが更新されるたびにHTML全体を置き換えるのではなく、Livewireは現在のHTMLと新しいHTMLを動的に比較し、差分を特定して必要な場所だけを外科的に変更します。

これにより、イベントリスナー、フォーカス状態、フォーム入力値など、変更されていない要素が更新間で保持されます。毎回DOMを消去して新しく描画するよりパフォーマンスも向上します。

## morphingの仕組み

Livewireがリクエスト間で更新する要素を決める仕組みを、次の`Todos`コンポーネントで見てみましょう。

```php
class Todos extends Component
{
    public $todo = '';

    public $todos = [
        'first',
        'second',
    ];

    public function add()
    {
        $this->todos[] = $this->todo;
    }
}
```

```blade
<form wire:submit="add">
    <ul>
        @foreach ($todos as $item)
            <li wire:key="{{ $loop->index }}">{{ $item }}</li>
        @endforeach
    </ul>
    <input wire:model="todo">
</form>
```

初回レンダリングでは次のHTMLが出力されます。

```html
<form wire:submit="add">
    <ul>
        <li>first</li>
        <li>second</li>
    </ul>
    <input wire:model="todo">
</form>
```

入力欄に「third」と入力して`[Enter]`を押すと、新しいHTMLは次のようになります。

```html
<form wire:submit="add">
    <ul>
        <li>first</li>
        <li>second</li>
        <li>third</li> <!-- [tl! add] -->
    </ul>
    <input wire:model="todo">
</form>
```

更新を処理すると、Livewireは元のDOMを新しいHTMLへ_morph_します。Livewireは両方のHTMLツリーを同時にたどり、各要素を比較して追加・変更・削除があれば必要な変更だけを行います。

## morphingの欠点

morphingアルゴリズムがHTMLツリーの差分を正しく特定できず、アプリケーションに問題を起こす場合があります。

### 中間要素の挿入

次の`CreatePost`コンポーネントを考えます。

```blade
<form wire:submit="save">
    <div><input wire:model="title"></div>
    @if ($errors->has('title'))
        <div>{{ $errors->first('title') }}</div>
    @endif
    <div><button>保存</button></div>
</form>
```

バリデーションエラーが発生すると、Livewireは新しい`<div>`を既存の`<div>`と置き換えるのか、途中に挿入するのか判断できません。その結果、ボタンがエラーメッセージに変わり、さらに末尾に要素を追加するなど、要素を壊して再作成することがあります。

この問題により、イベントリスナーや状態が失われたり誤った要素へ移動したり、コンポーネントがリセット・重複したり、Alpineの状態が失われたりします。

### 内部ルックアヘッド

Livewireはmorphing中に後続の要素と内容を確認してから変更する追加ステップを持ち、多くの場合この問題を防ぎます。

### morphマーカーの注入

LivewireはバックエンドでBladeテンプレート内の条件分岐を検出し、JavaScriptがmorphingの手がかりにできるHTMLコメントマーカーで囲みます。

```blade
<form wire:submit="save">
    <div><input wire:model="title"></div>
    <!--[if BLOCK]><![endif]--> <!-- [tl! highlight] -->
    @if ($errors->has('title'))
        <div>エラー：{{ $errors->first('title') }}</div>
    @endif
    <!--[if ENDBLOCK]><![endif]--> <!-- [tl! highlight] -->
    <div><button>保存</button></div>
</form>
```

マーカーにより、変更と追加の違いを検出しやすくなります。正規表現でテンプレートを解析するため条件分岐の検出に失敗することもあり、不要なら`config/livewire.php`で無効にできます。

```php
'inject_morph_markers' => false,
```

#### 条件分岐をラップする

上の方法で解決しない場合は、常に存在する要素で条件分岐やループを囲むのが最も確実です。

```blade
<form wire:submit="save">
    <div><input wire:model="title"></div>
    <div> <!-- [tl! highlight] -->
        @if ($errors->has('title'))
            <div>{{ $errors->first('title') }}</div>
        @endif
    </div> <!-- [tl! highlight] -->
    <div><button>保存</button></div>
</form>
```

#### morphingを回避する

要素でmorphingを完全に回避するには、[wire:replace](/wire-replace)を使って既存要素をmorphせず子要素をすべて置き換えます。

## 関連項目

- **[Hydration](/hydration)** — Livewireのリクエストライフサイクルを理解する
- **[コンポーネント](/components)** — コンポーネントのレンダリングと更新
- **[wire:replace](/wire-replace)** — 特定要素でmorphingを回避する

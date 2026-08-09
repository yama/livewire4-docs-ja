ユーザーがLivewireコンポーネントを操作するとき、ネットワークリクエスト中に視覚的なフィードバックを表示することは、よいユーザー体験に不可欠です。Livewireは、ネットワークリクエストを発生させるすべての要素に `data-loading` 属性を自動追加するため、ローディング状態を簡単にスタイル設定できます。

> [!tip] `wire:loading` より `data-loading` を優先する
> Livewireには、リクエスト中に要素を切り替える [`wire:loading`](/wire-loading) ディレクティブもあります。基本的な表示／非表示だけなら `wire:loading` のほうが簡単ですが、固有の対象を指定するために `wire:target` が必要になる、コンポーネント間のイベントではうまく動作しないなど、制限があります。多くの場合、このガイドで示す `data-loading` セレクターを使うことをおすすめします。

## 基本的な使い方

Livewireは、ネットワークリクエストを発生させる要素に `data-loading` 属性を自動追加します。`wire:loading` ディレクティブを使わず、CSSやTailwindでローディング状態を直接スタイル設定できます。

`wire:click` を持つボタンの簡単な例です。

```blade
<button wire:click="save" class="data-loading:opacity-50">
    変更を保存
</button>
```

ボタンをクリックしてリクエストが実行中になると、要素に `data-loading` 属性が存在するため、自動的に半透明になります。

## 仕組み

`data-loading` 属性は、次のようなネットワークリクエストを発生させる要素に自動追加されます。

- アクション: `wire:click="save"`
- フォーム送信: `wire:submit="create"`
- プロパティ更新: `wire:model.live="search"`
- イベント: `wire:click="$dispatch('refresh')"`

重要なのは、別のコンポーネントが処理するイベントをディスパッチした場合にも属性が追加されることです。

```blade
<button wire:click="$dispatch('refresh-stats')">
    更新
</button>
```

イベントが別のコンポーネントで受け取られても、イベントをディスパッチしたボタンにはネットワークリクエスト中 `data-loading` 属性が付与されます。

## Tailwindでスタイル設定する

Tailwind v4以降では、`data-loading` 属性を扱う強力なセレクターが提供されています。

### 基本的なスタイル設定

`data-loading:` バリアントを使うと、要素のローディング中にスタイルを適用できます。

```blade
<button wire:click="save" class="data-loading:opacity-50">
    保存
</button>
```

### ローディング中に要素を表示する

ローディング中だけ要素を表示するには、`not-data-loading:hidden` バリアントを使います。

```blade
<button wire:click="save">
    保存
</button>

<span class="not-data-loading:hidden">
    保存中...
</span>
```

要素の表示形式（flex、inline、gridなど）に関係なく動作するため、`hidden data-loading:block` よりこの方法がおすすめです。

### 子要素をスタイル設定する

親要素が `data-loading` 属性を持つとき、`in-data-loading:` バリアントで子要素をスタイル設定できます。

```blade
<button wire:click="save">
    <span class="in-data-loading:hidden">保存</span>
    <span class="not-in-data-loading:hidden">保存中...</span>
</button>
```

> [!warning] `in-data-loading` バリアントはすべての祖先に適用される
> `in-data-loading:` バリアントは、ツリーのどれほど上にあるかに関係なく、いずれかの祖先要素が `data-loading` 属性を持つと発動します。ローディング状態をネストしている場合、予期しない動作につながることがあります。

### 親要素をスタイル設定する

`has-data-loading:` バリアントを使うと、`data-loading` を持つ子要素を含む親要素をスタイル設定できます。

```blade
<div class="has-data-loading:opacity-50">
    <button wire:click="save">保存</button>
</div>
```

ボタンをクリックすると、親のdiv全体が半透明になります。

### 兄弟要素をスタイル設定する

Tailwindの `peer` ユーティリティと `peer-data-loading:` バリアントを使うと、兄弟要素をスタイル設定できます。

```blade
<div>
    <button wire:click="save" class="peer">
        保存
    </button>

    <span class="peer-data-loading:opacity-50">
        保存中...
    </span>
</div>
```

### 複雑なセレクター

より高度なスタイル設定では、任意バリアントを使って特定の要素を対象にできます。

```blade
<!-- ローディング中、直接の子要素をすべてスタイル設定 -->
<div class="[&[data-loading]>*]:opacity-50" wire:click="save">
    <span>子1</span>
    <span>子2</span>
</div>

<!-- 特定の子孫要素をスタイル設定 -->
<button class="[&[data-loading]_.icon]:animate-spin" wire:click="save">
    <svg class="icon"><!-- spinner --></svg>
    保存
</button>
```

Tailwindの状態バリアントと任意セレクターについては、[Tailwind CSSのドキュメント](https://tailwindcss.com/docs/hover-focus-and-other-states)を参照してください。

## `wire:loading` より優れている点

`data-loading` 属性による方法には、従来の `wire:loading` ディレクティブに対して次の利点があります。

1. **対象指定が不要**: `wire:loading` は反応するアクションを `wire:target` で指定することがよくありますが、`data-loading` 属性はリクエストを発生させた要素に自動的にスコープされます。
2. **より洗練されたスタイル設定**: Tailwindのバリアントシステムにより、マークアップ上で宣言的にローディング状態をスタイル設定できます。
3. **イベントで動作する**: 別コンポーネントが処理するイベントをディスパッチした場合にも属性が追加されます。これは以前 `wire:loading` では難しいことでした。
4. **よりよい合成**: Tailwindのバリアントによるスタイルは、他のユーティリティクラスや状態とよりうまく組み合わせられます。

## Tailwind 4が必要

> [!info] 高度なバリアントにはTailwind v4以降が必要
> `in-data-loading:`、`has-data-loading:`、`peer-data-loading:`、`not-data-loading:` バリアントにはTailwind CSS v4以降が必要です。古いTailwindを使っている場合でも、`data-loading:` 構文または標準CSSで `data-loading` 属性を対象にできます。

## 通常のCSSで使う

Tailwindを使っていない場合は、標準CSSで `data-loading` 属性を対象にできます。

```css
[data-loading] {
    opacity: 0.5;
}

button[data-loading] {
    background-color: #ccc;
}
```

CSSで子要素をスタイル設定することもできます。

```css
[data-loading] .loading-text {
    display: inline;
}

[data-loading] .default-text {
    display: none;
}
```

## 関連項目

- **[wire:loading](/wire-loading)** — リクエスト中に要素を表示・非表示にする
- **[アクション](/actions)** — アクション処理中のフィードバックを表示する
- **[フォーム](/forms)** — フォーム送信の進行状況を示す
- **[遅延読み込み](/lazy)** — 遅延コンポーネントのローディング状態を表示する

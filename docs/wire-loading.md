ローディング表示は、優れたユーザーインターフェースを作る重要な要素です。サーバーへリクエスト中であることを視覚的に知らせ、処理完了を待っているとユーザーに伝えます。

> [!tip] 代わりにdata-loadingセレクターの使用を検討してください
> `wire:loading`は単純な表示・非表示には適していますが、Livewire v4ではネットワークリクエストをトリガーする要素に`data-loading`属性が自動追加されます。この方法はより簡単で柔軟なことが多く、`wire:target`なしでTailwindからローディング状態を直接スタイルでき、他のコンポーネントへのイベントディスパッチでも自然に動作します。[data-loadingについて詳しく見る →](/loading-states)

## 基本的な使い方

Livewireにはローディング表示を制御する、シンプルで強力な`wire:loading`構文があります。要素に追加すると、デフォルトではCSSの`display: none`で非表示になり、サーバーへリクエストが送信されると表示されます。

```blade
<form wire:submit="save">
    <!-- ... -->

    <button type="submit">保存</button>

    <div wire:loading> <!-- [tl! highlight:2] -->
        投稿を保存中...
    </div>
</form>
```

ユーザーが「保存」を押すと、`save`アクションの実行中にボタンの下へ「投稿を保存中...」と表示されます。サーバーから応答を受け取りLivewireが処理すると、メッセージは消えます。

### 要素を削除する

逆に、`.remove`を追加するとデフォルトで要素を表示し、サーバーへのリクエスト中は非表示にできます。

```blade
<div wire:loading.remove>...</div>
```

## クラスを切り替える

要素全体の表示を切り替えるだけでなく、リクエスト中に既存要素のCSSクラスを切り替えると便利なことがあります。背景色の変更、透明度を下げる、回転アニメーションなどに使えます。

[Tailwind](https://tailwindcss.com/)の`opacity-50`クラスで、送信中の「保存」ボタンを薄くする例です。

```blade
<button wire:loading.class="opacity-50">保存</button>
```

要素の切り替えと同様、`wire:loading`に`.remove`を追加するとクラスの逆の操作ができます。次の例では、「保存」を押すとボタンの`bg-blue-500`クラスが削除されます。

```blade
<button class="bg-blue-500" wire:loading.class.remove="bg-blue-500">
    保存
</button>
```

## 属性を切り替える

フォーム送信時、Livewireは自動的に送信ボタンを無効化し、処理中は各入力要素に`readonly`属性を追加します。

さらに`.attr`モディファイアを使うと、ほかの属性やフォーム外の要素の属性も切り替えられます。

```blade
<button
    type="button"
    wire:click="remove"
    wire:loading.attr="disabled"
>
    削除
</button>
```

上のボタンは送信ボタンではないため、Livewireのフォーム処理では押しても無効になりません。そこで`wire:loading.attr="disabled"`を手動で追加しています。

## 特定のアクションを対象にする

デフォルトでは、コンポーネントがサーバーへリクエストするたび`wire:loading`がトリガーされます。

複数の要素がリクエストをトリガーするコンポーネントでは、ローディング表示を個々のアクションに絞るべきです。

たとえば「投稿を保存」フォームに、フォームを送信する「保存」ボタンと、コンポーネントで`remove`アクションを実行する「削除」ボタンがあるとします。

`wire:loading`要素に`wire:target`を追加すると、「削除」ボタンがクリックされたときだけ表示できます。

```blade
<form wire:submit="save">
    <!-- ... -->

    <button type="submit">保存</button>

    <button type="button" wire:click="remove">削除</button>

    <div wire:loading wire:target="remove">  <!-- [tl! highlight:2] -->
        投稿を削除中...
    </div>
</form>
```

「削除」を押すと表示されますが、「保存」を押したときには表示されません。

### 複数アクションを対象にする

ページ上のすべてではなく一部のアクションに反応させたい場合、`wire:target`へカンマ区切りで複数のアクションを渡せます。

```blade
<form wire:submit="save">
    <input type="text" wire:model.live.blur="title">
    <button type="submit">保存</button>
    <button type="button" wire:click="remove">削除</button>
    <div wire:loading wire:target="save, remove">  <!-- [tl! highlight:2] -->
        投稿を更新中...
    </div>
</form>
```

これで表示は「削除」または「保存」ボタンを押したときだけ表示され、`$title`フィールドが送信されたときには表示されません。

### アクションのパラメータを対象にする

パラメータ付きアクションを対象にする場合、`wire:target`に完全なアクション名とパラメータを指定します。

```blade
<div>
    @foreach ($posts as $post)
        <div wire:key="{{ $post->id }}">
            <h2>{{ $post->title }}</h2>
            <button wire:click="remove({{ $post->id }})">削除</button>
            <div wire:loading wire:target="remove({{ $post->id }})">  <!-- [tl! highlight:2] -->
                投稿を削除中...
            </div>
        </div>
    @endforeach
</div>
```

`wire:target="remove"`に投稿のIDを渡さないと、ページ上のどのボタンをクリックしても表示されます。一意のパラメータを渡すことで、一致するパラメータのときだけ表示されます。

### プロパティ更新を対象にする

プロパティの更新を対象にするには、プロパティ名を`wire:target`に渡します。

```blade
<div wire:loading wire:target="title">
    タイトルを保存中...
</div>
```

### 特定のローディング対象を除外する

`wire:target.except`を使うと、特定のアクションを除外できます。

```blade
<div wire:loading wire:target.except="save">
    保存以外の処理中...
</div>
```

## CSSのdisplayプロパティをカスタマイズする

デフォルトでは`wire:loading`要素に`display: none`を使います。表示時に別のdisplay値を使うには、次のモディファイアを使います。

`wire:loading`を追加するとLivewireはCSSの`display`を更新します。デフォルトでは非表示に`none`、表示に`inline-block`を使います。`inline-block`以外（例えば`flex`）を使う場合は、対応するモディファイアを追加します。

```blade
<div class="flex" wire:loading.flex>...</div>
```

利用できるdisplay値の一覧です。

```blade
<div wire:loading.inline>...</div>
<div wire:loading.inline-flex>...</div>
<div wire:loading.block>...</div>
<div wire:loading.table>...</div>
<div wire:loading.flex>...</div>
<div wire:loading.grid>...</div>
```

## ローディング表示を遅延する

短いリクエストでローディング表示が一瞬だけ見えると、役立つ表示ではなくちらつきになることがあります。

`.delay`モディファイアを使うと表示を遅延できます。次の要素はリクエストが200ミリ秒を超えた場合だけ表示され、それより前に完了すれば表示されません。

```blade
<div wire:loading.delay>...</div>
```

Livewireの時間間隔エイリアスで遅延時間を指定できます。

```blade
<div wire:loading.delay.shortest>...</div> <!-- 50ms -->
<div wire:loading.delay.shorter>...</div>  <!-- 100ms -->
<div wire:loading.delay.short>...</div>    <!-- 150ms -->
<div wire:loading.delay>...</div>          <!-- 200ms -->
<div wire:loading.delay.long>...</div>     <!-- 300ms -->
<div wire:loading.delay.longer>...</div>   <!-- 500ms -->
<div wire:loading.delay.longest>...</div>  <!-- 1000ms -->
```

## data-loadingでスタイルする

Livewireはネットワークリクエストをトリガーする要素に`data-loading`属性を自動追加します。`wire:loading`ディレクティブなしでCSSやTailwindからローディング状態を直接スタイルできます。

### Tailwindのdata属性バリアント

```blade
<button
    wire:click="save"
    class="data-loading:opacity-50 data-loading:pointer-events-none"
>
    変更を保存
</button>
```

クリックしてリクエスト中になると、半透明になりクリックできなくなります。

### CSSを使う

```css
[data-loading] {
    opacity: 0.5;
    pointer-events: none;
}

button[data-loading] {
    background-color: #ccc;
    cursor: wait;
}
```

### 親要素と子要素をスタイルする

```blade
<div class="has-data-loading:opacity-50">
    <button wire:click="save">保存</button>
</div>
```

親に`data-loading`があるとき、子要素をスタイルすることもできます。

```blade
<button wire:click="save">
    <span class="in-data-loading:hidden">保存</span>
    <span class="hidden in-data-loading:block">保存中...</span>
</button>
```

## 関連項目

- **[ローディング状態](/loading-states)** — data-loading属性による最新の方法
- **[アクション](/actions)** — アクション処理中のフィードバックを表示する
- **[フォーム](/forms)** — フォーム送信の進捗を表示する

## リファレンス

```blade
wire:loading
wire:target="action"
wire:target="property"
wire:target.except="action"
```

### モディファイア

| モディファイア | 説明 |
|----------|-------------|
| `.remove` | デフォルトで表示し、ローディング中は非表示にする |
| `.class="class-name"` | ローディング中にCSSクラスを追加する |
| `.class.remove="class-name"` | ローディング中にCSSクラスを削除する |
| `.attr="attribute"` | ローディング中にHTML属性を追加する |
| `.delay` | 表示を200ms遅延する |
| `.delay.shortest` | 50ms遅延する |
| `.delay.shorter` | 100ms遅延する |
| `.delay.short` | 150ms遅延する |
| `.delay.long` | 300ms遅延する |
| `.delay.longer` | 500ms遅延する |
| `.delay.longest` | 1000ms遅延する |
| `.inline-flex` | `inline-flex`のdisplay値を使う |
| `.inline` | `inline`のdisplay値を使う |
| `.block` | `block`のdisplay値を使う |
| `.table` | `table`のdisplay値を使う |
| `.flex` | `flex`のdisplay値を使う |
| `.grid` | `grid`のdisplay値を使う |

Livewireで危険なアクションを実行する前に、ユーザーへ何らかの視覚的な確認を求めたい場合があります。

Livewireでは、`wire:click` や `wire:submit` などのアクションへ `wire:confirm` を追加するだけで簡単に実現できます。

投稿を削除するボタンへ確認ダイアログを追加する例です。

```blade
<button
    type="button"
    wire:click="delete"
    wire:confirm="この投稿を削除してもよいですか？"
>
    投稿を削除 <!-- [tl! highlight:-2,1] -->
</button>
```

ユーザーが「投稿を削除」をクリックすると、Livewireは確認ダイアログ（ブラウザ標準の確認アラート）を表示します。Escapeキーを押すかキャンセルするとアクションは実行されません。「OK」を押すとアクションが完了します。

## ユーザーに入力を求める

ユーザーのアカウントを完全に削除するような、さらに危険なアクションでは、特定の文字列を入力して確認するプロンプトを表示したい場合があります。

`wire:confirm` に `.prompt` 修飾子を付けると、ユーザーに入力を求め、入力が指定した文字列と一致した場合（大文字・小文字を区別する）だけアクションを確認できます。期待する文字列は `wire:confirm` の値の末尾に `|`（パイプ）で区切って指定します。

```blade
<button
    type="button"
    wire:click="delete"
    wire:confirm.prompt="本当に削除しますか？\n\n確認のためDELETEと入力してください|DELETE"
>
    アカウントを削除 <!-- [tl! highlight:-2,1] -->
</button>
```

「アカウントを削除」を押したとき、プロンプトへ「DELETE」と入力した場合だけアクションが実行され、それ以外ではキャンセルされます。

## リファレンス

```blade
wire:confirm="message"
```

### 修飾子

| 修飾子 | 説明 |
| --- | --- |
| `.prompt` | ユーザーに入力を求める。形式: `message\|expected-input` |

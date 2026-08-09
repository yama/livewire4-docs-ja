従来のHTMLページにフォームがある場合、フォームはユーザーが「送信」ボタンを押したときだけ送信されます。

しかしLivewireは、従来のフォーム送信以上のことができます。フォーム入力をリアルタイムでバリデーションしたり、ユーザーの入力中にフォームを保存したりできます。

このような「リアルタイム」更新では、フォームまたはフォームの一部が変更されたものの、データベースへ保存されていないことをユーザーに知らせると便利です。

保存されていない入力を含むフォームは「dirty（変更あり）」とみなされます。サーバーの状態とクライアント側の状態を同期するネットワークリクエストがトリガーされると、初めて「clean（変更なし）」になります。

## 基本的な使い方

Livewireの`wire:dirty`ディレクティブを使うと、ページ上の視覚要素を簡単に切り替えられます。

要素に`wire:dirty`を追加すると、クライアント側の状態がサーバー側の状態と異なる場合だけ要素を表示するようLivewireに指示します。

「保存されていない変更...」という表示で、保存されていない入力がフォームにあることを知らせる`UpdatePost`フォームの例です。

```blade
<form wire:submit="update">
    <input type="text" wire:model="title">

    <!-- ... -->

    <button type="submit">更新</button>

    <div wire:dirty>保存されていない変更...</div> <!-- [tl! highlight] -->
</form>
```

「保存されていない変更...」メッセージに`wire:dirty`が追加されているため、メッセージはデフォルトで非表示になります。ユーザーがフォーム入力の変更を始めると、Livewireが自動的にメッセージを表示します。

フォームを送信すると、サーバーとクライアントのデータが再び同期されるため、メッセージは消えます。

### 要素を非表示にする

`wire:dirty`に`.remove`モディファイアを追加すると、デフォルトで要素を表示し、コンポーネントがdirty状態のときだけ非表示にできます。

```blade
<div wire:dirty.remove>データは同期済みです...</div>
```

## プロパティ更新を対象にする

ユーザーが入力欄から離れた直後にサーバー上のプロパティを更新するため、`wire:model.live.blur`を使っているとします。この場合、`wire:dirty`ディレクティブを含む要素に`wire:target`を追加すると、そのプロパティだけを対象にdirty表示できます。

```blade
<form wire:submit="update">
    <input wire:model.live.blur="title">

    <div wire:dirty wire:target="title">保存されていないタイトル...</div> <!-- [tl! highlight] -->

    <button type="submit">更新</button>
</form>
```

## クラスを切り替える

要素全体を切り替える代わりに、状態がdirtyのとき入力欄のCSSクラスだけを切り替えたいこともあります。

以下は、ユーザーが入力すると枠線を黄色にして「保存されていない」状態を示し、入力欄からタブ移動するとサーバーに保存されたことを示すため枠線を外す例です。

```blade
<input wire:model.live.blur="title" wire:dirty.class="border-yellow-500">
```

## `$dirty`式を使う

`wire:dirty`ディレクティブに加え、Livewireディレクティブ内の`$dirty`式や、Alpineの`$wire.$dirty()`を使ってプログラムからdirty状態を確認できます。

### コンポーネント全体がdirtyか確認する

コンポーネントのいずれかのプロパティに保存されていない変更があるか確認します。

```blade
<div wire:show="$dirty">保存されていない変更があります</div>
```

### 特定のプロパティがdirtyか確認する

特定のプロパティが変更されたか確認します。

```blade
<div wire:show="$dirty('title')">タイトルが変更されました</div>
```

ネストしたプロパティも確認できます。

```blade
<div wire:show="$dirty('user.name')">名前が変更されました</div>
```

### dirty状態に基づく条件分岐

Alpineの`$wire.$dirty()`を使って条件付きでロジックを実行できます。

```blade
<button x-on:click="$wire.$dirty('title') && $wire.save()">
    タイトルを保存
</button>
```

Alpineで条件付きクラスを適用することもできます。

```blade
<input
    wire:model="email"
    :class="$wire.$dirty('email') && 'border-yellow-500'"
>
```

## リファレンス

```blade
wire:dirty
wire:target="property"
```

### モディファイア

| モディファイア | 説明 |
|----------|-------------|
| `.remove` | デフォルトで要素を表示し、dirty時に非表示にする |
| `.class="class-name"` | dirty時にCSSクラスを追加する |

### `$dirty`式

| 式 | 説明 |
|------------|-------------|
| `$dirty` | いずれかのプロパティに保存されていない変更があれば`true`を返す |
| `$dirty('property')` | 指定したプロパティに保存されていない変更があれば`true`を返す |
| `$dirty(['title', 'description'])` | 指定したプロパティのいずれかに保存されていない変更があれば`true`を返す |

`wire:show="$dirty"`のようなLivewireディレクティブ、またはAlpineの`$wire.$dirty()`で使用できます。

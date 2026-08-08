# アクション

Livewireアクションは、ユーザー操作に応じてコンポーネントのPHPメソッドを呼び出します。

```php
public function save()
{
    $this->validate();
}
```

```blade
<button wire:click="save">保存</button>
<form wire:submit="save">...</form>
```

## パラメータを渡す

```blade
<button wire:click="deletePost({{ $post->id }})">削除</button>
```

```php
public function deletePost(Post $post) {}
```

アクションの引数はユーザー入力として扱い、認可・バリデーションを行ってください。

## 依存性注入

アクションの型付き引数はLaravelのサービスコンテナから解決できます。

```php
public function save(PostRepository $posts)
{
    $posts->create(...);
}
```

## イベントリスナー

`#[On]`でイベントをアクションへ結び付けます。特定のキーや修飾子を使ったイベント処理については[イベント](/events)を参照してください。

## フォーム送信中の入力を無効にする

`wire:loading`や`wire:loading.attr="disabled"`で送信中の表示と入力状態を制御します。

```blade
<button wire:submit="save" wire:loading.attr="disabled">保存</button>
```

## コンポーネントを更新する

`$refresh`アクションでコンポーネントを再描画できます。

```blade
<button wire:click="$refresh">更新</button>
```

## アクションを確認する

ブラウザーの確認ダイアログには`wire:confirm`を使います。

```blade
<button wire:click="delete" wire:confirm="本当に削除しますか？">削除</button>
```

## Alpineから呼び出す

```blade
<div x-data>
    <button x-on:click="$wire.save()">保存</button>
</div>
```

戻り値はPromiseとして受け取れます。

```js
let result = await $wire.save()
```

## JavaScriptアクション

`$js`でビュー内にJavaScriptアクションを定義できます。

```blade
<button wire:click="$js.increment">増やす</button>

<script>
    this.$js.increment = () => {
        this.count++
    }
</script>
```

## マジックアクション

`$parent`で親のメソッド、`$set`でプロパティ設定、`$refresh`で再描画、`$toggle`で真偽値反転、`$dispatch`でイベント送信ができます。`$event`はブラウザーイベントを参照します。

## 再描画をスキップする

UI変更が不要な処理には`wire:click.renderless`または`#[Renderless]`を使います。

## 非同期実行

独立したアクションは`.async`または`#[Async]`で並列実行できます。

```blade
<button wire:click.async="logActivity">記録</button>
```

```php
#[Async]
public function logActivity() {}
```

副作用や順序依存がある処理には非同期実行を使わないでください。

## 関連項目

- **[フォーム](/forms)** — 入力とバリデーション
- **[イベント](/events)** — コンポーネント間通信
- **[ローディング状態](https://livewire.laravel.com/docs/4.x/loading-states)** — 実行中の表示

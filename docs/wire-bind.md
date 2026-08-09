`wire:bind` は、HTML属性をコンポーネントのプロパティや式へ動的にバインドするディレクティブです。Bladeの属性構文とは異なり、完全な再レンダリングを必要とせず、クライアント上で属性をリアクティブに更新します。

Alpineの `x-bind` ディレクティブに慣れていれば、この2つは基本的に同じものです。

## 基本的な使い方

```blade
<input wire:model="message" wire:bind:class="message.length > 240 && 'text-red-500'">
```

ユーザーが入力すると、`wire:bind:class` はメッセージの長さに反応し、クライアント上ですぐにクラスを適用します。

## よくある使い方

### スタイルをバインドする

```blade
<div wire:bind:style="{ 'color': textColor, 'font-size': fontSize + 'px' }">
    スタイル付きテキスト
</div>
```

### hrefをバインドする

```blade
<a wire:bind:href="url">動的なリンク</a>
```

### disabled状態をバインドする

```blade
<button wire:bind:disabled="isArchived">削除</button>
```

### data属性をバインドする

```blade
<div wire:bind:data-count="count">...</div>
```

## リファレンス

```blade
wire:bind:{attribute}="expression"
```

`{attribute}` を `class`、`style`、`href`、`disabled`、`data-*` など、有効なHTML属性名に置き換えます。

このディレクティブに修飾子はありません。

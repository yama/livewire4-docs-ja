# プロパティ

Livewireコンポーネントのpublicプロパティは、サーバーとブラウザー間で状態を保持し、Bladeや`wire:model`から利用できます。

## プロパティを初期化する

初期値は宣言時に設定するか、`mount()`で設定します。

```php
public $title = '';

public function mount(Post $post)
{
    $this->title = $post->title;
}
```

## 一括代入

`fill()`で複数のプロパティをまとめて設定できます。ユーザー入力を代入する場合は、許可するプロパティだけを対象にし、バリデーションと認可を行ってください。

## データバインディング

Bladeの`wire:model`は入力値をプロパティへ結び付けます。

```blade
<input wire:model="title" type="text">
```

## プロパティをリセットする

`reset()`で初期値へ戻します。特定のプロパティだけを戻す場合は名前を渡します。

```php
$this->reset();
$this->reset('title', 'content');
```

## プロパティを取り出す

`pull()`は値を返してからプロパティをリセットします。

```php
$data = $this->pull();
$title = $this->pull('title');
```

## サポートされる型

文字列、整数、浮動小数点数、真偽値、配列、nullなどのプリミティブ型に加え、DateTime、Model、Collection、Enumなどの一般的なPHP/Laravel型を利用できます。独自型はWireableまたはSynthesizerを実装します。

## JavaScriptからアクセスする

`$wire`からプロパティを読み書きできます。

```blade
<button x-on:click="$wire.title = '新しいタイトル'">変更</button>
<span x-text="$wire.title"></span>
```

## セキュリティ

publicプロパティはブラウザーへ送信され、ユーザーが変更できます。信頼できない値を認可なしに利用しないでください。機密情報にはprotectedプロパティを使い、改ざんを防ぐIDなどには`#[Locked]`を使います。

Eloquentモデルの制約やクエリビルダーの状態はリクエスト間で保持されないため、必要な制約は各リクエストで再適用してください。

## 関連項目

- **[コンポーネント](/components)** — プロパティを持つコンポーネントを作成する
- **[算出プロパティ](https://livewire.laravel.com/docs/4.x/computed-properties)** — 高価な値を算出する
- **[Locked Attribute](https://livewire.laravel.com/docs/4.x/attribute-locked)** — publicプロパティをロックする

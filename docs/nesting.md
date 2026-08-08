# コンポーネントのネスト

Livewireコンポーネントは、他のコンポーネントの中で組み合わせられます。親から子へPropsを渡し、必要に応じてイベントやリアクティブPropsで通信します。

## コンポーネントをネストする

```blade
<livewire:child />
<livewire:post-card :post="$post" />
```

## 子へPropsを渡す

```blade
<livewire:post-card :post="$post" title="投稿" />
```

子は`mount()`で受け取るか、同名のpublicプロパティへ自動バインドできます。静的Propsや短縮属性構文も利用できます。

## ループ内で子を描画する

ループ内では、子コンポーネントを識別するため`wire:key`を指定します。

```blade
@foreach ($posts as $post)
    <livewire:post-card :post="$post" :key="$post->id" />
@endforeach
```

## リアクティブProps

Propsはデフォルトでは初回表示後に親から更新されません。子のPropをリアクティブにするには`#[Reactive]` Attributeを使います。

```php
use Livewire\Attributes\Reactive;

#[Reactive]
public $post;
```

## `wire:model`で子のデータへバインドする

子コンポーネントは`#[Modelable]` Attributeを付けたプロパティを公開できます。

```php
use Livewire\Attributes\Modelable;

#[Modelable]
public $value = '';
```

```blade
<livewire:input wire:model="search" />
```

## スロット

子コンポーネントへBladeの内容を渡せます。名前付きスロットは`<x-slot:name>`で指定します。

```blade
<livewire:panel>
    <x-slot:header>タイトル</x-slot:header>
    本文
</livewire:panel>
```

スロットが渡されたかは`$slot->isEmpty()`などで確認できます。

## HTML属性を転送する

`$attributes`を使って、コンポーネントタグに渡された属性をHTML要素へ転送します。

## Islandsとネストしたコンポーネント

Islandsはコンポーネント内の領域だけを独立更新し、ネストしたコンポーネントは独自のライフサイクルを持つ子として再利用します。独立した更新が必要ならIslands、再利用可能なUI単位ならネストしたコンポーネントを選びます。

## 子から親へ通信する

子は`$dispatch()`でイベントを発生させ、親は`#[On]`で受け取れます。単純に親のアクションを呼ぶ場合は`$parent`を使えます。

```blade
<button wire:click="$parent.showCreatePostForm()">作成</button>
```

大量の更新を行う場合は、クライアント側で処理して不要なリクエストを減らせます。

## 親へ直接アクセスする

`$parent`は親コンポーネントのプロパティやアクションへアクセスします。外部から渡された値は常に認可し、複雑な通信にはイベントを使ってください。

## 動的な子コンポーネント

`<livewire:dynamic-component :is="$component" />`で実行時に子コンポーネントを選択できます。

## 再帰的なコンポーネント

ツリー構造などでは、コンポーネントから自分自身を描画できます。各要素に一意な`wire:key`を付けてください。

## 子を再描画する

`$refresh`、イベント、または必要なPropsの変更で子を更新できます。不要な更新を避けることがパフォーマンス維持につながります。

## 関連項目

- **[コンポーネント](/components)** — コンポーネントを作成する
- **[イベント](/events)** — 親子間で通信する
- **[プロパティ](/properties)** — Propsと状態を管理する

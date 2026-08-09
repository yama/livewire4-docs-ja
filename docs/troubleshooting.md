Livewire本部では問題に遭遇する前に解決しようとしています。しかし、新たな問題を生むため解決できない問題や、予測できない問題もあります。

Livewireアプリケーションで遭遇する可能性がある一般的なエラーと状況を紹介します。

## コンポーネントの不一致

ページ上のLivewireコンポーネントを操作すると、次のような挙動やエラーが発生することがあります。

```
Error: Component already initialized
```

```
Error: Snapshot missing on Livewire component with id: ...
```

原因は多くありますが、最も一般的なのは`@foreach`ループ内の要素やコンポーネントに`wire:key`を追加し忘れることです。

### `wire:key`を追加する

`@foreach`や`@switch`/`@case`のようなループ・条件分岐をBladeテンプレートで使うときは、最初の要素の開始タグに`wire:key`を追加します。

```blade
@foreach($posts as $post)
    <div wire:key="{{ $post->id }}"> <!-- [tl! highlight] -->
        ...
    </div>
@endforeach
```

これにより、変更時にループや条件分岐内の要素を追跡できます。

ループ内のLivewireコンポーネントも同様です。

```blade
@foreach($posts as $post)
    <livewire:show-post :$post :wire:key="$post->id" /> <!-- [tl! highlight] -->
@endforeach
```

`@foreach`内のさらに深くネストされたLivewireコンポーネントにもキーが必要です。

```blade
@foreach($posts as $post)
    <div wire:key="{{ $post->id }}">
        ...
        <livewire:show-post :$post :wire:key="$post->id" /> <!-- [tl! highlight] -->
        ...
    </div>
@endforeach
```

ネストされたコンポーネントにキーがないと、ネットワークリクエスト間でループしたコンポーネントを対応付けられません。

#### キーにプレフィックスを付ける

同じコンポーネント内で重複キーが発生することもあります。モデルIDをキーにすると衝突する場合があります。

```blade
<div>
    @foreach($posts as $post)
        <div wire:key="post-{{ $post->id }}">...</div> <!-- [tl! highlight] -->
    @endforeach
    @foreach($authors as $author)
        <div wire:key="author-{{ $author->id }}">...</div> <!-- [tl! highlight] -->
    @endforeach
</div>
```

## Alpineの複数インスタンス

次のエラーが出る場合、同じページでAlpineが2つ動作している可能性があります。

```
Error: Detected multiple instances of Alpine running
```

```
Alpine Expression Error: $wire is not defined
```

Livewireは内部にAlpineのバンドルを含むため、アプリケーションのLivewireページから他のAlpineを削除してください。既存のLaravel Breezeへ後からLivewireを追加する場合などに起きます。

### Laravel BreezeのAlpineを削除する

既存のLaravel Breeze（Blade + Alpine版）へLivewireを入れる場合、`resources/js/app.js`から次を削除します。

```js
import './bootstrap';

import Alpine from 'alpinejs'; // [tl! remove:4]

window.Alpine = Alpine;

Alpine.start();
```

### CDN版Alpineを削除する

Livewire v3ではAlpineが自動提供されるため、レイアウトのheadに追加したCDNを削除できます。

```html
    ...
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script> <!-- [tl! remove] -->
</head>
```

Livewireには`@alpinejs/ui`以外のAlpineプラグインも含まれるため、追加プラグインも削除できます。

## `@alpinejs/ui`がない

LivewireにバンドルされたAlpineには`@alpinejs/ui`を除くすべてのプラグインが含まれます。これに依存する[Alpine Components](https://alpinejs.dev/components)のヘッドレスコンポーネントを使うと、次のエラーが出る場合があります。

```
Uncaught Alpine: no element provided to x-anchor
```

レイアウトに`@alpinejs/ui`をCDNで追加します。

```html
    ...
    <script defer src="https://unpkg.com/@alpinejs/ui@3.13.7-beta.0/dist/cdn.min.js"></script> <!-- [tl! add] -->
</head>
```

最新バージョンは[各コンポーネントのドキュメントページ](https://alpinejs.dev/component/headless-dialog/docs)で確認してください。

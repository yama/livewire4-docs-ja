Livewireはサーバー側のPHPクラスをブラウザへ直接接続しているように感じられますが、実際には標準的なWebアプリケーションに近い動作をします。静的HTMLをブラウザへ描画し、ブラウザイベントを受け取り、AJAXリクエストでサーバーコードを呼び出します。

AJAXリクエストはステートレスで、コンポーネントの状態を保持する長時間実行プロセスがありません。そのためLivewireは更新前にコンポーネントの既知の状態を再作成する必要があります。

各サーバー更新後にPHPコンポーネントの「スナップショット」を取り、次のリクエストでコンポーネントを再作成・再開します。このスナップショット作成を「dehydration」、スナップショットからの再作成を「hydration」と呼びます。

## Dehydrating

Livewireがサーバー側コンポーネントをdehydrateすると、次の2つを行います。
* コンポーネントのテンプレートをHTMLへレンダリングする
* コンポーネントのJSONスナップショットを作成する

### HTMLをレンダリングする

マウント後または更新後、Livewireは`render()`を呼び出してBladeテンプレートをHTMLへ変換します。

```php
<?php
use Livewire\Component;
new class extends Component {
    public $count = 1;
    public function increment() { $this->count++; }
    public function render()
    {
        return <<<'HTML'
        <div>
            Count: {{ $count }}
            <button wire:click="increment">+</button>
        </div>
        HTML;
    }
};
```

```html
<div>
    Count: 1
    <button wire:click="increment">+</button>
</div>
```

### スナップショット

次のリクエストで`counter`を再作成するため、状態をできるだけ記録したJSONスナップショットを作ります。

```js
{
    state: { count: 1 },
    memo: { name: 'counter', id: '1526456' },
}
```

`memo`はコンポーネントの識別・再作成に必要な情報、`state`はpublicプロパティの値を保持します。

> [!info]
> 上は実際のスナップショットを簡略化したものです。実際にはバリデーションエラー、子コンポーネント、ロケールなどさらに多くの情報が含まれます。詳細は[スナップショットスキーマ](/javascript#snapshotオブジェクト)を参照してください。

### HTMLにスナップショットを埋め込む

初回レンダリング時、Livewireは`wire:snapshot`というHTML属性にJSONを保存します。

```html
<div wire:id="..." wire:snapshot="{ state: {...}, memo: {...} }">
    Count: 1
    <button wire:click="increment">+</button>
</div>
```

## Hydrating

更新がトリガーされると、次のようなペイロードをサーバーへ送ります。

```js
{
    calls: [{ method: 'increment', params: [] }],
    snapshot: {
        state: { count: 1 },
        memo: { name: 'counter', id: '1526456' },
    },
}
```

`increment`を呼ぶ前に新しい`counter`インスタンスを作り、スナップショットの状態を設定します。

```php
$state = request('snapshot.state');
$memo = request('snapshot.memo');
$instance = Livewire::new($memo['name'], $memo['id']);
foreach ($state as $property => $value) {
    $instance[$property] = $value;
}
```

## 高度なhydration

単純な整数だけでなく、Livewireはモデル、コレクション、Carbon、[Laravel Stringable](https://laravel.com/docs/helpers#method-str)など多くの型をサポートします。

```php
new class extends Component {
    public $todos;
    public function mount() {
        $this->todos = collect(['first', 'second', 'third']);
    }
};
```

この`$todos`プロパティには、3つの文字列を含む[Laravelコレクション](https://laravel.com/docs/collections#main-content)を設定しています。

JSONだけではLaravelコレクションを表現できないため、Livewireはスナップショット内の純粋なデータにメタデータを関連付ける独自のパターンを用意しています。`todos`コンポーネントのスナップショットにあるstateオブジェクトは、次のようになります。

```js
state: {
    todos: [
        [ 'first', 'second', 'third' ],
        { s: 'clctn', class: 'Illuminate\\Support\\Collection' },
    ],
},
```

これは、次のような単純な形式を想定していた場合には分かりにくいかもしれません。

```js
state: {
    todos: [ 'first', 'second', 'third' ],
},
```

しかし、このデータからコンポーネントをhydrateする場合、Livewireはそれが通常の配列ではなくコレクションであることを知る方法がありません。

JSONだけではLaravelコレクションを表せないため、Livewireはデータにメタデータを関連付けるタプル（2要素の配列）を使います。

```js
todos: [
    [ 'first', 'second', 'third' ],
    { s: 'clctn', class: 'Illuminate\\Support\\Collection' },
],
```

hydration時にタプルを見つけると、2番目の要素の情報を使って1番目の状態を適切に復元します。

```php
[ $state, $metadata ] = request('snapshot.state.todos');
$collection = new $metadata['class']($state);
```

### 深くネストしたタプル

この方式では深くネストしたプロパティもdehydrate・hydrateできます。コレクションの3番目をLaravel Stringableにすると、次のようになります。

```php
<?php

use Livewire\\Component;

new class extends Component {
    public $todos;

    public function mount() {
        $this->todos = collect([
            'first',
            'second',
            str('third'),
        ]);
    }
};
```

```js
todos: [
    [
        'first',
        'second',
        [ 'third', { s: 'str' } ],
    ],
    { s: 'clctn', class: 'Illuminate\\Support\\Collection' },
],
```

3番目の値がメタデータタプルになり、Stringableであることを示します。

### カスタムプロパティ型をサポートする

対応していない型をサポートするには、非プリミティブ型をhydrate・dehydrateする内部機構である[Synthesizers](/synthesizers)を使います。

## 関連項目

- **[ライフサイクルフック](/lifecycle-hooks)** — `hydrate()`と`dehydrate()`フックを使う
- **[プロパティ](/properties)** — リクエスト間でプロパティを保持する方法
- **[Morphing](/morph)** — LivewireがDOMを更新する方法
- **[Synthesizers](/synthesizers)** — プロパティのシリアライズをカスタマイズする

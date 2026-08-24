## LivewireコンポーネントでJavaScriptを使う

LivewireとAlpineにはHTML内で動的コンポーネントを作る便利な機能がありますが、HTMLを離れて通常のJavaScriptを実行したい場合もあります。

> [!warning] クラスベースコンポーネントでは`@@script`が必要
> このページの裸の`<script>`タグはシングルファイル・マルチファイルコンポーネントで動作します。BladeビューがPHPクラスと別ファイルのクラスベースコンポーネントでは、`@@script`ディレクティブで囲んでください。
>
> ```blade
> @@script
> <script>
>     // JavaScript
> </script>
> @@endscript
> ```
>
> これによりクラスベースコンポーネントの実行タイミングが正しく処理されます。

### スクリプトを実行する

コンポーネントの読み込み時にJavaScriptを実行するには、テンプレート内へ`<script>`タグを直接追加します。Livewireが処理するため、ページ読み込み後かつコンポーネントのレンダリング前という適切なタイミングで実行され、`document.addEventListener()`で囲む必要はありません。遅延・条件付きで読み込むコンポーネントでも初期化後に実行されます。

```blade
<div>
    ...
</div>

<script>
    // コンポーネントがページへ読み込まれるたび実行
</script>
```

## グローバルなLivewireイベント

Livewireは、外部スクリプトからカスタム拡張ポイントを登録できる、便利な2つのブラウザーイベントをディスパッチします。

```html
<script>
    document.addEventListener('livewire:init', () => {
        // Livewireが読み込まれた後、ページ上で初期化される前に実行されます...
    })

    document.addEventListener('livewire:initialized', () => {
        // Livewireのページ上での初期化が完了した直後に実行されます...
    })
</script>
```

> [!info]
> [カスタムディレクティブ](#カスタムディレクティブの登録)や[ライフサイクルフック](#javascriptフック)は、ページ上でLivewireの初期化が始まる前に利用できるよう、`livewire:init`の中で登録すると便利なことがあります。

## `Livewire`グローバルオブジェクト

Livewireのグローバルオブジェクトは、外部スクリプトからLivewireを操作する際の最適な出発点です。

クライアント側コードのどこからでも、`window`上のグローバルなLivewire JavaScriptオブジェクトにアクセスできます。

多くの場合、`livewire:init`イベントリスナーの中で`window.Livewire`を使うと便利です。

### コンポーネントへのアクセス

現在のページに読み込まれている特定のLivewireコンポーネントには、次のメソッドでアクセスできます。

```js
// ページ上の最初のコンポーネントの$wireオブジェクトを取得...
let component = Livewire.first()

// IDを指定してコンポーネントの$wireオブジェクトを取得...
let component = Livewire.find(id)

// 名前を指定してコンポーネントの$wireオブジェクトの配列を取得...
let components = Livewire.getByName(name)

// ページ上のすべてのコンポーネントの$wireオブジェクトを取得...
let components = Livewire.all()
```

> [!info]
> これらのメソッドはそれぞれ、Livewireにおけるコンポーネントの状態を表す`$wire`オブジェクトを返します。
> <br><br>
> これらのオブジェクトについては、[`$wire`のドキュメント](#wireオブジェクト)で詳しく説明しています。

### イベントの操作

個々のコンポーネントでPHPからイベントをディスパッチしたりリッスンしたりできるだけでなく、グローバルな`Livewire`オブジェクトを使えば、アプリケーションのどこからでも[Livewireのイベントシステム](/events)を操作できます。

```js
// リッスンしている任意のLivewireコンポーネントへイベントをディスパッチ...
Livewire.dispatch('post-created', { postId: 2 })

// 名前を指定したLivewireコンポーネントへイベントをディスパッチ...
Livewire.dispatchTo('dashboard', 'post-created', { postId: 2 })

// Livewireコンポーネントからディスパッチされたイベントをリッスン...
Livewire.on('post-created', ({ postId }) => {
    // ...
})
```

特定の状況では、グローバルなLivewireイベントの登録を解除する必要があります。たとえばAlpineコンポーネントと`wire:navigate`を組み合わせると、ページ間の移動で`init`が呼び出されるたびに複数のリスナーが登録されることがあります。これを解決するには、Alpineによって自動的に呼び出される`destroy`関数を利用します。この関数内で全リスナーをループし、登録を解除して不要な蓄積を防ぎます。

```js
Alpine.data('MyComponent', () => ({
    listeners: [],
    init() {
        this.listeners.push(
            Livewire.on('post-created', (options) => {
                // 何らかの処理...
            })
        );
    },
    destroy() {
        this.listeners.forEach((listener) => {
            listener();
        });
    }
}));
```

### ライフサイクルフックの利用

`Livewire.hook()`を使うと、Livewireのグローバルなライフサイクルのさまざまな部分にフックできます。

```js
// 指定した内部Livewireフックで実行するコールバックを登録...
Livewire.hook('component.init', ({ component, cleanup }) => {
    // ...
})
```

Livewire JavaScriptフックについて詳しくは、[下記のドキュメント](#javascriptフック)を参照してください。

### カスタムディレクティブの登録

`Livewire.directive()`を使うと、カスタムディレクティブを登録できます。

以下は、JavaScriptの`confirm()`ダイアログを使って、サーバーへ送信する前にアクションを確認またはキャンセルするカスタム`wire:confirm`ディレクティブの例です。

```html
<button wire:confirm="Are you sure?" wire:click="delete">Delete post</button>
```

`Livewire.directive()`を使った`wire:confirm`の実装は次のとおりです。

```js
Livewire.directive('confirm', ({ el, directive, component, cleanup }) => {
    let content =  directive.expression

    // "directive"オブジェクトから、解析済みディレクティブにアクセスできます。
    // たとえば wire:click.prevent="deletePost(1)" の値は次のとおりです。
    //
    // directive.raw = wire:click.prevent
    // directive.value = "click"
    // directive.modifiers = ['prevent']
    // directive.expression = "deletePost(1)"

    let onClick = e => {
        if (! confirm(content)) {
            e.preventDefault()
            e.stopImmediatePropagation()
        }
    }

    el.addEventListener('click', onClick, { capture: true })

    // ページがアクティブなままLivewireコンポーネントがDOMから削除された場合に備え、
    // cleanup()の中にクリーンアップコードを登録します。
    cleanup(() => {
        el.removeEventListener('click', onClick)
    })
})
```

## JavaScriptフック

上級ユーザー向けに、Livewireは内部のクライアント側「フック」システムを公開しています。これらのフックを使うと、Livewireの機能を拡張したり、Livewireアプリケーションについてより多くの情報を取得したりできます。

### コンポーネントの初期化

初期ページの読み込み時でも後からでも、Livewireが新しいコンポーネントを検出するたびに`component.init`イベントが発生します。`component.init`にフックして、新しいコンポーネントに関する処理を割り込ませたり、初期化したりできます。

```js
Livewire.hook('component.init', ({ component, cleanup }) => {
    //
})
```

イベントリスナー、スクリプト、サーバーからディスパッチされたJavaScriptなど、Livewireの初期エフェクトに依存する高度な連携には`component.initialized`を使います。これはそれらのエフェクトが処理された後、Livewireがコンポーネントの子孫要素の初期化を続行する前に実行されます。

```js
Livewire.hook('component.initialized', ({ component }) => {
    //
})
```

詳しくは、[componentオブジェクトのドキュメント](#componentオブジェクト)を参照してください。

### DOM要素の初期化

新しいコンポーネントの初期化時にイベントを発生させるだけでなく、Livewireは対象のLivewireコンポーネント内にある各DOM要素についてもイベントを発生させます。

これは、アプリケーションでカスタムLivewire HTML属性を提供するために利用できます。

```js
Livewire.hook('element.init', ({ component, el }) => {
    //
})
```

### DOM Morphフック

Livewireがネットワークの往復処理を完了した後に発生するDOM morph処理の間、変更されるすべての要素について一連のイベントが発生します。

```js
Livewire.hook('morph.updating',  ({ el, component, toEl, skip, childrenOnly }) => {
    //
})

Livewire.hook('morph.updated', ({ el, component }) => {
    //
})

Livewire.hook('morph.removing', ({ el, component, skip }) => {
    //
})

Livewire.hook('morph.removed', ({ el, component }) => {
    //
})

Livewire.hook('morph.adding',  ({ el, component }) => {
    //
})

Livewire.hook('morph.added',  ({ el }) => {
    //
})
```

要素ごとに発生するイベントに加えて、Livewireコンポーネントごとに`morph`イベントと`morphed`イベントも発生します。

```js
Livewire.hook('morph',  ({ el, component }) => {
    // componentの子要素がmorphされる直前に実行されます（部分的なmorphを除く）
})

Livewire.hook('morphed',  ({ el, component }) => {
    // componentのすべての子要素がmorphされた後に実行されます（部分的なmorphを除く）
})
```

## サーバー側でのJavaScript評価

コンポーネント内でJavaScriptを直接実行するだけでなく、サーバー側のPHPコードから`js()`メソッドを使ってJavaScript式を評価できます。

これは通常、サーバー側のアクション実行後にクライアント側で何らかの処理を行う場合に便利です。

たとえば、次の`post.create`コンポーネントは、投稿をデータベースへ保存した後にクライアント側のアラートダイアログを表示します。

```php
<?php // resources/views/components/post/⚡create.blade.php

use Livewire\Component;

new class extends Component {
    public $title = '';

    public function save()
    {
        // 投稿をデータベースへ保存...

        $this->js("alert('Post saved!')");
    }
};
```

JavaScript式`alert('Post saved!')`は、サーバー上で投稿がデータベースへ保存され、レスポンスのDOM morphが完了した後、クライアント上で実行されます。

式の中では、現在のコンポーネントの`$wire`オブジェクトにアクセスできます。

```php
$this->js('$wire.$refresh()');
$this->js('$wire.$dispatch("post-created", { id: ' . $post->id . ' })');
```

## よくあるパターン

ここでは、実際のアプリケーションでLivewireとJavaScriptを使う場合によくあるパターンを紹介します。

### サードパーティライブラリの統合

多くのJavaScriptライブラリは、要素がページに追加されたときに初期化する必要があります。コンポーネントスクリプトを使い、コンポーネントの読み込み時にライブラリを初期化します。

```blade
<div>
    <div id="map" style="height: 400px;"></div>
</div>

@assets
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY"></script>
@endassets

<script>
    new google.maps.Map($wire.$el.querySelector('#map'), {
        center: { lat: {{ $latitude }}, lng: {{ $longitude }} },
        zoom: 12
    });
</script>
```

### localStorageとの同期

`$watch`を使うと、コンポーネントの状態をlocalStorageと同期できます。

```blade
<script>
    // 初期化時にlocalStorageから読み込む
    if (localStorage.getItem('draft')) {
        $wire.content = localStorage.getItem('draft');
    }

    // 変更時にlocalStorageへ保存する
    $wire.$watch('content', (value) => {
        localStorage.setItem('draft', value);
    });
</script>
```

### `@js`ディレクティブの利用

JavaScriptで直接利用するためにPHPのデータを出力する必要がある場合は、`@js`ディレクティブを利用できます。

```blade
<script>
    let posts = @js($posts)

    // "posts"はPHPの投稿データからなるJavaScript配列になります。
</script>
```

## ベストプラクティス

### コンポーネントスクリプトとグローバルスクリプト

**コンポーネントスクリプトを使う場合:**

- JavaScriptがそのコンポーネントの機能に固有である
- `$wire`またはコンポーネント固有のデータへアクセスする必要がある
- コンポーネントが読み込まれるたびにコードを実行する必要がある

**グローバルスクリプトを使う場合:**

- カスタムディレクティブやフックを登録する
- グローバルイベントリスナーを設定する
- アプリケーション全体のJavaScriptを初期化する

### メモリリークを避ける

コンポーネントスクリプトでイベントリスナーを追加した場合、コンポーネントが削除されるとLivewireが自動的にクリーンアップします。ただし、グローバルなインターセプターやフックを使う場合は、適切なタイミングでクリーンアップするようにしてください。

```js
// コンポーネントレベル - 自動的にクリーンアップされる ✓
$wire.intercept(({ onSend }) => {
    onSend(() => console.log('Sending...'));
});

// グローバルレベル - ページのライフサイクル全体で存続する
Livewire.interceptMessage(({ onSend }) => {
    onSend(() => console.log('Sending...'));
});
```

### デバッグのヒント

**ブラウザーのコンソールからコンポーネントにアクセスする:**

```js
// ページ上の最初のコンポーネントを取得
let $wire = Livewire.first()

// コンポーネントの状態を確認
console.log($wire.count)

// メソッドを呼び出す
$wire.increment()
```

**すべてのリクエストを監視する:**

```js
Livewire.interceptRequest(({ onSend }) => {
    onSend(() => {
        console.log('Request sent:', Date.now());
    });
});
```

**コンポーネントのスナップショットを確認する:**

```js
let component = Livewire.first().__instance()
console.log(component.snapshot)
```

### パフォーマンスに関する考慮事項

- LivewireのDOM morphで触れてほしくない要素には`wire:ignore`を使う
- `wire:model.debounce`またはJavaScriptのデバウンスを使って高コストな処理を遅延させる
- すぐには表示されないコンポーネントには遅延読み込み（`lazy`パラメーター）を使う
- 独立して更新される領域にはislandの利用を検討する

## 関連項目

- **[Styles](/styles)** — コンポーネントにスコープ付きCSSを追加する
- **[Alpine](/alpine)** — クライアント側のインタラクティブ性にAlpineを使う
- **[Actions](/actions)** — コンポーネント内でJavaScriptアクションを作成する
- **[Properties](/properties)** — `$wire`でプロパティにアクセスする
- **[Events](/events)** — JavaScriptでイベントをディスパッチしてリッスンする

## リファレンス

LivewireのJavaScriptシステムを拡張する場合、遭遇する可能性があるさまざまなオブジェクトを理解しておくことが重要です。

ここでは、Livewireに関連する内部プロパティをすべて網羅的に説明します。

念のため補足すると、一般的なLivewireユーザーがこれらに触れることはほとんどありません。これらのオブジェクトの多くは、Livewireの内部システムまたは上級ユーザー向けに用意されています。

### `$wire`オブジェクト

次の一般的な`Counter`コンポーネントを考えます。

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class Counter extends Component
{
    public $count = 1;

    public function increment()
    {
        $this->count++;
    }

    public function render()
    {
        return view('livewire.counter');
    }
}
```

Livewireはサーバー側コンポーネントをJavaScriptで表現したオブジェクトを公開します。このオブジェクトは一般に`$wire`と呼ばれます。

```js
let $wire = {
    // コンポーネントのすべてのpublicプロパティに$wireから直接アクセスできます...
    count: 0,

    // すべてのpublicメソッドが$wire上で公開され、呼び出せます...
    increment() { ... },

    // 親コンポーネントが存在する場合、その$wireオブジェクトにアクセス...
    $parent,

    // LivewireコンポーネントのルートDOM要素にアクセス...
    $el,

    // 現在のLivewireコンポーネントのIDにアクセス...
    $id,

    // 名前でプロパティの値を取得...
    // 使用例: $wire.$get('count')
    $get(name) { ... },

    // 名前でコンポーネントのプロパティを設定...
    // 使用例: $wire.$set('count', 5)
    $set(name, value, live = true) { ... },

    // booleanプロパティの値を切り替え...
    $toggle(name, live = true) { ... },

    // メソッドを呼び出し...
    // 使用例: $wire.$call('increment')
    $call(method, ...params) { ... },

    // JavaScriptアクションを定義...
    // 使用例: $wire.$js('increment', () => { ... })
    // 使用例: $wire.$js.increment = () => { ... }
    $js(name, callback) { ... },

    // [非推奨] entangle - おそらく必要ありません。
    // 代わりに$wireを直接使ってプロパティへアクセスしてください。
    // 使用例: <div x-data="{ count: $wire.$entangle('count') }">
    $entangle(name, live = false) { ... },

    // プロパティの値の変更を監視...
    // 使用例: Alpine.$watch('count', (value, old) => { ... })
    $watch(name, callback) { ... },

    // 次のアクションを名前付きislandに限定...
    // $wireを返すため、任意のメソッド呼び出しをチェーンできます。
    // チェーンされたアクションは、指定したislandだけを再レンダリングします。
    // 使用例: $wire.$island('revenue').$refresh()
    // 使用例: $wire.$island('feed', { mode: 'append' }).loadMore()
    $island(name, options = {}) { ... },

    // サーバーにメッセージを送信してコンポーネントを更新し、
    // HTMLを再レンダリングしてページに反映...
    $refresh() { ... },

    // 上記の$refreshと同じ。より技術的な名前です...
    $commit() { ... }, // $refreshのエイリアス

    // このコンポーネントまたは子コンポーネントからディスパッチされたイベントをリッスン...
    // 使用例: $wire.$on('post-created', () => { ... })
    $on(event, callback) { ... },

    // このコンポーネントまたはリクエストから発生したライフサイクルフックをリッスン...
    // 使用例: $wire.$hook('message.sent', () => { ... })
    $hook(name, callback) { ... },

    // このコンポーネントからイベントをディスパッチ...
    // 使用例: $wire.$dispatch('post-created', { postId: 2 })
    $dispatch(event, params = {}) { ... },

    // 別のコンポーネントへイベントをディスパッチ...
    // 使用例: $wire.$dispatchTo('dashboard', 'post-created', { postId: 2 })
    $dispatchTo(otherComponentName, event, params = {}) { ... },

    // このコンポーネントだけにイベントをディスパッチし、他には送らない...
    $dispatchSelf(event, params = {}) { ... },

    // wire:modelを経由せず、ファイルをコンポーネントへ直接アップロードするJS API...
    $upload(
        name, // プロパティ名
        file, // JavaScriptのFileオブジェクト
        finish = () => { ... }, // アップロード完了時に実行...
        error = () => { ... }, // アップロード途中でエラーが発生した場合に実行...
        progress = (event) => { // アップロードの進行中に実行...
            event.detail.progress // 1〜100の整数...
        },
    ) { ... },

    // 複数ファイルを同時にアップロードするAPI...
    $uploadMultiple(name, files, finish, error, progress) { },

    // 一時アップロード済みだが保存されていないファイルを削除...
    $removeUpload(name, tmpFilename, finish, error) { ... },

    // このコンポーネントインスタンスにアクションインターセプターを登録
    // 使用例: $wire.intercept(({ action, onSend, onCancel, onSuccess, onError, onFailure, onFinish }) => { ... })
    // 特定のアクションに限定する例: $wire.intercept('save', ({ action, onSuccess }) => { ... })
    intercept(actionOrCallback, callback) { ... },

    // interceptのエイリアス
    interceptAction(actionOrCallback, callback) { ... },

    // このコンポーネントインスタンスにメッセージインターセプターを登録
    // 使用例: $wire.interceptMessage(({ message, cancel, onSend, onCancel, onSuccess, onSkipped, onError, onFailure, onFinish }) => { ... })
    // 特定のアクションに限定する例: $wire.interceptMessage('save', callback)
    interceptMessage(actionOrCallback, callback) { ... },

    // このコンポーネントインスタンスにリクエストインターセプターを登録
    // 使用例: $wire.interceptRequest(({ request, onSend, onCancel, onSuccess, onError, onFailure, onFinish }) => { ... })
    // 特定のアクションに限定する例: $wire.interceptRequest('save', callback)
    interceptRequest(actionOrCallback, callback) { ... },

    // 内部の「component」オブジェクトを取得...
    __instance() { ... },
}
```

`$wire`について詳しくは、[JavaScriptでのプロパティへのアクセスに関するLivewireのドキュメント](/properties#accessing-properties-from-javascript)を参照してください。

### `snapshot`オブジェクト

各ネットワークリクエストの間に、LivewireはPHPコンポーネントをJavaScriptから利用できるオブジェクトへシリアライズします。このスナップショットはコンポーネントをPHPオブジェクトへアンシリアライズするために使われ、改ざんを防止する仕組みも組み込まれています。

```js
let snapshot = {
    // シリアライズされた状態（publicプロパティ）...
    data: { count: 0 },

    // コンポーネントに関する長期間保持される情報...
    memo: {
        // コンポーネント固有のID...
        id: '0qCY3ri9pzSSMIXPGg8F',

        // コンポーネント名。例: <livewire:[name] />
        name: 'counter',

        // コンポーネントが最初に読み込まれたページのURI、メソッド、ロケール。
        // これらは後続のコンポーネント更新リクエスト（メッセージ）に
        // 元のリクエストのミドルウェアを再適用するために使われます...
        path: '/',
        method: 'GET',
        locale: 'en',

        // ネストされた子コンポーネントの一覧。
        // 内部テンプレートIDをキー、コンポーネントIDを値として持ちます...
        children: [],

        // このコンポーネントがlazyロードされたかどうか...
        lazyLoaded: false,

        // 直前のリクエストで発生したバリデーションエラーの一覧...
        errors: [],
    },

    // このスナップショットを安全に暗号化したハッシュ。
    // 悪意のあるユーザーがスナップショットを改ざんして、
    // サーバー上で所有していないリソースにアクセスしようとしても、
    // チェックサムの検証に失敗してエラーが発生します...
    checksum: '1bc274eea17a434e33d26bcaba4a247a4a7768bd286456a83ea6e9be2d18c1e7',
}
```

### `component`オブジェクト

ページ上のすべてのコンポーネントには、裏側で状態を追跡し基盤となる機能を公開する対応するcomponentオブジェクトがあります。これは`$wire`より1層深いオブジェクトで、上級者向けです。

以下は、上記の`Counter`コンポーネントに実際に対応するcomponentオブジェクトです。関連するプロパティをJavaScriptコメントで説明しています。

```js
let component = {
    // コンポーネントのルートHTML要素...
    el: HTMLElement,

    // コンポーネント固有のID...
    id: '0qCY3ri9pzSSMIXPGg8F',

    // コンポーネント名（<livewire:[name] />）...
    name: 'counter',

    // 最新の「effects」オブジェクト。effectsはサーバーとの往復処理による
    // 副作用で、リダイレクトやファイルダウンロードなどが含まれます...
    effects: {},

    // サーバー側で最後に確認されたコンポーネントの状態...
    canonical: { count: 0 },

    // クライアント側で変更可能なライブ状態を表すデータオブジェクト...
    ephemeral: { count: 0 },

    // this.ephemeralのリアクティブ版。ここへの変更は
    // AlpineJSの式によって検出されます...
    reactive: Proxy,

    // Alpine式の中で通常$wireとして使われるProxyオブジェクト。
    // Livewireコンポーネント向けの扱いやすいJSオブジェクトインターフェースを提供します...
    $wire: Proxy,

    // ネストされた子コンポーネントの一覧。
    // 内部テンプレートIDをキー、コンポーネントIDを値として持ちます...
    children: [],

    // このコンポーネントの最後に確認されたsnapshot表現。
    // サーバー側コンポーネントから取得され、バックエンドでPHPオブジェクトを再作成するために使われます...
    snapshot: {...},

    // 上記snapshotの解析前のバージョン。JSで解析するとPHPのエンコーディングが変わり、
    // チェックサムが一致しなくなることが多いため、次の往復処理でサーバーへ送り返す際に使われます。
    snapshotEncoded: '{"data":{"count":0},"memo":{"id":"0qCY3ri9pzSSMIXPGg8F","name":"counter","path":"\\/","method":"GET","children":[],"lazyLoaded":true,"errors":[],"locale":"en"},"checksum":"1bc274eea17a434e33d26bcaba4a247a4a7768bd286456a83ea6e9be2d18c1e7"}',
}
```

### `message`ペイロード

ブラウザー上でLivewireコンポーネントに対してアクションを実行すると、ネットワークリクエストが発生します。このネットワークリクエストには、1つまたは複数のコンポーネントと、サーバー向けのさまざまな命令が含まれます。内部では、これらのコンポーネントのネットワークペイロードを「メッセージ」と呼びます。

「メッセージ」は、コンポーネントを更新する必要があるときにフロントエンドからバックエンドへ送信されるデータを表します。コンポーネントは、バックエンドへ状態と更新内容を含むメッセージを送信する必要のあるアクションが実行されるまで、フロントエンドでレンダリングおよび操作されます。

このスキーマは、ブラウザーのDevToolsのネットワークタブに表示されるペイロードや、[LivewireのJavaScriptフック](#javascriptフック)で見覚えがあるでしょう。

```js
let message = {
    // snapshotオブジェクト...
    snapshot: { ... },

    // サーバー上で更新するプロパティのキーと値の一覧...
    updates: {},

    // サーバー側で呼び出すメソッド（パラメーター付き）の配列...
    calls: [
        { method: 'increment', params: [] },
    ],
}
```

JavaScriptアクションを登録する例です。

```blade
<div>
    <button wire:click="$js.increment">+</button>
</div>

<script>
    this.$js.increment = () => {
        console.log('increment')
    }
</script>
```

詳しくは[アクションのJavaScriptドキュメント](/actions#javascript-actions)を参照してください。

### スクリプトから`$wire`を使う

コンポーネント内の`<script>`ではLivewireコンポーネントの`$wire`へ自動的にアクセスできます。

ここでは、単純な`setInterval`を使って2秒ごとにコンポーネントを更新する例を示します（[`wire:poll`](/wire-poll)でも簡単に実現できますが、ここでは仕組みを説明するために`setInterval`を使います）。

```blade
<script>
    setInterval(() => {
        $wire.$refresh()
    }, 2000)
</script>
```

## `$wire`オブジェクト

`$wire`はJavaScriptからLivewireコンポーネントを操作するインターフェースです。プロパティ、メソッド、サーバー操作用ユーティリティにアクセスできます。

```js
// プロパティの取得・変更
$wire.count
$wire.count = 5
$wire.$set('count', 5)

// メソッド呼び出し
$wire.save()
$wire.delete(postId)

// 更新
$wire.$refresh()

// イベントをディスパッチ
$wire.$dispatch('post-created', { postId: 2 })

// イベントをリッスン
$wire.$on('post-created', (event) => {
    console.log(event.postId)
})

// ルート要素へアクセス
$wire.$el.querySelector('.modal')
```

> [!tip] `$wire`完全リファレンス
> 全メソッド・プロパティはページ末尾の[$wireリファレンス](#wireオブジェクト)を参照してください。

## アセットを読み込む

コンポーネントと一緒にスクリプトやスタイルのアセット全体を読み込むには`@assets`を使います。ここでは、[Pikaday](https://github.com/Pikaday/Pikaday)という日付ピッカーライブラリを読み込み、コンポーネント内で初期化する例を示します。

```blade
<div>
    <input type="text" data-picker>
</div>

@assets
<script src="https://cdn.jsdelivr.net/npm/pikaday/pikaday.js" defer></script>
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/pikaday/css/pikaday.css">
@endassets

<script>
    new Pikaday({ field: $wire.$el.querySelector('[data-picker]') });
</script>
```

Livewireは`@assets`をページで一度だけ読み込み、スクリプトを評価します。コンポーネントインスタンスごとに実行されるコンポーネントスクリプトとは異なります。

## Interceptor

Livewireリクエストは、**action**（最も細かい単位）、**message**（コンポーネント単位）、**request**（HTTP単位）の3レベルでインターセプトできます。

```js
$wire.intercept(callback)
$wire.intercept('save', callback)
Livewire.interceptAction(callback)
$wire.interceptMessage(callback)
$wire.interceptMessage('save', callback)
Livewire.interceptMessage(callback)
$wire.interceptRequest(callback)
$wire.interceptRequest('save', callback)
Livewire.interceptRequest(callback)
```

すべてのInterceptorは解除関数を返します。

```js
let unsubscribe = $wire.intercept(callback)
unsubscribe() // 解除
```

### Action interceptor

コンポーネントの各メソッド呼び出しで実行されます。

```js
$wire.intercept(({ action, onSend, onCancel, onSuccess, onError, onFailure, onFinish }) => {
    // action.name / action.params / action.component
    // action.cancel()でアクションをキャンセル
    onSend(({ call }) => { /* call: { method, params, metadata } */ })
    onCancel(() => {})
    onSuccess((result) => { /* PHPメソッドの戻り値 */ })
    onError(({ response, body, preventDefault }) => { preventDefault() })
    onFailure(({ error }) => { /* ネットワークエラー */ })
    onFinish(() => { /* DOM morph後（エラー・キャンセル時も） */ })
})
```

### Message interceptor

各コンポーネント更新で実行され、1つ以上のアクションを含むmessageを扱います。

```js
$wire.interceptMessage(({ message, cancel, onSend, onCancel, onSuccess, onSkipped, onError, onFailure, onStream, onFinish }) => {
    // message.component / message.actions / message.isSkipped()
    onSend(({ payload }) => { /* payload: { snapshot, updates, calls } */ })
    onCancel(() => {})
    onSuccess(({ payload, onSync, onEffect, onMorph, onMorphed, onRender }) => {
        onSync(() => {})
        onEffect(() => {})
        onMorph(async () => {})   // 高度な用途: DOM morphに待機が必要な処理を追加
        onMorphed(() => {})       // すべてのDOM morph処理の完了後
        onRender(() => {})
    })
    onSkipped(() => { /* サーバーが意図的にスキップ */ })
    onError(({ response, body, preventDefault }) => { preventDefault() })
    onFailure(({ error }) => {})
    onStream(async ({ json }) => { /* 解析済みストリームチャンク */
        // 次のチャンクが処理される前に非同期処理が待機されます
    })
    onFinish(() => {})
})
```

`onMorph`は、Livewireが完了を待機する必要がある非同期のDOM処理を追加するための高度なフックです。更新されたDOMにアクセスする必要がある場合の多くは`onMorphed`を使うべきです。これはレスポンスに含まれるコンポーネント、アイランド、スロットのすべてのmorphが完了した後、アクションのPromiseがresolveされて`onFinish`が実行される前に実行されます。

#### 実行順

成功したリクエストでは、フックは次の順序で実行されます。

1. `onSuccess` — サーバーの応答直後
2. `onSync` — 状態をマージした後
3. `onEffect` — エフェクトを処理した後
4. `onMorph` — 待機対象のDOM morphフェーズ中
5. `onMorphed` — すべてのDOM morph処理の完了後
6. `onFinish` — `onMorphed`の後
7. `onRender` — 次の`requestAnimationFrame`内

変更のないリアクティブな子など、メッセージがスキップされた場合は`onSuccess`の代わりに`onSkipped`が実行され、その後`onFinish`が実行されます。適用するmorphや描画がないため、morph・render系のフックは実行されません。アクションPromiseは`onFinish`と同時にresolveします。

### Request interceptor

各HTTPリクエストで実行され、1つのリクエストに複数コンポーネントのmessageが含まれることがあります。

```js
$wire.interceptRequest(({ request, onSend, onCancel, onSuccess, onError, onFailure, onResponse, onParsed, onStream, onRedirect, onDump, onFinish }) => {
    onSend(({ responsePromise }) => {})
    onCancel(() => {})
    onResponse(({ response }) => {})
    onParsed(({ response, body }) => {})
    onSuccess(({ response, body, json }) => {})
    onError(({ response, body, preventDefault }) => { preventDefault() })
    onFailure(({ error }) => {})
    onStream(({ response }) => {})
    onRedirect(({ url, preventDefault }) => { preventDefault() })
    onDump(({ html, preventDefault }) => { preventDefault() })
    onFinish(() => {})
})
```

### 例

```blade
<script>
    $wire.intercept(({ onSend, onFinish }) => {
        onSend(() => $wire.$el.classList.add('opacity-50'))
        onFinish(() => $wire.$el.classList.remove('opacity-50'))
    })
</script>
```

```blade
<script>
    $wire.intercept('delete', ({ action }) => {
        if (!confirm('削除してもよいですか？')) action.cancel()
    })
</script>
```

```js
Livewire.interceptRequest(({ onError }) => {
    onError(({ response, preventDefault }) => {
        if (response.status === 419) {
            preventDefault()
            if (confirm('セッションが期限切れです。更新しますか？')) window.location.reload()
        }
    })
})
```

```blade
<script>
    $wire.intercept('save', ({ onSuccess, onError }) => {
        onSuccess(() => showToast('保存しました！'))
        onError(() => showToast('保存に失敗しました', 'error'))
    })
</script>
```

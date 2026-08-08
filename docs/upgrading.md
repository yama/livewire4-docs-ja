# アップグレードガイド

Livewire v4では、後方互換性をできる限り維持しながら、いくつかの改善と最適化が行われています。このガイドではLivewire v3からv4へアップグレードする方法を説明します。

> [!tip] スムーズなアップグレード
> 多くのアプリケーションでは、最小限の変更でv4へアップグレードできます。破壊的変更の中心は設定の更新とメソッドシグネチャの変更で、主に高度な使い方に影響します。
>
> 作業時間を短縮したい場合は、[Laravel Shift](https://laravelshift.com)を使ってアップグレードを自動化できます。

## インストール

`composer.json`を更新してLivewire v4を要求します。

```bash
composer require livewire/livewire:^4.0
```

更新後、アプリケーションのキャッシュを削除します。

```bash
php artisan optimize:clear
```

> [!info] すべての変更をGitHubで確認する
> v3とv4のコード変更を完全に確認するには、GitHubの[3.xとmainの差分](https://github.com/livewire/livewire/compare/3.x...main)を参照してください。

## v4.0からv4.1へのアップグレード

### `wire:model`修飾子の挙動変更

`.blur`や`.change`などの修飾子は、ネットワーク通信のタイミングだけでなく、クライアント側の状態を同期するタイミングも制御するようになりました。以前の挙動が必要な場合は、その前に`.live`を追加します（例：`wire:model.live.blur`）。

[詳しい説明](#wiremodel修飾子がクライアント側の同期タイミングを制御するようになった)

---

以下の変更は、v3からv4へアップグレードする場合に適用されます。

## 影響の大きい変更

アプリケーションに影響する可能性が高いため、特に注意して確認してください。

### 設定ファイルの更新

いくつかの設定キーが名前変更・再構成され、デフォルト値も変更されています。`config/livewire.php`を更新してください。

> [!tip] 完全な設定ファイルを確認する
> 参考として、GitHubの[Livewire v4設定ファイル](https://github.com/livewire/livewire/blob/main/config/livewire.php)を参照できます。

#### 名前が変更された設定キー

**レイアウト設定:**

```php
// v3
'layout' => 'components.layouts.app',

// v4
'component_layout' => 'layouts::app',
```

レイアウトのデフォルト値は`layouts::`名前空間になり、`resources/views/layouts/app.blade.php`を指します。

**プレースホルダー設定:**

```php
// v3
'lazy_placeholder' => 'livewire.placeholder',

// v4
'component_placeholder' => 'livewire.placeholder',
```

#### デフォルト値の変更

**スマートな`wire:key`の挙動:**

```php
// v4ではtrue（v3ではfalse）
'smart_wire_keys' => true,
```

深くネストしたコンポーネントでの`wire:key`に関する問題を防ぎやすくなります。ループ内では引き続き`wire:key`を手動で追加する必要があります。

[wire:keyの詳細](https://livewire.laravel.com/docs/4.x/nesting#rendering-children-in-a-loop)

#### 新しい設定オプション

**コンポーネントの場所:**

```php
'component_locations' => [
    resource_path('views/components'),
    resource_path('views/livewire'),
],
```

シングルファイルコンポーネントとマルチファイルコンポーネントを探す場所を定義します。

**コンポーネントの名前空間:**

```php
'component_namespaces' => [
    'layouts' => resource_path('views/layouts'),
    'pages' => resource_path('views/pages'),
],
```

ビュー形式のコンポーネントを整理するカスタム名前空間を作成します（例：`<livewire:pages::dashboard />`）。

**makeコマンドのデフォルト:**

```php
'make_command' => [
    'type' => 'sfc',  // 'sfc'、'mfc'、'class'から選択
    'emoji' => true,   // ⚡絵文字プレフィックスを使うか
],
```

コンポーネント形式と絵文字の使用を設定します。v3と同じ挙動にするには、`type`を`'class'`にします。

**CSPセーフモード:**

```php
'csp_safe' => false,
```

`unsafe-eval`違反を避けるContent Security Policyモードを有効にします。有効にすると[Alpine CSPビルド](https://alpinejs.dev/advanced/csp)が使われます。`wire:click="addToCart($event.detail.productId)"`のような複雑なJavaScript式や`window.location`のようなグローバル参照は制限されます。

### ルーティングの変更

フルページコンポーネントでは、推奨されるルーティング方法が変わりました。

```php
// v3（動作するが推奨されない）
Route::get('/dashboard', Dashboard::class);

// v4（すべてのコンポーネント形式で推奨）
Route::livewire('/dashboard', Dashboard::class);

// ビュー形式のコンポーネントではコンポーネント名も使える
Route::livewire('/dashboard', 'pages::dashboard');
```

`Route::livewire()`が推奨される方法になり、シングルファイルおよびマルチファイルコンポーネントをフルページとして動作させるには必須です。

[ルーティングの詳細](https://livewire.laravel.com/docs/4.x/components#page-components)

### `wire:model`はデフォルトで子要素のイベントを無視する

v3では、子要素からバブルアップしたinput/changeイベントにも`wire:model`が反応していました。そのため、モーダルやアコーディオンなどのコンテナ要素に`wire:model`を置き、その中の入力欄を操作すると、意図せずコンテナが閉じることがありました。

v4では、要素自身から発生したイベントだけを監視します。子要素のイベントも取得したい場合は`.deep`修飾子を追加してください。

```blade
<!-- v3：子要素のイベントをデフォルトで監視 -->
<div wire:model="value">
    <input type="text">
</div>

<!-- v4：以前の挙動に戻すには.deepを追加 -->
<div wire:model.deep="value">
    <input type="text">
</div>
```

> [!tip] 多くのアプリケーションでは変更不要です
> 主にコンテナ要素で`wire:model`を使う特殊なケースに影響します。通常のフォーム入力は影響を受けません。

### `wire:navigate:scroll`を使う

v3で`wire:navigate`間のスクロール可能なコンテナのスクロール位置を保持するために`wire:scroll`を使っていた場合、v4では`wire:navigate:scroll`に置き換えます。

```blade
@persist('sidebar')
    <div class="overflow-y-scroll" wire:navigate:scroll>
        <!-- ... -->
    </div>
@endpersist
```

### コンポーネントタグを閉じる

v3では、Livewireコンポーネントタグを正しく閉じなくても描画されました。v4ではスロットに対応したため、コンポーネントタグを正しく閉じる必要があります。

```blade
<!-- v3：閉じていないタグ -->
<livewire:component-name>

<!-- v4：自己終了タグ -->
<livewire:component-name />
```

[コンポーネントの描画](https://livewire.laravel.com/docs/4.x/components#rendering-components)と[スロット](https://livewire.laravel.com/docs/4.x/nesting#slots)を参照してください。

## 影響が中程度の変更

使っている機能によっては、次の変更が影響する場合があります。

### `wire:model`修飾子がクライアント側の同期タイミングを制御するようになった

v3では`.blur`や`.change`はネットワークリクエストの送信タイミングだけを制御していました。入力値は入力中すぐにクライアント側の状態（`$wire.property`）へ同期されていました。

v4では、これらの修飾子がクライアント側の状態同期も制御します。ユーザーが入力を終えてEnterを押す、またはフォーカスを移動するまで状態を更新しないUIを作れます。

以前の挙動が必要な場合は、修飾子の前に`.live`を追加します。

```blade
<!-- v3 -->
<input wire:model.blur="title">

<!-- v4で同じ挙動にする場合 -->
<input wire:model.live.blur="title">
```

| v3の構文 | v4の構文 |
| --- | --- |
| `wire:model.blur` | `wire:model.live.blur` |
| `wire:model.change` | `wire:model.live.change` |

> [!info] `.lazy`は後方互換です
> `wire:model.lazy`はv3と同じように動作するため、移行は必要ありません。

v4では、ネットワークリクエストを送らずにクライアント側の更新だけを遅延できます。

```blade
<!-- フォーカス移動時にだけ$wire.widthを更新 -->
<input wire:model.blur="width">

<!-- Enterまたはフォーカス移動時に更新 -->
<input wire:model.blur.enter="search">
```

[wire:modelの詳細](https://livewire.laravel.com/docs/4.x/wire-model)

### `wire:transition`がView Transitions APIを使うようになった

v3の`wire:transition`はAlpineの`x-transition`をラップし、`.opacity`、`.scale`、`.duration.200ms`、`.origin.top`などの修飾子をサポートしていました。

v4ではブラウザー標準の[View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)を使います。基本的な使い方は動作しますが、修飾子は削除されました。

```blade
<!-- v4でも動作する -->
<div wire:transition>...</div>

<!-- 修飾子はサポートされない -->
<div wire:transition.opacity>...</div>
<div wire:transition.scale.origin.top>...</div>
<div wire:transition.duration.500ms>...</div>
```

[wire:transitionの詳細](https://livewire.laravel.com/docs/4.x/wire-transition)

### パフォーマンスの改善

v4ではリクエスト処理が大きく改善されています。

- **ノンブロッキングポーリング:** `wire:poll`が他のリクエストをブロックせず、他のリクエストからもブロックされない。
- **並列ライブ更新:** `wire:model.live`のリクエストが並列実行され、入力と結果表示が速くなる。

これらは自動的に適用されるため、コードの変更は必要ありません。

### 配列・オブジェクトの更新フックが統合される

フロントエンドから配列やオブジェクト全体を置き換える場合（例：`$wire.items = ['new', 'values']`）、v4ではインデックスごとではなく、1回にまとめた更新が送られます。

配列全体を置き換えると、`updatingItems`/`updatedItems`フックは新しい配列全体に対して1回だけ呼ばれます。個別の変更（`wire:model="items.0"`など）はこれまでどおり細かな更新として呼び出されます。

### メソッドシグネチャの変更

Livewireのコアを拡張している場合や、次のメソッドを直接呼び出している場合は変更してください。

**ストリーミング:**

```php
// v3
$this->stream(to: '#container', content: 'Hello', replace: true);

// v4
$this->stream(content: 'Hello', replace: true, el: '#container');
```

名前付き引数の`to:`は`el:`に変更されました。位置引数の場合も次のように変更します。

```php
// v3
$this->stream('#container', 'Hello');

// v4
$this->stream('Hello', el: '#container');
```

**コンポーネントのマウント（内部API）:**

`LivewireManager`を拡張している場合や`mount()`を直接呼び出している場合、`$slots = []`引数が追加されます。

```php
// v3
public function mount($name, $params = [], $key = null)

// v4
public function mount($name, $params = [], $key = null, $slots = [])
```

通常のアプリケーションには影響しません。

## 影響の小さい変更

高度な機能やカスタマイズを使っている場合だけ影響します。

### `wire:model`がブラケット記法をサポートする

ネストしたプロパティへアクセスするために、ブラケット記法を使えるようになりました。

```blade
<input type="text" wire:model="foo['bar']['baz']">

<input type="text" wire:model="items[0].name">
```

`wire:model`内の角括弧がプロパティアクセサーとして解釈されます。プロパティキーに角括弧を含めている場合は、競合を避けるため名前を変更してください。

[ネストしたプロパティへのアクセス](https://livewire.laravel.com/docs/4.x/wire-model#accessing-nested-properties)

### LivewireのアセットとエンドポイントURLの変更

LivewireのURLには、`APP_KEY`から生成された固有のハッシュが含まれるようになりました。プレフィックスは`/livewire/`から`/livewire-{hash}/`に変わりました。

```
# v3                          # v4
/livewire/update        →     /livewire-{hash}/update
/livewire/upload-file   →     /livewire-{hash}/upload-file
/livewire/livewire.js   →     /livewire-{hash}/livewire.js
```

ファイアウォール、CDN、ミドルウェアが`/livewire/`パスを参照している場合は、新しいプレフィックスに対応させてください。`setUpdateRoute`を使っている場合は、`$path`パラメータを使ってハッシュ付きエンドポイントを維持します。

```php
// v3
Livewire::setUpdateRoute(function ($handle) {
    return Route::post('/livewire/update', $handle);
});

// v4
Livewire::setUpdateRoute(function ($handle, $path) {
    return Route::post($path, $handle);
});
```

[Livewireのエンドポイントをカスタマイズする](/installation#livewireの更新エンドポイントをカスタマイズする)

### JavaScriptの非推奨化

#### `$wire.$js()`メソッド

JavaScriptアクションを定義する`$wire.$js()`は非推奨になりました。

```js
// 非推奨（v3）
$wire.$js('bookmark', () => {
    // ブックマークを切り替える...
})

// 新しい構文（v4）
$wire.$js.bookmark = () => {
    // ブックマークを切り替える...
}
```

#### プレフィックスなしの`$js`

`$wire.$js`または`this.$js`なしで`$js`を使う方法も非推奨です。新しい構文は`$wire.$js.bookmark`または`this.$js.bookmark`です。

> [!tip] 古い構文も動作します
> 後方互換性のため、v4でも古い構文は動作します。都合のよいタイミングで移行してください。

#### `commit`および`request`フック

`commit`と`request`フックは、より細かな制御と高いパフォーマンスを提供するインターセプターシステムに置き換えられ、非推奨になりました。既存のフックは引き続き動作します。

新しいAPIでは、次のように`interceptMessage`と`interceptRequest`を使います。

```js
Livewire.interceptMessage(({ component, message, onFinish, onSuccess, onError, onFailure }) => {
    onFinish(() => {})
    onSuccess(({ payload }) => {})
    onError(() => {})
    onFailure(() => {})
})

Livewire.interceptRequest(({ request, onResponse, onSuccess, onError, onFailure }) => {
    onResponse(({ response }) => {})
    onSuccess(({ response, responseJson }) => {})
    onError(({ response, responseBody, preventDefault }) => {})
    onFailure(({ error }) => {})
})
```

新しいシステムでは、ネットワーク障害とサーバーエラーを分離したエラー処理、`onSync`・`onMorph`・`onRender`などのライフサイクルフック、キャンセル、コンポーネント単位のスコープが利用できます。詳しくは[JavaScriptインターセプター](https://livewire.laravel.com/docs/4.x/javascript#interceptors)を参照してください。

## Voltからのアップグレード

Livewire v4のシングルファイルコンポーネントはVoltのクラスベースコンポーネントと同じ構文を使います。次の変更でVoltから移行できます。

### importを更新する

```php
// 変更前
use Livewire\Volt\Component;

new class extends Component { ... }

// 変更後
use Livewire\Component;

new class extends Component { ... }
```

### ルート定義を更新する

```php
// 変更前
use Livewire\Volt\Volt;

Volt::route('/dashboard', 'dashboard');

// 変更後
use Illuminate\Support\Facades\Route;

Route::livewire('/dashboard', 'dashboard');
```

### テストファイルを更新する

`Livewire\Volt\Volt`を`Livewire\Livewire`に、`Volt::test()`を`Livewire::test()`に置き換えます。

```php
// 変更前
use Livewire\Volt\Volt;
Volt::test('counter')

// 変更後
use Livewire\Livewire;
Livewire::test('counter')
```

### Voltサービスプロバイダーを削除する

```bash
rm app/Providers/VoltServiceProvider.php
```

その後、`bootstrap/providers.php`のproviders配列から`App\Providers\VoltServiceProvider::class`を削除します。

### Voltパッケージを削除する

```bash
composer remove livewire/volt
```

### Livewire v4をインストールする

以上の変更後、Livewire v4をインストールします。既存のVoltクラスベースコンポーネントは、Livewireのシングルファイルコンポーネントと同じ構文を使うため、そのまま動作します。

## v4の新機能

v4では、すぐに使い始められる機能が追加されています。シングルファイル・マルチファイルコンポーネント、スロットと属性転送、Islands、遅延・延期読み込み、非同期アクション、`wire:sort`、`wire:intersect`、`wire:ref`、`.renderless`、`.preserve-scroll`、`data-loading`属性、JavaScriptの`$errors`や`$intercept`などです。

詳細とサンプルは、対応する[コンポーネント](https://livewire.laravel.com/docs/4.x/components)、[Islands](https://livewire.laravel.com/docs/4.x/islands)、[遅延読み込み](https://livewire.laravel.com/docs/4.x/lazy)、[アクション](https://livewire.laravel.com/docs/4.x/actions)、[ディレクティブ](https://livewire.laravel.com/docs/4.x/wire-sort)、[ローディング状態](https://livewire.laravel.com/docs/4.x/loading-states)、[JavaScript](https://livewire.laravel.com/docs/4.x/javascript)のドキュメントを参照してください。

## ヘルプを得る

アップグレード中に問題が発生した場合は、次を確認してください。

- 詳しい機能ガイドは[公式ドキュメント](https://livewire.laravel.com)を確認する。
- コミュニティのサポートは[GitHub Discussions](https://github.com/livewire/livewire/discussions)を利用する。

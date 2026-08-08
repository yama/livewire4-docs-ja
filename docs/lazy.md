Livewireでは、初回ページロードを遅くする可能性のあるコンポーネントを遅延読み込みできます。

## 遅延読み込みと遅延実行

Livewireにはコンポーネントの読み込みを遅らせる方法が2つあります。

- **遅延読み込み (`lazy`)**: ビューポートに表示されたとき（ユーザーがスクロールしたとき）に読み込む
- **遅延実行 (`defer`)**: 初回ページロード完了直後に読み込む

どちらも遅いコンポーネントが初回ページレンダリングをブロックすることを防ぎますが、実際に読み込むタイミングが異なります。

## 基本例

`mount()` で遅いデータベースクエリを実行する `revenue` コンポーネントを考えてみましょう。

```php
<?php // resources/views/components/⚡revenue.blade.php

use Livewire\Component;
use App\Models\Transaction;

new class extends Component {
    public $amount;

    public function mount()
    {
        // 遅いデータベースクエリ...
        $this->amount = Transaction::monthToDate()->sum('amount');
    }
};
?>

<div>今月の売上: {{ $amount }}</div>
```

遅延読み込みをしないと、このコンポーネントがページ全体の読み込みを遅らせ、アプリケーション全体が遅く感じられます。`lazy` パラメータを渡して有効にできます。

```blade
<livewire:revenue lazy />
```

Livewireはコンポーネントをすぐに読み込まずにスキップしてページを表示し、そのコンポーネントがビューポートに入るとネットワークリクエストを送り、ページ上で完全に読み込みます。

> [!info] 遅延・遅延実行リクエストはデフォルトで分離される
> Livewireの他のネットワークリクエストとは異なり、遅延・遅延実行コンポーネントの更新はサーバーへ送信されると互いに分離されます。各コンポーネントを並列に読み込めるため、読み込みが高速になります。[コンポーネントのバンドルについて詳しく読む](#複数の遅延コンポーネントをバンドルする)

## プレースホルダーHTMLをレンダリングする

デフォルトでは、完全に読み込まれる前に空の `<div></div>` が挿入されます。最初はユーザーに見えないため、突然表示されると違和感があります。ローディングスピナーやスケルトンなどのプレースホルダーHTMLを表示できます。

### `@placeholder` ディレクティブを使う

シングルファイル・マルチファイルコンポーネントでは、ビュー内で `@placeholder` を直接使えます。

```blade
@placeholder
    <div>
        <!-- ローディングスピナー... -->
        <svg>...</svg>
    </div>
@endplaceholder

<div>今月の売上: {{ $amount }}</div>
```

`@placeholder` と `@endplaceholder` の間は読み込み中に表示され、読み込み完了後に実際のコンポーネント内容へ置き換わります。

> [!tip] プレースホルダーディレクティブはビュー形式のコンポーネントのみ
> `@placeholder` はビュー形式（シングルファイルとマルチファイル）のコンポーネントでのみ利用できます。クラスベースのコンポーネントでは `placeholder()` メソッドを使います。

> [!warning] プレースホルダーとコンポーネントは同じ要素型にする
> たとえばプレースホルダーのルート要素が `div` なら、コンポーネントも `div` 要素を使う必要があります。

### `placeholder()` メソッドを使う

クラスベースのコンポーネント、またはプログラムで制御したい場合は、HTMLを返す `placeholder()` メソッドを定義します。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Transaction;

class Revenue extends Component
{
    public $amount;

    public function mount()
    {
        // 遅いデータベースクエリ...
        $this->amount = Transaction::monthToDate()->sum('amount');
    }

public function placeholder()
{
    return <<<'HTML'
    <div>
        <!-- ローディングスピナー... -->
        <svg>...</svg>
    </div>
    HTML;
}

    public function render()
    {
        return view('livewire.revenue');
    }
}
```

複雑なローダー（スケルトンなど）では `placeholder()` からビューを返せます。

```php
public function placeholder(array $params = [])
{
    return view('livewire.placeholders.skeleton', $params);
}
```

遅延読み込みされるコンポーネントへ渡したパラメータは、`placeholder()` の `$params` 引数で利用できます。

## ページロード直後に読み込む

デフォルトでは、遅延コンポーネントはビューポートに入るまで完全に読み込まれません。ビューポートに入るのを待たず、ページロード直後に読み込むには `defer` を使います。

```blade
<livewire:revenue defer />
```

ページが準備できると、表示されるのを待たずに読み込まれます。`#[Defer]` 属性でデフォルトを遅延実行にもできます。

```php
use Livewire\Attributes\Defer;

#[Defer]
class Revenue extends Component
{
    // ...
}
```

> [!tip] 旧式のロード時構文
> `lazy="on-load"` も `defer` と同じ動作をします。新しいコードでは `defer` を推奨します。

## propsを渡す

外部からデータを渡せるため、一般に `lazy` コンポーネントは通常のコンポーネントと同じように扱えます。

```blade
<input type="date" wire:model="start">
<input type="date" wire:model="end">
<livewire:revenue lazy :$start :$end />
```

通常のコンポーネントと同様に `mount()` で受け取れます。

```php
<?php // resources/views/components/⚡revenue.blade.php

use Livewire\Component;
use App\Models\Transaction;

new class extends Component {
    public $amount;

    public function mount($start, $end)
    {
        // 高コストなデータベースクエリ...
        $this->amount = Transactions::between($start, $end)->sum('amount');
    }
};
?>

@placeholder
    <div>
        <!-- ローディングスピナー... -->
        <svg>...</svg>
    </div>
@endplaceholder

<div>
    今月の売上: {{ $amount }}
</div>
```

ただし通常のコンポーネントの読み込みと異なり、`lazy` コンポーネントは渡されたプロパティをシリアライズ（「脱水」）し、完全に読み込まれるまでクライアント側へ一時保存する必要があります。

たとえば `revenue` コンポーネントへEloquentモデルを渡す場合は次のようにします。

```blade
<livewire:revenue lazy :$user />
```

通常のコンポーネントでは、PHPメモリ上の `$user` モデルが `revenue` の `mount()` へ渡されます。しかし次のネットワークリクエストまで `mount()` を実行しないため、Livewireは `$user` をJSONへシリアライズし、次のリクエスト処理前にデータベースから再クエリします。

通常、このシリアライズによってアプリケーションの挙動に違いが生じることはありません。

## 遅延読み込み・遅延実行をデフォルトにする

すべての利用で強制するには、コンポーネントクラスの上に `#[Lazy]` または `#[Defer]` 属性を追加します。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\Lazy;

#[Lazy]
class Revenue extends Component
{
    // ...
}
```

遅延実行の場合:

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\Defer;

#[Defer]
class Revenue extends Component
{
    // ...
}
```

レンダリング時にデフォルトを上書きできます。

```blade
{{-- 遅延読み込みを無効にする --}}
<livewire:revenue :lazy="false" />

{{-- 遅延実行を無効にする --}}
<livewire:revenue :defer="false" />
```

## 複数の遅延コンポーネントをバンドルする

デフォルトでは、ページ上に複数の遅延コンポーネントがあると、それぞれが独立したネットワークリクエストを並列に送ります。各コンポーネントが独立して読み込まれるため、多くの場合は望ましい動作です。ただし多数ある場合、サーバー負荷を減らすため単一リクエストへまとめられます。

### `bundle` パラメータを使う

`bundle: true` を指定して有効にします。

```php
use Livewire\Attributes\Lazy;

#[Lazy(bundle: true)]
class Revenue extends Component
{
    // ...
}
```

同じページに `Revenue` が10個あれば、10個の更新が単一リクエストとして送られます。インラインでは `<livewire:revenue lazy.bundle />`、遅延実行では `<livewire:revenue defer.bundle />` を使えます。`#[Defer(bundle: true)]` も利用できます。

### バンドル修飾子を使う

```blade
<livewire:revenue lazy.bundle />
```

遅延実行コンポーネントでも使えます。

```blade
<livewire:revenue defer.bundle />
```

属性で指定することもできます。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\Defer;

#[Defer(bundle: true)]
class Revenue extends Component
{
    // ...
}
```

### バンドルを使う場面

**使う場合:**
- 一つのページに遅延・遅延実行コンポーネントが多数（5個以上）ある
- コンポーネントの複雑さと読み込み時間が似ている
- サーバー負荷とHTTP接続数を減らしたい

**使わない場合:**
- 読み込み時間が大きく異なる（遅いものが速いものをブロックする）
- 個々の準備ができた順に表示したい
- ページ上の遅延コンポーネントが少数しかない

> [!tip] 旧式の分離構文
> `isolate: false` も `bundle: true` と同じ動作です。新しいコードでは意図が明確な `bundle` を推奨します。

## フルページの遅延読み込み

ルートメソッドを使って、フルページLivewireコンポーネントも遅延・遅延実行できます。

### フルページを遅延読み込みする

`->lazy()` でビューポートに入ったときに読み込みます。

```php
Route::livewire('/dashboard', 'pages::dashboard')->lazy();
```

### フルページを遅延実行する

`->defer()` でページロード直後に読み込みます。

```php
Route::livewire('/dashboard', 'pages::dashboard')->defer();
```

### 遅延・遅延実行を無効にする

`#[Lazy]` または `#[Defer]` 属性でデフォルトにしたコンポーネントは、`enabled: false` で無効化できます。

```php
Route::livewire('/dashboard', 'pages::dashboard')->lazy(enabled: false);
Route::livewire('/dashboard', 'pages::dashboard')->defer(enabled: false);
```

`lazy()` はビューポートに入ったとき、`defer()` はページロード直後に読み込みます。属性でデフォルトにした場合は `enabled: false` で無効化できます。

## デフォルトのプレースホルダービュー

`/config/livewire.php` で全コンポーネントのデフォルトビューを設定できます。

```php
'component_placeholder' => 'livewire.placeholder',
```

遅延コンポーネントに `placeholder()` が定義されていなければ、設定したBladeビューを使います。

## テストで遅延読み込みを無効にする

遅延コンポーネントや遅延コンポーネントをネストしたページをテストするときは、プレースホルダーではなく最終的な表示を検証するため、`Livewire::withoutLazyLoading()` を使えます。

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\Dashboard;
use Livewire\Livewire;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    public function test_renders_successfully()
    {
        Livewire::withoutLazyLoading() // [tl! highlight]
            ->test(Dashboard::class)
            ->assertSee(...);
    }
}
```

これでテスト中は `placeholder()` のレンダリングをスキップし、遅延読み込みを適用していない場合と同じ完全なコンポーネントをレンダリングします。

## 関連項目

- **[Island](/islands)** — 一つのコンポーネント内で更新を分離する
- **[ローディング状態](/loading-states)** — コンポーネントの読み込み中にプレースホルダーを表示する
- **[@placeholder](https://livewire.laravel.com/docs/4.x/directive-placeholder)** — プレースホルダー内容を定義する
- **[Lazy属性](https://livewire.laravel.com/docs/4.x/attribute-lazy)** — コンポーネントを遅延読み込み対象にする

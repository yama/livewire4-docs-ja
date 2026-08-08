# コンポーネント

Livewireコンポーネントは、Bladeテンプレートから直接呼び出せるプロパティとメソッドを持つPHPクラスです。これらを組み合わせることで、JavaScriptフレームワークより少ないコードでフルスタックのインタラクティブなUIを作れます。

## コンポーネントを作成する

```shell
php artisan make:livewire post.create
```

デフォルトでは`resources/views/components/post/⚡create.blade.php`にシングルファイルコンポーネントを作成します。

```blade
<?php
use Livewire\Component;

new class extends Component {
    public $title = '';

    public function save() {}
};
?>

<div>
    <input wire:model="title" type="text">
    <button wire:click="save">投稿を保存</button>
</div>
```

⚡絵文字はエディターや検索結果でコンポーネントを見分けるためのもので、任意です。`config/livewire.php`で無効にできます。

```php
'make_command' => [
    'emoji' => false,
],
```

v3の規約を使う場合は、次のようにクラス形式をデフォルトにします。

```php
'make_command' => [
    'type' => 'class',
    'emoji' => false,
],
```

### ページコンポーネント

フルページとして使うコンポーネントには`pages::`名前空間を使います。

```shell
php artisan make:livewire pages::post.create
```

`resources/views/pages/post/⚡create.blade.php`に作成されます。

### マルチファイルコンポーネント

大きなコンポーネントでは、`--mfc`で関連ファイルを分割できます。

```shell
php artisan make:livewire post.create --mfc
```

PHPクラス、Blade、任意のJavaScript・CSS・Pestテストを同じディレクトリに配置します。

主なオプションは`--sfc`、`--mfc`、`--class`、`--type=sfc|mfc|class`、`--emoji=true|false`、`--test`、`--js`、`--css`です。

### 形式を変換する

`livewire:convert`でシングルファイルとマルチファイルを相互変換できます。

```shell
php artisan livewire:convert post.create
php artisan livewire:convert post.create --mfc
php artisan livewire:convert post.create --sfc
```

マルチファイルからシングルファイルへ変換するとき、テストファイルは保持できないため削除確認が表示されます。

## コンポーネントを描画する

```blade
<livewire:component-name />
<livewire:post.create />
<livewire:pages::post.create />
```

形式に関係なく、Bladeタグとルートで使うコンポーネント名は同じです。

| 形式 | ファイル | コンポーネント名 |
| --- | --- | --- |
| シングルファイル | `resources/views/components/post/⚡create.blade.php` | `post.create` |
| マルチファイル | `resources/views/components/post/⚡create/create.php` | `post.create` |
| クラス | `app/Livewire/Post/Create.php` | `post.create` |
| 名前空間付き | `resources/views/pages/post/⚡create.blade.php` | `pages::post.create` |

### Propsを渡す

```blade
<livewire:post.create title="初期タイトル" />
<livewire:post.create :title="$initialTitle" />
```

渡された値は`mount()`で受け取れます。`mount()`を省略すると、同名のpublicプロパティへ自動的に設定されます。

```php
public function mount($title = null)
{
    $this->title = $title;
}
```

Propsはデフォルトではリアクティブではありません。親の値の変更を子へ反映するには、[リアクティブなProps](/nesting#リアクティブprops)を明示的に使います。

## ページコンポーネント

```php
Route::livewire('/posts/create', 'pages::post.create');
```

ページコンポーネントはレイアウト、ページタイトル、ルートパラメータ、名前付きスロットを利用できます。詳しくは[ページ](/pages)を参照してください。

## ビューでデータにアクセスする

publicプロパティはBladeから直接利用できます。protectedプロパティは`$this->`で参照し、ブラウザーへ送信されないため機密情報に使えますが、リクエスト間では保持されません。

高価な処理には`#[Computed]`算出プロパティを使えます。

```php
use Livewire\Attributes\Computed;

#[Computed]
public function posts()
{
    return Post::with('author')->latest()->get();
}
```

Bladeでは`$this->posts`としてアクセスします。`render()`から`$this->view([...])`でデータを渡すこともできますが、更新のたびに実行されるため重い処理は避けてください。

## コンポーネントを整理する

`config/livewire.php`の`component_namespaces`で名前空間を追加できます。

```php
'component_namespaces' => [
    'pages' => resource_path('views/pages'),
    'admin' => resource_path('views/admin'),
],
```

`component_locations`では検索対象ディレクトリを追加できます。パッケージなどではサービスプロバイダーから`Livewire::addComponent()`、`addLocation()`、`addNamespace()`を使って登録できます。

## クラスベースコンポーネント

v2/v3から移行する場合や従来の構成を好む場合はクラス形式を使えます。

```shell
php artisan make:livewire CreatePost --class
```

`app/Livewire/CreatePost.php`と`resources/views/livewire/create-post.blade.php`が作成されます。デフォルト形式は次で設定できます。

```php
'make_command' => [
    'type' => 'class',
],
```

## コンポーネントスタブをカスタマイズする

```shell
php artisan livewire:stubs
```

生成された`stubs/livewire-sfc.stub`、`livewire-mfc-*.stub`、`livewire.stub`などを編集すると、以後の生成内容を変更できます。

## トラブルシューティング

コンポーネントが見つからない場合は、ファイルパス、ドット区切りの名前、名前空間設定、`php artisan view:clear`を確認してください。空白のページは、単一ルート要素、PHP構文、Laravelログを確認します。同名コンポーネントの衝突は名前変更または名前空間で解決します。

## 関連項目

- **[プロパティ](/properties)** — コンポーネントの状態を管理する
- **[アクション](/actions)** — メソッドで操作を処理する
- **[ページ](/pages)** — コンポーネントをページとして使う
- **[ネスト](/nesting)** — コンポーネントを組み合わせる
- **[ライフサイクルフック](/lifecycle-hooks)** — 特定の時点で処理を実行する

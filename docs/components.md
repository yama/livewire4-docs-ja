# コンポーネント

Livewireのコンポーネントは、基本的にはBladeテンプレートから直接呼び出せるプロパティとメソッドを持つPHPクラスです。この強力な組み合わせにより、最新のJavaScript代替技術に必要な労力や複雑さを大幅に減らしながら、フルスタックのインタラクティブなインターフェースを作成できます。

このガイドでは、Livewireコンポーネントの作成、描画、整理について知っておくべきことをすべて説明します。利用できるさまざまなコンポーネント形式（シングルファイル、マルチファイル、クラスベース）、コンポーネント間でのデータの渡し方、コンポーネントをフルページとして使う方法を学びます。

## コンポーネントを作成する

`make:livewire` Artisanコマンドを使ってコンポーネントを作成できます。

```shell
php artisan make:livewire post.create
```

次の場所にシングルファイルコンポーネントが作成されます。

`resources/views/components/post/⚡create.blade.php`
```blade
<?php

use Livewire\Component;

new class extends Component {
    public $title = '';

    public function save()
    {
        // ここに保存処理...
    }
};
?>

<div>
    <input wire:model="title" type="text">
    <button wire:click="save">投稿を保存</button>
</div>
```

> [!info] ⚡絵文字はなぜ使うのですか？
> ファイル名の稲妻マークが何のためにあるのか、疑問に思うかもしれません。この小さな工夫には実用的な目的があります。エディタのファイルツリーや検索結果で、Livewireコンポーネントをすぐに見分けられるようにするためです。Unicode文字なので、Windows、macOS、Linux、Git、本番サーバーなど、あらゆる環境で問題なく機能します。
>
> 絵文字は完全に任意です。使い慣れない場合は、`config/livewire.php`で完全に無効化できます。
>
> ```php
> 'make_command' => [
>     'emoji' => false,
> ],
> ```

> [!tip] v3の規約を使いたいですか？
> v3のクラスベースコンポーネントを使いたい場合は、`config/livewire.php`に2行の設定を追加して以前のデフォルトへ戻せます。
>
> ```php
> 'make_command' => [
>     'type' => 'class',
>     'emoji' => false,
> ],
> ```

### ページコンポーネントを作成する

フルページとして使うコンポーネントを作成する場合は、`pages::`名前空間を使い、専用ディレクトリに整理します。

```shell
php artisan make:livewire pages::post.create
```

コンポーネントは`resources/views/pages/post/⚡create.blade.php`に作成されます。この整理方法により、ページであるコンポーネントと再利用可能なUIコンポーネントを明確に区別できます。

コンポーネントをページとして使う方法については、下の[ページコンポーネントのセクション](#ページコンポーネント)で詳しく説明します。独自のカスタム名前空間を登録することもできます。詳しくは[コンポーネントの名前空間のドキュメント](/components#コンポーネントの名前空間)を参照してください。

### マルチファイルコンポーネント

コンポーネントやプロジェクトが大きくなると、シングルファイル方式では限界を感じることがあります。Livewireには、整理やIDEサポートを向上させるため、コンポーネントを複数のファイルに分割するマルチファイル方式があります。

マルチファイルコンポーネントを作成するには、`--mfc`フラグを渡します。

```shell
php artisan make:livewire post.create --mfc
```

関連するすべてのファイルをまとめたディレクトリが作成されます。

```
resources/views/components/post/⚡create/
├── create.php          # PHPクラス
├── create.blade.php    # Bladeテンプレート
├── create.js           # JavaScript（任意）
├── create.css          # スコープ付きスタイル（任意）
├── create.global.css   # グローバルスタイル（任意）
└── create.test.php     # Pestテスト（--testフラグ指定時は任意）
```

### コマンドオプション

`make:livewire`コマンドは、次のオプションを受け付けます。

| オプション | 説明 |
|---|---|
| `--sfc` | シングルファイルコンポーネントを作成（デフォルト） |
| `--mfc` | マルチファイルコンポーネントを作成 |
| `--class` | クラスベースコンポーネントを作成 |
| `--type=sfc\|mfc\|class` | コンポーネント形式を明示的に指定 |
| `--emoji=true\|false` | このコマンドで設定済みの絵文字設定を上書き |
| `--test` | Pestテストファイルを含める |
| `--js` | JavaScriptファイルを含める（マルチファイルコンポーネントのみ） |
| `--css` | CSSファイルを含める（マルチファイルコンポーネントのみ） |

### 形式を変換する

Livewireには、シングルファイル形式とマルチファイル形式の間でコンポーネントをシームレスに変換する`livewire:convert`コマンドがあります。

**自動検出して変換する:**

```shell
php artisan livewire:convert post.create
# シングルファイル → マルチファイル（またはその逆）
```

**マルチファイル形式へ明示的に変換する:**

```shell
php artisan livewire:convert post.create --mfc
```

シングルファイルコンポーネントを解析し、ディレクトリ構造を作成してファイルを分割し、元のファイルを削除します。

**シングルファイル形式へ明示的に変換する:**

```shell
php artisan livewire:convert post.create --sfc
```

すべてのファイルを1つのファイルにまとめ、ディレクトリを削除します。

> [!warning] シングルファイルへ変換するとテストファイルが削除されます
> マルチファイルコンポーネントにテストファイルがある場合、シングルファイル形式ではテストファイルを保持できないため、変換前に確認を求められます。

### 各形式を使う場合

**シングルファイルコンポーネント（デフォルト）:**

- ほとんどのコンポーネントに最適
- 関連するコードをまとめて管理できる
- 一目で理解しやすい
- 小〜中規模のコンポーネントに最適

**マルチファイルコンポーネント:**

- 大規模で複雑なコンポーネントに適している
- IDEのサポートとナビゲーションが向上する
- JavaScriptが多いコンポーネントで、より明確に分離できる

**クラスベースコンポーネント:**

- Livewire v2/v3の開発者に馴染みやすい
- Laravelの伝統的な関心の分離に沿っている
- 既存の規約があるチームに適している
- 下の[クラスベースコンポーネント](#クラスベースコンポーネント)を参照

## コンポーネントを描画する

`<livewire:component-name />`構文を使うと、任意のBladeテンプレートにLivewireコンポーネントを含められます。

```blade
<livewire:component-name />
```

コンポーネントがサブディレクトリにある場合は、ドット（`.`）文字で指定できます。

`resources/views/components/post/⚡create.blade.php`
```blade
<livewire:post.create />
```

`pages::`のような名前空間付きコンポーネントでは、名前空間のプレフィックスを使います。

```blade
<livewire:pages::post.create />
```

### ファイルパスとコンポーネント名の対応

どの形式（シングルファイル、マルチファイル、クラスベース）を使う場合でも、Bladeタグとルートで使うコンポーネント名は常に同じです。⚡絵文字のプレフィックスとファイル構造は自動的に取り除かれます。

| 形式 | ファイルパス | コンポーネント名 |
|---|---|---|
| シングルファイル | `resources/views/components/post/⚡create.blade.php` | `post.create` |
| マルチファイル | `resources/views/components/post/⚡create/create.php` | `post.create` |
| クラスベース | `app/Livewire/Post/Create.php` | `post.create` |
| シングルファイル（名前空間付き） | `resources/views/pages/post/⚡create.blade.php` | `pages::post.create` |
| マルチファイル（名前空間付き） | `resources/views/pages/post/⚡create/create.php` | `pages::post.create` |

つまり、Bladeテンプレートやルートを変更せずに形式を切り替えられます。

### Propsを渡す

コンポーネントタグのprop属性を使って、Livewireコンポーネントへデータを渡せます。

```blade
<livewire:post.create title="初期タイトル" />
```

動的な値や変数を渡す場合は、属性の先頭にコロンを付けます。

```blade
<livewire:post.create :title="$initialTitle" />
```

コンポーネントへ渡されたデータは、`mount()`メソッドで受け取ります。

```php
<?php

use Livewire\Component;

new class extends Component {
    public $title;

    public function mount($title = null)
    {
        $this->title = $title;
    }

    // ...
};
```

`mount()`メソッドはクラスのコンストラクタのようなものだと考えられます。コンポーネントの初期化時に実行されますが、ページのセッション中に後続のリクエストが発生しても実行されません。`mount()`やその他の便利なライフサイクルフックについては、[ライフサイクルのドキュメント](/lifecycle-hooks)で詳しく学べます。

定型コードを減らすため、`mount()`メソッドを省略できます。Livewireは渡された値と名前が一致するプロパティを自動的に設定します。

```php
<?php

use Livewire\Component;

new class extends Component {
    public $title; // propから自動設定

    // ...
};
```

> [!warning] これらのプロパティはデフォルトではリアクティブではありません
> 初回ページ読み込み後に外側の`:title="$initialValue"`が変更されても、`$title`プロパティは自動的に更新されません。これはLivewireでよく混乱する点です。特にVueやReactのようなJavaScriptフレームワークを使ったことがある開発者は、これらのパラメータがそれらのフレームワークの「リアクティブなProps」のように動作すると考えがちです。しかし心配はいりません。[Propsをリアクティブにする](/nesting#リアクティブprops)ことを選択できます。

### ルートパラメータをPropsとして渡す

コンポーネントをページとして使う場合、ルートパラメータを直接コンポーネントに渡せます。ルートパラメータは`mount()`メソッドに自動的に渡されます。

```php
Route::livewire('/posts/{id}', 'pages::post.show');
```

```php
<?php // resources/views/pages/post/⚡show.blade.php

use Livewire\Component;

new class extends Component {
    public $postId;

    public function mount($id)
    {
        $this->postId = $id;
    }
};
```

LivewireはLaravelのルートモデルバインディングもサポートしています。

```php
Route::livewire('/posts/{post}', 'pages::post.show');
```

```php
<?php // resources/views/pages/post/⚡show.blade.php

use App\Models\Post;
use Livewire\Component;

new class extends Component {
    public Post $post; // ルートから自動的にバインド

    // mount()は不要 - Livewireが自動的に処理
};
```

## ページコンポーネント

`Route::livewire()`を使うと、コンポーネントをフルページとして直接ルーティングできます。これはLivewireの最も強力な機能の1つで、従来のコントローラーなしにページ全体を構築できます。

```php
Route::livewire('/posts/create', 'pages::post.create');
```

ユーザーが`/posts/create`にアクセスすると、Livewireはアプリケーションのレイアウトファイル内に`pages::post.create`コンポーネントを描画します。

ページコンポーネントは通常のコンポーネントと同じように動作しますが、次の機能を利用できるフルページとして描画されます。

- カスタムレイアウト
- ページタイトル
- ルートパラメータとモデルバインディング
- レイアウト用の名前付きスロット

レイアウト、タイトル、高度なルーティングを含むページコンポーネントの完全な情報は、[ページのドキュメント](/pages)を参照してください。

## ビューでデータにアクセスする

Livewireには、コンポーネントのBladeビューへデータを渡す方法がいくつかあります。それぞれの方法で、パフォーマンスとセキュリティの特性が異なります。

### コンポーネントのプロパティ

最も簡単な方法はpublicプロパティを使うことです。publicプロパティはBladeテンプレートから自動的に利用できます。

```php
<?php

use Livewire\Component;

new class extends Component {
    public $title = '私の投稿';
};
```

```blade
<div>
    <h1>{{ $title }}</h1>
</div>
```

protectedプロパティには`$this->`を使ってアクセスする必要があります。

```php
public $title = '私の投稿';           // {{ $title }}として利用可能
protected $apiKey = 'secret-key';    // {{ $this->apiKey }}として利用可能
```

> [!info] protectedプロパティはクライアントに送信されません
> publicプロパティとは異なり、protectedプロパティがフロントエンドに送信されることはなく、ユーザーが操作することもできません。そのため機密データに対して安全です。ただし、リクエスト間では保持されないため、ほとんどのLivewireの用途では有用性が限られます。クライアント側に公開したくない、プロパティ宣言で定義する静的な値に使うのが最適です。

保持の動作や高度な機能を含むプロパティの完全な情報は、[プロパティのドキュメント](/properties)を参照してください。

### 算出プロパティ

算出プロパティは、メモ化されたプロパティのように動作するメソッドです。データベースクエリのようなコストの高い処理に最適です。

```php
use Livewire\Attributes\Computed;

#[Computed]
public function posts()
{
    return Post::with('author')->latest()->get();
}
```

```blade
<div>
    @foreach ($this->posts as $post)
        <article wire:key="{{ $post->id }}">{{ $post->title }}</article>
    @endforeach
</div>
```

`$this->`プレフィックスに注目してください。これはLivewireに、メソッドを呼び出して結果を現在のリクエスト中だけ（リクエスト間ではなく）キャッシュするよう伝えます。詳しくは、[プロパティのドキュメントにある算出プロパティのセクション](/properties#算出プロパティ)を参照してください。

### render()からデータを渡す

コントローラーと同じように、`render()`メソッドを使ってビューへ直接データを渡せます。

```php
public function render()
{
    return $this->view([
        'author' => Auth::user(),
        'currentTime' => now(),
    ]);
}
```

`render()`はコンポーネントが更新されるたびに実行されるため、更新ごとに最新のデータが必要な場合を除き、ここではコストの高い処理を避けてください。

## コンポーネントを整理する

Livewireはデフォルトの`resources/views/components/`ディレクトリにあるコンポーネントを自動的に検出しますが、Livewireがコンポーネントを探す場所をカスタマイズし、名前空間を使って整理することもできます。

### コンポーネントの名前空間

コンポーネントの名前空間を使うと、専用ディレクトリにコンポーネントを整理し、わかりやすい参照構文で利用できます。

デフォルトでは、Livewireに次の2つの名前空間があります。

- `pages::` — `resources/views/pages/`を指す
- `layouts::` — `resources/views/layouts/`を指す

`config/livewire.php`で追加の名前空間を定義できます。

```php
'component_namespaces' => [
    'layouts' => resource_path('views/layouts'),
    'pages' => resource_path('views/pages'),
    'admin' => resource_path('views/admin'),    // カスタム名前空間
    'widgets' => resource_path('views/widgets'), // もう1つのカスタム名前空間
],
```

作成、描画、ルーティングの際に名前空間を使います。

```shell
php artisan make:livewire admin::users-table
```

```blade
<livewire:admin::users-table />
```

```php
Route::livewire('/admin/users', 'admin::users-table');
```

### 追加のコンポーネント配置場所

デフォルト以外の追加ディレクトリにあるコンポーネントもLivewireに検出させたい場合は、`config/livewire.php`で設定できます。

```php
'component_locations' => [
    resource_path('views/components'),
    resource_path('views/admin/components'),
    resource_path('views/widgets'),
],
```

これでLivewireは、これらすべてのディレクトリにあるコンポーネントを自動的に検出します。

### プログラムによる登録

より動的なシナリオ（パッケージ開発や実行時設定など）では、サービスプロバイダー内でコンポーネント、配置場所、名前空間をプログラムから登録できます。

**個別のコンポーネントを登録する:**

```php
use Livewire\Livewire;

// サービスプロバイダーのboot()メソッド内（例: App\Providers\AppServiceProvider）
Livewire::addComponent(
    name: 'custom-button',
    viewPath: resource_path('views/ui/button.blade.php')
);
```

**コンポーネントディレクトリを登録する:**

```php
Livewire::addLocation(
    viewPath: resource_path('views/admin/components')
);
```

**名前空間を登録する:**

```php
Livewire::addNamespace(
    namespace: 'ui',
    viewPath: resource_path('views/ui')
);
```

この方法は、条件付きでコンポーネントを登録する必要がある場合や、Livewireコンポーネントを提供するLaravelパッケージを構築する場合に便利です。

#### クラスベースコンポーネントを登録する

クラスベースコンポーネントでは、`path`の代わりに`class`パラメータを使って同じメソッドを呼び出します。

```php
use Livewire\Livewire;

// サービスプロバイダーのboot()メソッド内（例: App\Providers\AppServiceProvider）

// 個別のクラスベースコンポーネントを登録
Livewire::addComponent(
    name: 'todos',
    class: \App\Livewire\Todos::class
);

// クラスベースコンポーネントの配置場所を登録
Livewire::addLocation(
    classNamespace: 'App\\Admin\\Livewire'
);

// クラスベースコンポーネント用の名前空間を作成
Livewire::addNamespace(
    namespace: 'admin',
    classNamespace: 'App\\Admin\\Livewire',
    classPath: app_path('Admin/Livewire'),
    classViewPath: resource_path('views/admin/livewire')
);
```

## クラスベースコンポーネント

Livewire v3から移行するチームや、より伝統的なLaravelの構造を好むチームのために、Livewireはクラスベースコンポーネントを完全にサポートしています。この方式では、PHPクラスとBladeビューを従来の配置場所にある別ファイルへ分離します。

### クラスベースコンポーネントを作成する

```shell
php artisan make:livewire CreatePost --class
```

次の2つの別ファイルが作成されます。

`app/Livewire/CreatePost.php`
```php
<?php

namespace App\Livewire;

use Livewire\Component;

class CreatePost extends Component
{
	public function render()
	{
		return view('livewire.create-post');
	}
}
```

`resources/views/livewire/create-post.blade.php`
```blade
<div>
	{{-- ... --}}
</div>
```

### クラスベースコンポーネントを使う場合

**次のような場合はクラスベースコンポーネントを使います:**

- Livewire v2/v3から移行する場合
- チームがより伝統的なファイル構造を好む場合
- クラスベースアーキテクチャに関する既存の規約がある場合

**次のような場合はシングルファイルまたはマルチファイルコンポーネントを使います:**

- 新しいLivewire v4プロジェクトを始める場合
- コンポーネントのコロケーションを改善したい場合
- 最新のLivewire規約を使いたい場合

### デフォルトのコンポーネント形式を設定する

クラスベースコンポーネントをデフォルトにしたい場合は、`config/livewire.php`で設定します。

```php
'make_command' => [
    'type' => 'class',
],
```

## コンポーネントスタブをカスタマイズする

次のコマンドを実行して、Livewireが新しいコンポーネントの生成に使うファイル（または_スタブ_）をカスタマイズできます。

```shell
php artisan livewire:stubs
```

変更できるスタブファイルがアプリケーション内に作成されます。

**シングルファイルコンポーネントのスタブ:**
* `stubs/livewire-sfc.stub` — シングルファイルコンポーネント

**マルチファイルコンポーネントのスタブ:**
* `stubs/livewire-mfc-class.stub` — マルチファイルコンポーネントのPHPクラス
* `stubs/livewire-mfc-view.stub` — マルチファイルコンポーネントのBladeビュー
* `stubs/livewire-mfc-js.stub` — マルチファイルコンポーネントのJavaScript
* `stubs/livewire-mfc-test.stub` — マルチファイルコンポーネントのPestテスト

**クラスベースコンポーネントのスタブ:**
* `stubs/livewire.stub` — クラスベースコンポーネントのPHPクラス
* `stubs/livewire.view.stub` — クラスベースコンポーネントのBladeビュー

**追加のスタブ:**
* `stubs/livewire.attribute.stub` — Attributeクラス
* `stubs/livewire.form.stub` — Formクラス

公開すると、Livewireはコンポーネントを生成する際にカスタムスタブを自動的に使います。

## トラブルシューティング

### コンポーネントが見つからない

**症状:** 「Component [post.create] not found」や「Unable to find component」のようなエラーメッセージが表示される

**解決策:**
- コンポーネントファイルが想定されたパスに存在することを確認する
- ビュー内のコンポーネント名がファイル構造（サブディレクトリにはドット）と一致していることを確認する
- 名前空間付きコンポーネントの場合、`config/livewire.php`で名前空間が定義されているか、サービスプロバイダーで手動登録されていることを確認する
- ビューキャッシュをクリアしてみる: `php artisan view:clear`

### コンポーネントが空白になる、または描画されない

**よくある原因:**
- Bladeテンプレートにルート要素がない（Livewireではルートが正確に1つ必要）
- コンポーネントのPHPセクションに構文エラーがある
- 詳細なエラーメッセージについてLaravelのログを確認する

### クラス名の競合

**症状:** シングルファイルコンポーネントを使ったときに、クラス名の重複に関するエラーが表示される

**解決策:** 異なるディレクトリに同じ名前のシングルファイルコンポーネントが複数ある場合に発生します。次のいずれかを行います。
- どちらかのコンポーネント名を一意なものに変更する
- より明確に分離するため、どちらかのディレクトリに名前空間を設定する

## 関連項目

- **[プロパティ](/properties)** — コンポーネントの状態とデータを管理する
- **[アクション](/actions)** — メソッドでユーザー操作を処理する
- **[ページ](/pages)** — コンポーネントをルーティング可能なフルページとして使う
- **[ネスト](/nesting)** — コンポーネントを組み合わせ、コンポーネント間でデータを渡す
- **[ライフサイクルフック](/lifecycle-hooks)** — コンポーネントのライフサイクルの特定の時点でコードを実行する

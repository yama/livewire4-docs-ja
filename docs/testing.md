# テスト

Livewireコンポーネントは簡単にテストできます。内部では単なるLaravelクラスなので、Laravelに既存のテストツールを使ってテストできます。ただしLivewireには、コンポーネントのテストを簡単にする多くの追加ユーティリティも用意されています。

このドキュメントでは、推奨テストフレームワークである**Pest**を使ってLivewireコンポーネントをテストする方法を説明します。好みに応じてPHPUnitを使うこともできます。

## Pestをインストールする

[Pest](https://pestphp.com/)は、シンプルさを重視した使いやすいPHPテストフレームワークです。Livewire 4でLivewireコンポーネントをテストする推奨方法です。

LaravelアプリケーションにPestをインストールするには、まずPHPUnit（インストールされている場合）を削除し、Pestを追加します。

```shell
composer remove phpunit/phpunit
composer require pestphp/pest --dev --with-all-dependencies
```

次に、プロジェクトでPestを初期化します。

```shell
./vendor/bin/pest --init
```

プロジェクトに`tests/Pest.php`設定ファイルが作成されます。

より詳しいインストール手順は、[Pestのインストールドキュメント](https://pestphp.com/docs/installation)を参照してください。

## ビューベースコンポーネント向けにPestを設定する

ビューベース（シングルファイルまたはマルチファイル）コンポーネントの横にテストを書く場合、これらのテストファイルを認識するようPestを設定する必要があります。

まず、`tests/Pest.php`を更新して`resources/views`ディレクトリを含めます。

```php
pest()->extend(Tests\TestCase::class)
    // ...
    ->in('Feature', '../resources/views');
```

これによりPestは、`tests/Feature`ディレクトリと`resources/views`内のすべての場所にあるテストで、`TestCase`基底クラスを使います。

次に、`phpunit.xml`を更新してコンポーネントテスト用のテストスイートを追加します。

```xml
<testsuite name="Components">
    <directory suffix=".test.php">resources/views</directory>
</testsuite>
```

これで`./vendor/bin/pest`を実行したとき、Pestはコンポーネントの隣にあるテストを認識して実行します。

## 最初のテストを作成する

`make:livewire`コマンドに`--test`フラグを付けると、コンポーネントの隣にテストファイルを生成できます。

```shell
php artisan make:livewire post.create --test
```

マルチファイルコンポーネントでは、`resources/views/components/post/create.test.php`にテストファイルが作成されます。

```php
<?php

use Livewire\Livewire;

it('正常に描画される', function () {
    Livewire::test('post.create')
        ->assertStatus(200);
});
```

クラスベースコンポーネントでは、`tests/Feature/Livewire/Post/CreateTest.php`にPHPUnitテストファイルが作成されます。Pest構文に変換しても、PHPUnitを使い続けても構いません。どちらもLivewireで問題なく機能します。

### ページにコンポーネントが含まれることをテストする

最も簡単なLivewireテストは、指定したエンドポイントがLivewireコンポーネントを含み、正常に描画されることを確認するテストです。

```php
it('ページにコンポーネントが存在する', function () {
    $this->get('/posts/create')
        ->assertSeeLivewire('post.create');
});
```

> [!tip] スモークテストは非常に価値がある
> このようなテストは「スモークテスト」と呼ばれ、アプリケーションに致命的な問題がないことを確認します。単純ではありますが、メンテナンスがほとんど必要なく、ページが正常に描画されるという最低限の信頼を与えてくれるため、大きな価値があります。

## ブラウザテスト

Pest v4には、Playwrightを利用したファーストパーティのブラウザテストサポートが含まれています。実際のブラウザでユーザーと同じように操作しながら、Livewireコンポーネントをテストできます。

### ブラウザテストをインストールする

まず、Pestのブラウザプラグインをインストールします。

```shell
composer require pestphp/pest-plugin-browser --dev
```

次に、npmでPlaywrightをインストールします。

```shell
npm install playwright@latest
npx playwright install
```

ブラウザテストの完全なドキュメントは、[Pestのブラウザテストガイド](https://pestphp.com/docs/browser-testing)を参照してください。

### ブラウザテストを書く

`Livewire::test()`の代わりに`Livewire::visit()`を使うと、実際のブラウザでコンポーネントをテストできます。

```php
it('新しい投稿を作成できる', function () {
    Livewire::visit('post.create')
        ->type('[wire\:model="title"]', '最初の投稿')
        ->type('[wire\:model="content"]', 'これは本文です')
        ->press('保存')
        ->assertSee('投稿を正常に作成しました');
});
```

ブラウザテストはユニットテストより遅いものの、実際のブラウザ環境でコンポーネントが期待どおりに動作することをエンドツーエンドで確認できます。

利用できるブラウザテストアサーションの完全な一覧は、[Pestのブラウザテストアサーション](https://pestphp.com/docs/browser-testing#content-available-assertions)を参照してください。

> [!info] ブラウザテストを使う場合
> 重要なユーザーフローや複雑なインタラクションにはブラウザテストを使ってください。ほとんどのコンポーネントテストでは、標準の`Livewire::test()`のほうが高速で十分です。

## ビューをテストする

Livewireには、コンポーネントの描画結果にテキストが表示されることを確認する`assertSee()`があります。

```php
use App\Models\Post;

it('投稿を表示する', function () {
    Post::factory()->create(['title' => '最初の投稿']);
    Post::factory()->create(['title' => '2番目の投稿']);

    Livewire::test('show-posts')
        ->assertSee('最初の投稿')
        ->assertSee('2番目の投稿');
});
```

### ビューデータをアサートする

描画結果ではなく、ビューに渡されたデータをテストすると便利な場合があります。

```php
use App\Models\Post;

it('すべての投稿をビューに渡す', function () {
    Post::factory()->count(3)->create();

    Livewire::test('show-posts')
        ->assertViewHas('posts', function ($posts) {
            return count($posts) === 3;
        });
});
```

単純なアサーションでは、期待する値を直接渡せます。

```php
Livewire::test('show-posts')
    ->assertViewHas('postCount', 3);
```

## 認証を使ってテストする

ほとんどのアプリケーションでは、ユーザーのログインが必要です。各テストの開始時に手動で認証する代わりに、`actingAs()`メソッドを使います。

```php
use App\Models\User;
use App\Models\Post;

it('ユーザーは自分の投稿だけを表示する', function () {
    $user = User::factory()
        ->has(Post::factory()->count(3))
        ->create();

    $stranger = User::factory()
        ->has(Post::factory()->count(2))
        ->create();

    Livewire::actingAs($user)
        ->test('show-posts')
        ->assertViewHas('posts', function ($posts) {
            return count($posts) === 3;
        });
});
```

## プロパティをテストする

Livewireには、コンポーネントのプロパティを設定・アサートするユーティリティがあります。

`set()`でプロパティを更新し、`assertSet()`で値を確認します。

```php
it('titleプロパティを設定できる', function () {
    Livewire::test('post.create')
        ->set('title', '素晴らしい投稿')
        ->assertSet('title', '素晴らしい投稿');
});
```

### プロパティを初期化する

コンポーネントは親コンポーネントやルートパラメータからデータを受け取ることがよくあります。このデータを`Livewire::test()`の2番目のパラメータとして渡します。

```php
use App\Models\Post;

it('編集時にtitleフィールドが入力される', function () {
    $post = Post::factory()->create([
        'title' => '既存の投稿タイトル',
    ]);

    Livewire::test('post.edit', ['post' => $post])
        ->assertSet('title', '既存の投稿タイトル');
});
```

### URLパラメータを設定する

コンポーネントが[LivewireのURL機能](https://livewire.laravel.com/docs/4.x/url)を使ってクエリ文字列で状態を追跡している場合、`withQueryParams()`でURLパラメータをシミュレートします。

```php
use App\Models\Post;

it('URLクエリ文字列で投稿を検索できる', function () {
    Post::factory()->create(['title' => 'Laravelのテスト']);
    Post::factory()->create(['title' => 'Vueコンポーネント']);

    Livewire::withQueryParams(['search' => 'Laravel'])
        ->test('search-posts')
        ->assertSee('Laravelのテスト')
        ->assertDontSee('Vueコンポーネント');
});
```

### Cookieを設定する

`withCookie()`または`withCookies()`を使って、テストのCookieを設定します。

```php
it('Cookieから割引トークンを読み込む', function () {
    Livewire::withCookies(['discountToken' => 'SUMMER2024'])
        ->test('cart')
        ->assertSet('discountToken', 'SUMMER2024');
});
```

## アクションを呼び出す

テストでコンポーネントのアクションを発生させるには、`call()`メソッドを使います。

```php
use App\Models\Post;

it('投稿を作成できる', function () {
    expect(Post::count())->toBe(0);

    Livewire::test('post.create')
        ->set('title', '新しい投稿')
        ->set('content', '投稿の本文です')
        ->call('save');

    expect(Post::count())->toBe(1);
});
```

> [!tip] Pestのexpectation
> 上の例では、Pestの`expect()`構文を使ってアサーションしています。利用できるexpectationの完全な一覧は、[Pestのexpectationドキュメント](https://pestphp.com/docs/expectations)を参照してください。

アクションにパラメータを渡せます。

```php
Livewire::test('post.show')
    ->call('deletePost', $postId);
```

### バリデーションをテストする

`assertHasErrors()`を使って、バリデーションエラーが発生したことをアサートします。

```php
it('titleフィールドは必須', function () {
    Livewire::test('post.create')
        ->set('title', '')
        ->call('save')
        ->assertHasErrors('title');
});
```

特定のバリデーションルールをテストします。

```php
it('titleは最低3文字必要', function () {
    Livewire::test('post.create')
        ->set('title', 'ab')
        ->call('save')
        ->assertHasErrors(['title' => ['min:3']]);
});
```

### 認可をテストする

`assertUnauthorized()`と`assertForbidden()`を使って、認可チェックが正しく機能することを確認します。

```php
use App\Models\User;
use App\Models\Post;

it('他のユーザーの投稿を更新できない', function () {
    $user = User::factory()->create();
    $stranger = User::factory()->create();
    $post = Post::factory()->for($stranger)->create();

    Livewire::actingAs($user)
        ->test('post.edit', ['post' => $post])
        ->set('title', '乗っ取った！')
        ->call('save')
        ->assertForbidden();
});
```

### リダイレクトをテストする

アクションがリダイレクトを実行したことをアサートします。

```php
it('作成後に投稿一覧へリダイレクトする', function () {
    Livewire::test('post.create')
        ->set('title', '新しい投稿')
        ->set('content', '本文です')
        ->call('save')
        ->assertRedirect('/posts');
});
```

名前付きルートやページコンポーネントへのリダイレクトもアサートできます。

```php
->assertRedirect(route('posts.index'));
->assertRedirectToRoute('posts.index');
```

### イベントをテストする

コンポーネントからイベントがディスパッチされたことをアサートします。

```php
it('投稿作成時にイベントをディスパッチする', function () {
    Livewire::test('post.create')
        ->set('title', '新しい投稿')
        ->call('save')
        ->assertDispatched('post-created');
});
```

コンポーネント間のイベント通信をテストします。

```php
it('イベントのディスパッチ時に投稿件数を更新する', function () {
    $badge = Livewire::test('post-count-badge')
        ->assertSee('0');

    Livewire::test('post.create')
        ->set('title', '新しい投稿')
        ->call('save')
        ->assertDispatched('post-created');

    $badge->dispatch('post-created')
        ->assertSee('1');
});
```

特定のパラメータとともにイベントがディスパッチされたことをアサートします。

```php
it('投稿削除時に通知をディスパッチする', function () {
    Livewire::test('post.show')
        ->call('delete', postId: 3)
        ->assertDispatched('notify', message: '投稿を削除しました');
});
```

複雑なアサーションにはクロージャを使います。

```php
it('正しいデータでイベントをディスパッチする', function () {
    Livewire::test('post.show')
        ->call('delete', postId: 3)
        ->assertDispatched('notify', function ($event, $params) {
            return ($params['message'] ?? '') === '投稿を削除しました';
        });
});
```

### JavaScriptの評価をテストする

`$this->js()`でコンポーネントがJavaScriptを評価したことをアサートします。

```php
it('保存後にアラートを表示する', function () {
    Livewire::test('post.create')
        ->set('title', '新しい投稿')
        ->call('save')
        ->assertJs("alert('投稿を保存しました！')");
});
```

JavaScriptが評価されなかったこともアサートできます。

```php
->assertNoJs();
```

## PHPUnitを使う

Pestを推奨していますが、もちろんPHPUnitでLivewireコンポーネントをテストすることもできます。同じテストユーティリティをすべて、PHPUnitの構文で使えます。

比較のため、PHPUnitの例を見てみましょう。

```php
<?php

namespace Tests\Feature\Livewire;

use Livewire\Livewire;
use App\Models\Post;
use Tests\TestCase;

class CreatePostTest extends TestCase
{
    public function test_can_create_post()
    {
        $this->assertEquals(0, Post::count());

        Livewire::test('post.create')
            ->set('title', '新しい投稿')
            ->set('content', '投稿の本文')
            ->call('save');

        $this->assertEquals(1, Post::count());
    }

    public function test_title_is_required()
    {
        Livewire::test('post.create')
            ->set('title', '')
            ->call('save')
            ->assertHasErrors('title');
    }
}
```

このページで説明したすべての機能はPHPUnitでも同じように動作します。Pestのexpectationではなく、PHPUnitのアサーション構文を使ってください。

> [!tip] Pestを試してみる
> Pestのより洗練された構文と機能を試したい場合は、[pestphp.com](https://pestphp.com/)で詳しく学んでください。

## 利用できるすべてのテストメソッド

以下は、利用できるLivewireテストメソッドすべての総合リファレンスです。

### セットアップメソッド

| メソッド | 説明 |
|---|---|
| `Livewire::test('post.create')` | `post.create`コンポーネントをテスト |
| `Livewire::test(UpdatePost::class, ['post' => $post])` | `mount()`に渡すパラメータ付きで`UpdatePost`コンポーネントをテスト |
| `Livewire::actingAs($user)` | テストで認証済みユーザーを設定 |
| `Livewire::withQueryParams(['search' => '...'])` | URLクエリパラメータを設定（例: `?search=...`） |
| `Livewire::withCookie('name', 'value')` | テスト用のCookieを設定 |
| `Livewire::withCookies(['color' => 'blue', 'name' => 'Taylor'])` | 複数のCookieを設定 |
| `Livewire::withHeaders(['X-Header' => 'value'])` | カスタムヘッダーを設定 |
| `Livewire::withoutLazyLoading()` | このテストのすべてのコンポーネントでLazy読み込みを無効化 |

### コンポーネントを操作する

| メソッド | 説明 |
|---|---|
| `set('title', '...')` | `title`プロパティに指定した値を設定 |
| `set(['title' => '...', 'content' => '...'])` | 配列を使って複数のプロパティを設定 |
| `toggle('sortAsc')` | ブールプロパティを`true`と`false`の間で切り替え |
| `call('save')` | `save`アクション/メソッドを呼び出す |
| `call('remove', $postId)` | パラメータ付きでメソッドを呼び出す |
| `refresh()` | コンポーネントの再レンダリングを発生させる |
| `dispatch('post-created')` | コンポーネントからイベントをディスパッチ |
| `dispatch('post-created', postId: $post->id)` | パラメータ付きでイベントをディスパッチ |

### アサーション

| メソッド | 説明 |
|---|---|
| `assertSet('title', '...')` | プロパティが指定した値と等しいことを確認 |
| `assertNotSet('title', '...')` | プロパティが指定した値と等しくないことを確認 |
| `assertCount('posts', 3)` | プロパティに3個の項目が含まれることを確認 |
| `assertSee('...')` | 描画されたHTMLに指定したテキストが含まれることを確認 |
| `assertDontSee('...')` | 描画されたHTMLに指定したテキストが含まれないことを確認 |
| `assertSeeHtml('<div>...</div>')` | 生のHTMLが描画結果に存在することを確認 |
| `assertDontSeeHtml('<div>...</div>')` | 生のHTMLが描画結果に存在しないことを確認 |
| `assertSeeInOrder(['first', 'second'])` | 描画結果に文字列が順番どおりに現れることを確認 |
| `assertDispatched('post-created')` | イベントがディスパッチされたことを確認 |
| `assertNotDispatched('post-created')` | イベントがディスパッチされなかったことを確認 |
| `assertHasErrors('title')` | プロパティのバリデーションに失敗したことを確認 |
| `assertHasErrors(['title' => ['required', 'min:6']])` | 指定したバリデーションルールに失敗したことを確認 |
| `assertHasNoErrors('title')` | プロパティにバリデーションエラーがないことを確認 |
| `assertRedirect()` | リダイレクトが発生したことを確認 |
| `assertRedirect('/posts')` | 指定したURLへリダイレクトすることを確認 |
| `assertRedirectToRoute('posts.index')` | 名前付きルートへリダイレクトすることを確認 |
| `assertNoRedirect()` | リダイレクトが発生しなかったことを確認 |
| `assertViewHas('posts')` | データがビューへ渡されたことを確認 |
| `assertViewHas('postCount', 3)` | ビューデータが指定した値を持つことを確認 |
| `assertViewHas('posts', function ($posts) { ... })` | ビューデータがカスタムバリデーションを通過することを確認 |
| `assertViewIs('livewire.show-posts')` | 指定したビューが描画されたことを確認 |
| `assertJs("alert('...')")` | JavaScript式が評価されたことを確認 |
| `assertNoJs()` | JavaScriptが評価されなかったことを確認 |
| `assertFileDownloaded()` | ファイルダウンロードが発生したことを確認 |
| `assertFileDownloaded($filename)` | 指定したファイルがダウンロードされたことを確認 |
| `assertUnauthorized()` | 認可例外（401）が投げられたことを確認 |
| `assertForbidden()` | アクセスが禁止されたこと（403）を確認 |
| `assertStatus(500)` | 指定したステータスコードが返されたことを確認 |

## 関連項目

- **[アクション](/actions)** — コンポーネントのアクションとインタラクションをテストする
- **[フォーム](/forms)** — フォーム送信とバリデーションをテストする
- **[イベント](/events)** — イベントのディスパッチとリスニングをテストする
- **[コンポーネント](/components)** — テスト可能なコンポーネント構造を作る

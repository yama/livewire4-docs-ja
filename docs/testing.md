# テスト

Livewireコンポーネントは簡単にテストできます。内部ではLaravelクラスなので、Laravelの既存テストツールを利用できます。さらにLivewireはコンポーネントテスト用の便利なユーティリティを提供します。ここでは推奨されるPestを使いますが、PHPUnitも利用できます。

## Pestをインストールする

```shell
composer remove phpunit/phpunit
composer require pestphp/pest --dev --with-all-dependencies
./vendor/bin/pest --init
```

Pestの詳細は[Pestのインストールドキュメント](https://pestphp.com/docs/installation)を参照してください。

ビュー形式のコンポーネントにテストを置く場合は、`tests/Pest.php`で`resources/views`を対象に追加し、`phpunit.xml`にコンポーネント用テストスイートを追加します。

```php
pest()->extend(Tests\TestCase::class)
    ->in('Feature', '../resources/views');
```

```xml
<testsuite name="Components">
    <directory suffix=".test.php">resources/views</directory>
</testsuite>
```

## 最初のテストを作成する

`make:livewire`に`--test`を付けるとテストを生成できます。

```shell
php artisan make:livewire post.create --test
```

```php
use Livewire\Livewire;

it('正常に描画できる', function () {
    Livewire::test('post.create')
        ->assertStatus(200);
});
```

ページにコンポーネントが含まれることは、次のように確認できます。

```php
it('ページにコンポーネントがある', function () {
    $this->get('/posts/create')
        ->assertSeeLivewire('post.create');
});
```

## ブラウザテスト

Pest v4のPlaywright対応を使うと、実ブラウザーでコンポーネントをテストできます。

```shell
composer require pestphp/pest-plugin-browser --dev
npm install playwright@latest
npx playwright install
```

```php
it('新しい投稿を作成できる', function () {
    Livewire::visit('post.create')
        ->type('[wire\\:model="title"]', '最初の投稿')
        ->type('[wire\\:model="content"]', '本文です')
        ->press('保存')
        ->assertSee('投稿を作成しました');
});
```

## ビューをテストする

`assertSee()`で描画結果を、`assertViewHas()`でビューへ渡されたデータを確認します。

```php
Livewire::test('show-posts')
    ->assertSee('最初の投稿')
    ->assertViewHas('postCount', 3);
```

認証が必要な場合は`actingAs()`を使います。プロパティは`set()`と`assertSet()`で確認できます。

```php
Livewire::actingAs($user)
    ->test('post.create', ['post' => $post])
    ->set('title', '新しい投稿')
    ->assertSet('title', '新しい投稿');
```

URLパラメータとCookieは、それぞれ`withQueryParams()`、`withCookie()`、`withCookies()`で設定します。

## アクションを呼び出す

`call()`でアクションを実行します。

```php
Livewire::test('post.create')
    ->set('title', '新しい投稿')
    ->set('content', '本文')
    ->call('save')
    ->assertRedirect('/posts');
```

バリデーション、認可、イベント、JavaScript評価も確認できます。

```php
Livewire::test('post.create')
    ->set('title', '')
    ->call('save')
    ->assertHasErrors('title');

Livewire::test('post.create')
    ->call('save')
    ->assertDispatched('post-created')
    ->assertJs("alert('Post saved!')");
```

利用できる主なメソッドは次のとおりです。

| メソッド | 用途 |
| --- | --- |
| `Livewire::test()` | コンポーネントをテストする |
| `Livewire::actingAs()` | 認証ユーザーを設定する |
| `Livewire::withQueryParams()` | URLクエリを設定する |
| `set()` | プロパティを設定する |
| `toggle()` | 真偽値を切り替える |
| `call()` | アクションを呼び出す |
| `refresh()` | 再描画する |
| `dispatch()` | イベントを送る |
| `assertSet()` | プロパティ値を確認する |
| `assertSee()` / `assertDontSee()` | 描画テキストを確認する |
| `assertHasErrors()` | バリデーションエラーを確認する |
| `assertRedirect()` | リダイレクトを確認する |
| `assertViewHas()` | ビューデータを確認する |
| `assertDispatched()` | イベントを確認する |

## PHPUnitを使う

Pestを推奨しますが、PHPUnitでも同じLivewireテストユーティリティを利用できます。Pestの`expect()`をPHPUnitのアサーションへ置き換えてください。

```php
public function test_can_create_post()
{
    $this->assertEquals(0, Post::count());

    Livewire::test('post.create')
        ->set('title', '新しい投稿')
        ->set('content', '本文')
        ->call('save');

    $this->assertEquals(1, Post::count());
}
```

## 関連項目

- **[コンポーネント](/components)** — テストしやすいコンポーネント構造を作る
- **[アクション](/actions)** — アクションをテストする
- **[イベント](/events)** — ディスパッチされたイベントをテストする

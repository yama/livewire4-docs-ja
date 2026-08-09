# クイックスタート

Livewireを使うと、JavaScriptを必要とせず、PHPだけで動的でリアクティブなインターフェースを構築できます。JavaScriptフレームワークでフロントエンドコードを書く代わりに、シンプルなPHPクラスとBladeテンプレートを記述すると、Livewireが複雑なJavaScriptをすべて裏側で処理します。

ここでは、リアルタイムバリデーション付きのシンプルな投稿作成フォームを作ります。JavaScriptを1行も書いたり、AJAXリクエストを手動で処理したりすることなく、入力をバリデーションし、ページを動的に更新する方法を確認できます。

## 前提条件

始める前に、次のソフトウェアがインストールされていることを確認してください。

- Laravel 10以降
- PHP 8.1以降

## Livewireをインストールする

Laravelアプリケーションのルートディレクトリで、次の[Composer](https://getcomposer.org/)コマンドを実行します。

```shell
composer require livewire/livewire
```

## レイアウトを作成する

コンポーネントを作成する前に、Livewireコンポーネントを描画するレイアウトファイルを設定します。デフォルトでは、Livewireは`resources/views/layouts/app.blade.php`にあるレイアウトを探します。

次のコマンドでこのファイルを作成できます。

```shell
php artisan livewire:layout
```

これにより、次の内容を持つ`resources/views/layouts/app.blade.php`が生成されます。

```blade
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>{{ $title ?? config('app.name') }}</title>

        @vite(['resources/css/app.css', 'resources/js/app.js'])

        @livewireStyles
    </head>
    <body>
        {{ $slot }}

        @livewireScripts
    </body>
</html>
```

`@livewireStyles`と`@livewireScripts`ディレクティブは、Livewireの動作に必要なJavaScriptとCSSのアセットを読み込みます。コンポーネントは`{{ $slot }}`変数の位置に描画されます。

## Livewireコンポーネントを作成する

Livewireには、新しいコンポーネントを生成する便利なArtisanコマンドがあります。次のコマンドを実行して、ページコンポーネントを作成します。

```shell
php artisan make:livewire pages::post.create
```

このコンポーネントはフルページとして使うため、`pages::`プレフィックスを付けてpagesディレクトリに整理します。

このコマンドは、`resources/views/pages/post/⚡create.blade.php`に新しいシングルファイルコンポーネントを生成します。

> [!info] ⚡絵文字は何のため？
> 稲妻の絵文字によって、エディター上でLivewireコンポーネントをすぐに見分けられます。完全に任意のものであり、好みに応じて設定で無効にできます。詳しくは[コンポーネントのドキュメント](/components#コンポーネントを作成する)を参照してください。

## コンポーネントを記述する

`resources/views/pages/post/⚡create.blade.php`を開き、内容を次のように置き換えます。

```blade
<?php

use Livewire\Component;

new class extends Component {
    public string $title = '';

    public string $content = '';

    public function save()
    {
        $this->validate([
            'title' => 'required|max:255',
            'content' => 'required',
        ]);

        dd($this->title, $this->content);
    }
};
?>
<form wire:submit="save">
    <label>
        タイトル
        <input type="text" wire:model="title">
        @error('title') <span style="color: red;">{{ $message }}</span> @enderror
    </label>

    <label>
        本文
        <textarea wire:model="content" rows="5"></textarea>
        @error('content') <span style="color: red;">{{ $message }}</span> @enderror
    </label>

    <button type="submit">投稿を保存</button>
</form>
```

> [!info] スタイルは気にしなくて大丈夫です
> このフォームには意図的にスタイルを設定していません。Livewireの機能に集中するためです。実際のアプリケーションでは、CSSを追加するかTailwindのようなフレームワークを使うでしょう。

上のコードで行っていることを説明します。

**コンポーネントのプロパティ:**
- `public string $title = '';` — 投稿タイトル用のpublicプロパティを宣言します。
- `public string $content = '';` — 投稿本文用のpublicプロパティを宣言します。

**コンポーネントのメソッド:**
- `public function save()` — フォーム送信時に呼び出されます。データをバリデーションし、テスト用に出力します。

**Livewireディレクティブ:**
- `wire:submit="save"` — フォーム送信時に`save()`メソッドを呼び出し、通常のページ再読み込みを防ぎます。
- `wire:model="title"` — 入力欄と`$title`プロパティを双方向にデータバインディングします。入力すると、プロパティが自動的に更新されます。
- `wire:model="content"` — textareaと`$content`プロパティにも同じ双方向バインディングを設定します。
- `@error('title')`と`@error('content')` — バリデーションに失敗したときにエラーメッセージを表示します。

> [!warning] Livewireコンポーネントには単一のルート要素が必須です
> コンポーネントには、ルートとなるHTML要素が正確に1つ必要です。この例では`<form>`要素が単一のルートです。ルートの外側に複数のルート要素やHTMLコメントがあるとエラーになります。フルページコンポーネントでは、[フルページコンポーネント](/pages)のレイアウト用名前付きスロットをルート要素の外側に配置できます。

> [!tip] 実際のアプリケーションでは
> `save()`メソッドではテスト用に`dd()`を使って値を出力しています。本番アプリケーションでは、通常はデータベースに保存してリダイレクトします。
> ```php
> public function save()
> {
>     $validated = $this->validate([
>         'title' => 'required|max:255',
>         'content' => 'required',
>     ]);
>
>     Post::create($validated); // Postモデルとデータベーステーブルがあることを前提とします
>
>     return $this->redirect('/posts');
> }
> ```

## ルートを登録する

Laravelアプリケーションの`routes/web.php`を開き、次を追加します。

```php
Route::livewire('/post/create', 'pages::post.create');
```

これで`/post/create`にアクセスすると、Livewireはレイアウトファイル内に`pages::post.create`コンポーネントを描画します。

## 動作を確認する

準備が整ったので、コンポーネントを試してみましょう。

まだ起動していない場合は、Laravelの開発サーバーを起動します。

```shell
php artisan serve
```

ブラウザーで`http://localhost:8000/post/create`にアクセスします（Valet、Herd、または同様のツールを使っている場合は`http://yourapp.test/post/create`）。

2つの入力欄と送信ボタンを持つシンプルなフォームが表示されます。

**次の操作を試してください。**
1. **バリデーションを試す:** 入力欄を空のまま「投稿を保存」をクリックします。ページを再読み込みしなくても、各入力欄の下に赤いエラーメッセージがすぐに表示されます。
2. **送信を試す:** 両方の入力欄に入力して「投稿を保存」をクリックします。入力した値を表示するデバッグ画面が表示されます。

これは、JavaScriptに触れることなく、すべてPHPでリアクティブなデータバインディング、リアルタイムバリデーション、フォーム処理を実現するという、Livewireの中核的な力を示しています。

## トラブルシューティング

**コンポーネントが見つからないエラー:**
- コンポーネントファイルが`resources/views/pages/post/⚡create.blade.php`に存在することを確認してください。
- ルート内のコンポーネント名が`'pages::post.create'`と一致していることを確認してください。

**フォームが送信されない、またはバリデーションが表示されない:**
- レイアウトの`<head>`内に`@livewireStyles`があり、`</body>`の前に`@livewireScripts`があることを確認してください。
- ブラウザーのコンソールでJavaScriptエラーを確認してください。

**ルートにアクセスすると404エラーになる:**
- `routes/web.php`にルートを追加したことを確認してください。

## 次のステップ

最初のLivewireコンポーネントを作成できたので、次は次の主要な概念を学んでみましょう。
- **[コンポーネント](/components)** — シングルファイルとマルチファイルのコンポーネント、データの受け渡しなどを学びます。
- **[プロパティ](/properties)** — コンポーネントのプロパティとライフサイクルを理解します。
- **[アクション](/actions)** — メソッド、パラメータ、イベント処理を詳しく学びます。
- **[フォーム](/forms)** — リアルタイムバリデーションを含むLivewireの強力なフォーム機能を確認します。
- **[バリデーション](/validation)** — Livewireのバリデーション機能を習得します。

Livewireの機能のほんの一部を紹介したにすぎません。引き続きドキュメントを読んで、Livewireのすべての機能を確認してください。

# インストール

LivewireはLaravelパッケージのため、インストールして使い始める前に、Laravelアプリケーションが起動できる状態になっている必要があります。Laravelアプリケーションの新規作成については、[Laravel公式ドキュメント](https://laravel.com/docs/installation)を参照してください。

## 前提条件

Livewireをインストールする前に、次を確認してください。

- Laravel 10以降
- PHP 8.1以降

## Livewireをインストールする

ターミナルを開いてLaravelアプリケーションのディレクトリへ移動し、次のコマンドを実行します。

```shell
composer require livewire/livewire
```

これだけで完了です。LivewireはLaravelのパッケージ自動検出を利用するため、追加の設定は必要ありません。

**最初のコンポーネントを作成する準備はできましたか？** [クイックスタートガイド](/quickstart)で、数分で最初のLivewireコンポーネントを作成してみましょう。

## レイアウトファイルを作成する

Livewireコンポーネントをフルページとして使う場合は、レイアウトファイルが必要です。Livewireのコマンドで生成できます。

```shell
php artisan livewire:layout
```

このコマンドは、次の内容を持つ`resources/views/layouts/app.blade.php`を作成します。

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

`@livewireStyles`と`@livewireScripts`ディレクティブは、Livewireの動作に必要なJavaScriptとCSSのアセットを読み込みます。LivewireはJavaScriptにAlpine.jsを同梱しているため、両方が一緒に読み込まれます。

> [!info] アセットの注入は自動です
> これらのディレクティブがなくても、LivewireはLivewireコンポーネントを含むページへアセットを自動的に注入します。ただし、ディレクティブを含めるとアセットの配置場所を明示的に制御できるため、パフォーマンス最適化や他のパッケージとの互換性に役立つ場合があります。

## 設定ファイルを公開する

Livewireは「ゼロコンフィグ」です。つまり、追加設定なしで規約に従って使えます。ただし、必要に応じてLivewireの設定ファイルを公開してカスタマイズできます。

```shell
php artisan livewire:config
```

このコマンドは、Laravelアプリケーションの`config`ディレクトリに`livewire.php`を作成します。そこからLivewireの各種設定をカスタマイズできます。

---

# 高度な設定

以下では、多くのアプリケーションでは必要にならない高度なケースを説明します。具体的な要件がある場合にだけ設定してください。

## LivewireとAlpineを手動でバンドルする

**この設定が必要になる場合:** Alpine.jsプラグインを使いたい場合や、AlpineとLivewireの初期化タイミングを細かく制御したい場合です。

デフォルトでは、LivewireがJavaScriptに同梱されたAlpine.jsを自動的に読み込みます。Alpineプラグインを登録したり、初期化順序をカスタマイズしたりする必要がある場合は、JavaScriptのビルドツールでLivewireとAlpineを手動でバンドルできます。

まず、レイアウトファイルに`@livewireScriptConfig`ディレクティブを追加します。

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

        @livewireScriptConfig
    </body>
</html>
```

`@livewireScriptConfig`ディレクティブは、Livewireに必要な設定とランタイムのグローバル変数を注入します。ただし、LivewireとAlpineのJavaScript自体は注入しません。これらは自分でバンドルするためです。手動バンドル時は`@livewireScripts`を`@livewireScriptConfig`に置き換えてください。

次に、`resources/js/app.js`でLivewireとAlpineをインポートして起動します。

```js
import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';
import Clipboard from '@ryangjchandler/alpine-clipboard'

Alpine.plugin(Clipboard)

Livewire.start()
```

> [!tip] Livewire更新後はアセットを再ビルドする
> 手動バンドルを使う場合、ComposerでLivewireを更新するたびにJavaScriptアセットを再ビルドしてください（`npm run build`）。

## Livewireの更新エンドポイントをカスタマイズする

**この設定が必要になる場合:** アプリケーションでローカライズ用（`/en/`、`/fr/`など）やマルチテナント用（`/tenant-1/`、`/tenant-2/`など）のルートプレフィックスを使っている場合です。

デフォルトでは、Livewireは`/livewire-{hash}/update`のようなハッシュベースのエンドポイントへコンポーネントの更新を送信します。`{hash}`はアプリケーションの`APP_KEY`から生成されます。独自のルートをサービスプロバイダー（通常は`App\Providers\AppServiceProvider`）に登録して、これをカスタマイズできます。

```php
use Livewire\Livewire;

class AppServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Livewire::setUpdateRoute(function ($handle, $path) {
            return Route::post('/custom' . $path, $handle);
        });
    }
}
```

`$path`パラメータにはハッシュベースのパス（例：`/livewire-{hash}/update`）が含まれ、インストールごとに固有のエンドポイントが維持されます。

更新ルートにミドルウェアを追加することもできます。

```php
Livewire::setUpdateRoute(function ($handle, $path) {
    return Route::post('/custom' . $path, $handle)
        ->middleware(['web', 'auth']);
});
```

## LivewireのJavaScriptアセットURLをカスタマイズする

**この設定が必要になる場合:** ローカライズやマルチテナント用のルートプレフィックスを使っており、LivewireがJavaScriptを配信する場所もルーティング構造に合わせる必要がある場合です。

デフォルトでは、Livewireは`/livewire-{hash}/livewire.js`のようなハッシュベースのエンドポイントからJavaScriptを配信します。`{hash}`はアプリケーションの`APP_KEY`から生成されます。このインストール固有のパスにより、自動スキャナーからLivewireアプリケーションを標的にされにくくなります。

```php
use Livewire\Livewire;

class AppServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Livewire::setScriptRoute(function ($handle, $path) {
            return Route::get('/custom' . $path, $handle);
        });
    }
}
```

`$path`パラメータにはハッシュベースのパス（例：`/livewire-{hash}/livewire.js`）が含まれ、インストールごとに固有のエンドポイントが維持されます。

## Livewireのアセットをpublicディレクトリへ公開する

**この設定が必要になる場合:** Laravelのルーティングではなく、WebサーバーからLivewireのJavaScriptを直接配信したい場合（CDN配信や特定のキャッシュ戦略など）です。

次のコマンドでLivewireのJavaScriptアセットを`public`ディレクトリへ公開できます。

```bash
php artisan livewire:publish --assets
```

Livewireの更新時にアセットを最新に保つには、次を`composer.json`に追加します。

```json
{
    "scripts": {
        "post-update-cmd": [
            "@php artisan vendor:publish --tag=livewire:assets --ansi --force"
        ]
    }
}
```

> [!warning] 多くのアプリケーションでは不要です
> アセットの公開が必要になることはほとんどありません。Laravelがアセットを動的に配信できない、特定のアーキテクチャ上の要件がある場合にだけ行ってください。

## 自動アセット注入を無効にする

**この設定が必要になる場合:** Livewireのアセットをいつ、どのように読み込むかを完全に制御したい場合です。

`config/livewire.php`の`inject_assets`設定を更新します。

```php
'inject_assets' => false,
```

無効にすると、レイアウトに`@livewireStyles`と`@livewireScripts`を手動で含める必要があります。含めないとLivewireは動作しません。

特定のページでアセット注入を強制することもできます。

```php
\Livewire\Livewire::forceAssetInjection();
```

アセットを確実に注入したいルートやコントローラーで呼び出してください。

---

# トラブルシューティング

## LivewireのJavaScriptが読み込まれない（404エラー）

**症状:** LivewireのJavaScriptファイルが404を返す、またはLivewireの機能が動作しません。

Livewireは`/livewire-{hash}/livewire.js`のようなハッシュベースのエンドポイントからJavaScriptを配信します。`{hash}`はアプリケーションの`APP_KEY`から生成され、この固有パスはインストールごとに異なります。

**よくある原因:**

**Nginxの設定がルートをブロックしている:**
Nginxでカスタム設定を使っている場合、Laravelの動的なLivewireルートがブロックされている可能性があります。次のいずれかを行ってください。

- `/livewire-*/`に一致するリクエストをLaravelへ渡すようNginxを設定する。

    ```nginx
    location ~ ^/livewire-[a-f0-9]+/ {
        try_files $uri $uri/ /index.php?$query_string;
    }
    ```

- [LivewireとAlpineを手動でバンドルする](#livewireとalpineを手動でバンドルする)ことで、Laravel経由での配信を避ける。
- [Livewireのアセットを公開する](#livewireのアセットをpublicディレクトリへ公開する)ことで、Webサーバーから直接配信する。

**ルートキャッシュ:**
`php artisan route:cache`を実行済みの場合、LaravelがLivewireのルートを認識できないことがあります。キャッシュを削除してください。

```shell
php artisan route:clear
```

**`@livewireScripts`がない:**
自動アセット注入を無効にしている場合は、レイアウトの`</body>`直前に`@livewireScripts`があることを確認してください。

## LivewireコンポーネントのないページでAlpine.jsが使えない

**症状:** LivewireコンポーネントのないページでAlpine.jsを使いたい。

**解決策:** AlpineはLivewireに同梱されているため、Livewireコンポーネントのないページでも`@livewireScripts`を含める必要があります。

```blade
<!DOCTYPE html>
<html>
    <head>
        @livewireStyles
    </head>
    <body>
        <!-- Livewireコンポーネントはないが、Alpineを使いたい -->
        <div x-data="{ open: false }">
            <button @click="open = !open">切り替え</button>
        </div>

        @livewireScripts
    </body>
</html>
```

別の方法として、[LivewireとAlpineを手動でバンドルする](#livewireとalpineを手動でバンドルする)こともできます。その場合はJavaScriptからAlpineをインポートします。

## コンポーネントが更新されない、またはブラウザーのコンソールにエラーが出る

次を確認してください。

- レイアウトの`<head>`内に`@livewireStyles`がある
- レイアウトの`</body>`前に`@livewireScripts`がある
- ブラウザーの開発者コンソールでJavaScriptエラーを確認する
- サポート対象のPHP（8.1以降）とLaravel（10以降）を使っている
- アプリケーションキャッシュを削除する：`php artisan cache:clear`

問題が解決しない場合は、より詳細なデバッグ手順について[トラブルシューティングドキュメント](https://livewire.laravel.com/docs/4.x/troubleshooting)を参照してください。

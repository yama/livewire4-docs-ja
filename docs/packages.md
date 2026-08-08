LaravelパッケージにLivewireコンポーネントを含めるには、パッケージのサービスプロバイダーへ登録します。

## シングルファイル・マルチファイルコンポーネント

SFCとMFCでは、サービスプロバイダーの`boot()`メソッドで`addNamespace`を使います。

```php
use Livewire\Livewire;

public function boot(): void
{
    Livewire::addNamespace(
        namespace: 'mypackage',
        viewPath: __DIR__ . '/../resources/views/livewire',
    );
}
```

パッケージの`resources/views/livewire`以下にあるすべてのSFC・MFCを`mypackage`名前空間へ登録します。

**使用例：**

```blade
<livewire:mypackage::counter />
<livewire:mypackage::users.table />
```

## クラスベースコンポーネント

クラスベースのコンポーネントでは、追加のパラメータを指定してビューをLaravelに登録します。

```php
use Livewire\Livewire;

public function boot(): void
{
    Livewire::addNamespace(
        namespace: 'mypackage',
        classNamespace: 'MyVendor\\MyPackage\\Livewire',
        classPath: __DIR__ . '/Livewire',
        classViewPath: __DIR__ . '/../resources/views/livewire',
    );

    $this->loadViewsFrom(__DIR__ . '/../resources/views', 'my-package');
}
```

コンポーネントの`render()`メソッドではLaravelのパッケージ名前空間構文を使います。

```php
public function render()
{
    return view('my-package::livewire.counter');
}
```

**使用例：**
```blade
<livewire:mypackage::counter />
```

## ファイル名

Livewireコンポーネントのファイル名に使う⚡絵文字プレフィックスは、パッケージ公開時にComposerで問題になることがあります。パッケージ開発ではファイル名に絵文字を使わず、`⚡counter.blade.php`ではなく`counter.blade.php`にしてください。

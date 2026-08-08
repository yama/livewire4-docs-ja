Livewireコンポーネントはリクエスト間でJSONへdehydrate（シリアライズ）され、PHPコンポーネントへhydrate（復元）されます。そのためプロパティはJSON化可能である必要があります。

プリミティブ値はJSON化できますが、モデル、コレクション、Carbon、Stringableなどの型には、より堅牢な仕組みが必要です。Livewireは「Synthesizers」という拡張ポイントを提供し、任意のカスタムプロパティ型をサポートできます。

> [!tip] まずhydrationを理解する
> Synthesizersを使う前に、Livewireのhydrationシステムを理解してください。[hydrationのドキュメント](/hydration)で学べます。

## Synthesizersを理解する

カスタムSynthesizerを作る前に、Laravelの[Stringable](https://laravel.com/docs/strings)をサポートする内部Synthesizerを見てみましょう。

```php
class CreatePost extends Component
{
    public $title = '';
}
```

通常、状態は次のJSONになります。

```js
state: { title: '' },
```

`$title`が文字列ではなくStringableなら、状態にはメタデータタプルが含まれます。

```php
class CreatePost extends Component
{
    public $title = '';
    public function mount()
    {
        $this->title = str($this->title);
    }
}
```

```js
state: { title: ['', { s: 'str' }] },
```

この[メタデータタプル](/hydration#深くネストしたタプル)により、次のリクエストで`$title`をStringableへ復元できます。

```php
use Illuminate\Support\Stringable;
class StringableSynth extends Synth
{
    public static $key = 'str';
    public static function match($target)
    {
        return $target instanceof Stringable;
    }
    public function dehydrate($target)
    {
        return [$target->__toString(), []];
    }
    public function hydrate($value)
    {
        return str($value);
    }
}
```

`$key`はタプルの`{ s: 'str' }`とSynthesizerを対応付けます。`match()`は対象値を扱えるか判定し、`dehydrate()`はPHP値をJSON化可能なタプルへ変換します。次のリクエストで`hydrate()`が生のJSON値をPHP値へ戻します。

まず`$key`プロパティを見てみましょう。

```php
public static $key = 'str';
```

すべてのSynthesizerには、`['', { s: 'str' }]`のような[メタデータタプル](/hydration#深くネストしたタプル)をStringableへ戻すためにLivewireが使うstaticな`$key`プロパティが必要です。各メタデータタプルには、このキーを参照する`s`キーがあります。

反対に、Livewireがプロパティをdehydrateするときは、Synthesizerのstaticな`match()`関数を使って、現在のプロパティ（`$target`）をこのSynthesizerでdehydrateできるか判定します。

```php
public static function match($target)
{
    return $target instanceof Stringable;
}
```

`match()`がtrueを返すと、`dehydrate()`メソッドがプロパティのPHP値を入力として受け取り、JSON化可能な[メタデータ](/hydration#深くネストしたタプル)タプルを返します。

```php
public function dehydrate($target)
{
    return [$target->__toString(), []];
}
```

次のリクエストの開始時には、タプルの`{ s: 'str' }`キーによってこのSynthesizerが選択され、`hydrate()`メソッドが呼び出されます。メソッドにはプロパティの生のJSON表現が渡され、プロパティに代入する完全なPHP互換値を返すことが期待されます。

```php
public function hydrate($value)
{
    return str($value);
}
```

## カスタムSynthesizerを登録する

`Address`型をサポートする例です。

```php
class UpdateProperty extends Component
{
    public Address $address;
    public function mount()
    {
        $this->address = new Address();
    }
}
```

```php
namespace App\Dtos\Address;
class Address
{
    public $street = '';
    public $city = '';
    public $state = '';
    public $zip = '';
}
```

```php
use App\Dtos\Address;
class AddressSynth extends Synth
{
    public static $key = 'address';
    public static function match($target)
    {
        return $target instanceof Address;
    }
    public function dehydrate($target)
    {
        return [[
            'street' => $target->street,
            'city' => $target->city,
            'state' => $target->state,
            'zip' => $target->zip,
        ], []];
    }
    public function hydrate($value)
    {
        $instance = new Address;
        $instance->street = $value['street'];
        $instance->city = $value['city'];
        $instance->state = $value['state'];
        $instance->zip = $value['zip'];
        return $instance;
    }
}
```

アプリケーション全体で使うには、サービスプロバイダーの`boot()`から`propertySynthesizer`で登録します。

```php
class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Livewire::propertySynthesizer(AddressSynth::class);
    }
}
```

## データバインディングをサポートする

`Address`のプロパティへ`wire:model`で直接バインドしたい場合は、`get()`と`set()`を実装します。

```php
use App\Dtos\Address;
class AddressSynth extends Synth
{
    public static $key = 'address';
    public static function match($target)
    {
        return $target instanceof Address;
    }
    public function dehydrate($target)
    {
        return [[
            'street' => $target->street,
            'city' => $target->city,
            'state' => $target->state,
            'zip' => $target->zip,
        ], []];
    }
    public function hydrate($value)
    {
        $instance = new Address;
        $instance->street = $value['street'];
        $instance->city = $value['city'];
        $instance->state = $value['state'];
        $instance->zip = $value['zip'];
        return $instance;
    }
    public function get(&$target, $key) // [tl! highlight:8]
    {
        return $target->{$key};
    }
    public function set(&$target, $key, $value)
    {
        $target->{$key} = $value;
    }
}
```

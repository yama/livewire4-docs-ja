# フォーム

Livewireフォームは、PHPだけで入力、バリデーション、送信中の表示、リアルタイム保存を実装できます。

## フォームを送信する

```blade
<form wire:submit="save">
    <input wire:model="title" type="text">
    <button type="submit">保存</button>
</form>
```

```php
public function save()
{
    $validated = $this->validate([
        'title' => 'required|max:255',
    ]);
}
```

## バリデーションを追加する

`#[Validate]` Attribute、`$rules`、`rules()`、`validate()`を使えます。

```php
use Livewire\Attributes\Validate;

#[Validate('required|min:3')]
public $title = '';
```

エラーは`@error`で表示します。

```blade
@error('title') <span>{{ $message }}</span> @enderror
```

## Form Objectを使う

入力が多い場合は`Livewire\Form`を継承したForm Objectへ切り出せます。

```php
class PostForm extends Form
{
    public $title = '';
    public $content = '';

    public function save() {}
}
```

コンポーネントでは`public PostForm $form`として利用します。

## フィールドをリセット・取り出す

`reset()`でフォームを初期値へ戻し、`pull()`で値を取得してリセットできます。

```php
$this->reset('form.title');
$data = $this->form->pull();
```

## Rule Objectを使う

複雑なルールはLaravelのRule Objectを`rules()`または`validate()`へ渡します。

## ローディング表示

```blade
<button wire:loading.attr="disabled">保存</button>
<span wire:loading>保存中...</span>
```

## ライブ更新とリアルタイムバリデーション

`wire:model.live`で入力中に更新し、`.blur`や`.debounce`などの修飾子でタイミングを調整できます。

```blade
<input wire:model.live.debounce.300ms="search">
<input wire:model.blur="email">
```

保存時には`wire:dirty`で未保存状態を表示できます。入力にはdebounce、またはthrottleを指定できます。

## Bladeコンポーネントへ入力を切り出す

入力欄を再利用するBladeコンポーネントでは、`wire:model`を属性として転送します。独自コントロールは`$attributes`や`wire:model`の値を適切に転送してください。

## 関連項目

- **[バリデーション](https://livewire.laravel.com/docs/4.x/validation)** — ルールとエラーメッセージ
- **[ローディング状態](https://livewire.laravel.com/docs/4.x/loading-states)** — 送信中のUI
- **[アクション](/actions)** — フォーム送信処理

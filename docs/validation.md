Livewireは、コンポーネント内でプロパティをバリデーションするための便利な機能を提供します。Laravelのバリデーション機能を基盤としているため、Laravelで利用できるルールをそのまま使えます。

## `#[Validate]` 属性を使う

最も簡単な方法は、プロパティへ `#[Validate]` 属性を付けることです。

```php
use Livewire\Attributes\Validate;
use Livewire\Component;

class CreatePost extends Component
{
    #[Validate('required|min:3')]
    public $title = '';

    #[Validate('required|min:3')]
    public $content = '';

    public function save()
    {
        $validated = $this->validate();
        Post::create($validated);
        return redirect()->to('/posts');
    }
}
```

```blade
<form wire:submit="save">
    <input type="text" wire:model="title">
    <div>@error('title') {{ $message }} @enderror</div>
    <textarea wire:model="content"></textarea>
    <div>@error('content') {{ $message }} @enderror</div>
    <button type="submit">保存</button>
</form>
```

エラー表示の詳細は、[LaravelのBladeでバリデーションエラーを表示するドキュメント](https://laravel.com/docs/blade#validation-errors)も参照してください。

属性を付けたプロパティは、`$this->validate()` の実行時に指定ルールで検証されます。属性の構文には文字列や配列などの制限があり、Laravelの `Rule` オブジェクトのような実行時構文には対応しません。その場合は `rules()` メソッドを使ってください。

> [!info] Validate属性はRuleオブジェクトに対応しない
> PHP Attributesには、単純な文字列や配列のような構文上の制限があります。LaravelのRuleオブジェクト（`Rule::exists(...)`）のような実行時構文を使いたい場合は、コンポーネントで[`rules()` メソッドを定義](#rules-メソッドを定義する)してください。
>
> 詳しくは[LivewireでLaravelのRuleオブジェクトを使う方法](#laravelのruleオブジェクトを使う)を参照してください。

自動バリデーションを無効にして手動で検証するには `onUpdate: false` を指定します。

```php
#[Validate('required|min:3', onUpdate: false)]
public $title = '';
```

### 属性名をカスタマイズする

バリデーションメッセージへ挿入される属性名は `as:` で変更できます。

```php
use Livewire\Attributes\Validate;

#[Validate('required', as: '生年月日')]
public $dob;
```

失敗時、Laravelは `dob` の代わりに「生年月日」をメッセージへ使います。

### バリデーションメッセージをカスタマイズする

`message:` でLaravelのメッセージを独自メッセージへ置き換えられます。異なるルールには複数の属性を指定します。

```php
#[Validate('required', message: '投稿タイトルを入力してください')]
public $title;
```

```php
#[Validate('required', message: '投稿タイトルを入力してください')]
#[Validate('min:3', message: 'タイトルが短すぎます')]
public $title;
```

### ローカライズを無効にする

デフォルトではルールメッセージと属性名は `trans()` でローカライズされます。`translate: false` で無効化できます。

```php
#[Validate('required', message: 'タイトルを入力してください', translate: false)]
public $title;
```

### カスタムキー

`#[Validate]` を直接プロパティへ適用すると、プロパティ名が検証キーになります。配列プロパティと子要素へ別のルールを指定する場合は、最初の引数にキーと値の配列を渡します。

```php
#[Validate([
    'todos' => 'required',
    'todos.*' => [
        'required',
        'min:3',
        new Uppercase,
    ],
])]
public $todos = [];
```

これで `$todos` の更新時、または `validate()` の呼び出し時に両方のルールが適用されます。

## フォームオブジェクト

プロパティとルールが増えたら、LivewireのForm Objectへ抽出できます。`PostForm` にプロパティと `#[Validate]` を定義し、コンポーネントで `public PostForm $form;` として使います。テンプレートでは `wire:model="form.title"` のように `form.` を付けます。`$this->form->all()` で値を取得し、`$this->form->validate()` で検証できます。

```php
namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use Livewire\Form;

class PostForm extends Form
{
    #[Validate('required|min:3')]
    public $title = '';

    #[Validate('required|min:3')]
    public $content = '';
}
```

```php
public PostForm $form;

public function save()
{
    Post::create($this->form->all());
    return redirect()->to('/posts');
}
```

```blade
<form wire:submit="save">
    <input type="text" wire:model="form.title">
    <div>@error('form.title') {{ $message }} @enderror</div>
    <textarea wire:model="form.content"></textarea>
    <div>@error('form.content') {{ $message }} @enderror</div>
    <button type="submit">保存</button>
</form>
```

`onUpdate: false` を指定した場合は、`$this->form->validate()` で手動検証します。

```php
public function save()
{
    Post::create($this->form->validate());
    return redirect()->to('/posts');
}
```

詳しくは[フォームオブジェクトのドキュメント](/forms#extracting-a-form-object)を参照してください。

## リアルタイムバリデーション

フォーム送信を待たず、入力中に検証することをリアルタイムバリデーションと呼びます。`#[Validate]` と `wire:model.live` または `wire:model.live.blur` を組み合わせます。

```blade
<form wire:submit="save">
    <input type="text" wire:model.live.blur="title">
</form>
```

`rules()` を使う場合でも、パラメータなしの `#[Validate]` を付ければ、更新時に `rules()` のルールを実行できます。

```php
#[Validate]
public $title = '';

protected function rules()
{
    return [
        'title' => 'required|min:5',
        'content' => 'required|min:5',
    ];
}
```

## エラーメッセージをカスタマイズする

`as:` で属性名、`message:` でメッセージを指定できます。異なるルールに異なるメッセージを設定するには `#[Validate]` を複数付けます。`translate: false` でLaravelのローカライズを無効化できます。

### カスタム属性名

たとえば `dob` が生年月日を表す場合、ユーザーには `dob` ではなく「生年月日」と表示したいでしょう。`as:` で代替名を指定できます。

```php
#[Validate('required', as: '生年月日')]
public $dob = '';
```

### カスタムメッセージ

`message:` で検証メッセージ全体を変更できます。複数ルールではルールごとに属性を分けます。

```php
#[Validate('required', message: '生年月日を入力してください。')]
public $dob = '';
```

```php
#[Validate('required', message: 'タイトルを入力してください。')]
#[Validate('min:5', message: 'タイトルが短すぎます。')]
public $title = '';
```

配列構文では、カスタム属性とメッセージも指定できます。

```php
#[Validate([
    'titles' => 'required',
    'titles.*' => 'required|min:5',
], message: [
    'required' => ':attribute がありません。',
    'titles.required' => ':attribute がありません。',
    'min' => ':attribute が短すぎます。',
], attribute: [
    'titles.*' => 'タイトル',
])]
public $titles = [];
```

```php
#[Validate('required', as: '生年月日')]
public $dob;

#[Validate('required', message: 'タイトルを入力してください')]
public $title;
```

配列構文ではキー、メッセージ、属性名をまとめて指定できます。

## `rules()` メソッドを定義する

PHP Attributesで対応できない実行時構文やRuleオブジェクトを使う場合は、`rules()` からフィールドとルールを返します。`messages()` と `validationAttributes()` も定義できます。

```php
use Illuminate\Validation\Rule;

protected function rules()
{
    return [
        'title' => Rule::exists('posts', 'title'),
        'content' => 'required|min:3',
    ];
}

protected function messages()
{
    return ['content.required' => ':attribute は必須です。'];
}

protected function validationAttributes()
{
    return ['content' => '本文'];
}
```

> [!warning] `rules()` はデータ更新時には検証しない
> `rules()` のルールは `$this->validate()` を実行したときだけ使われます。フィールド更新ごとに検証するには、パラメータなしの `#[Validate]` も付けてください。

> [!warning] Livewireの仕組みと名前を衝突させない
> カスタマイズする場合を除き、`rules`、`messages`、`validationAttributes`、`validationCustomValues` というプロパティやメソッドを持たせないでください。Livewireの仕組みと衝突します。

## LaravelのRuleオブジェクトを使う

Ruleオブジェクトを `rules()` と組み合わせると、高度なバリデーションを実現できます。

```php
<?php

namespace App\Livewire;

use Illuminate\Validation\Rule;
use App\Models\Post;
use Livewire\Form;

class UpdatePost extends Form
{
    public ?Post $post;
    public $title = '';
    public $content = '';

    protected function rules()
    {
        return [
            'title' => [
                'required',
                Rule::unique('posts')->ignore($this->post),
            ],
            'content' => 'required|min:5',
        ];
    }

    public function mount()
    {
        $this->title = $this->post->title;
        $this->content = $this->post->content;
    }

    public function update()
    {
        $this->validate();
        $this->post->update($this->all());
        $this->reset();
    }
}
```

## バリデーションエラーを手動で制御する

利用できるメソッドは次のとおりです。

Method | Description
--- | ---
`$this->addError([key], [message])` | エラーバッグへメッセージを手動追加する
`$this->resetValidation([?key])` | 指定キー、またはすべてのエラーをリセットする
`$this->getErrorBag()` | Livewireコンポーネントが使うLaravelのエラーバッグを取得する

> [!info] Form Objectで `$this->addError()` を使う
> Form Object内で追加したエラーのキーには、親コンポーネントでフォームを割り当てたプロパティ名が自動的に付加されます。`$data` に割り当てた場合、キーは `data.key` になります。

## Validatorインスタンスへアクセスする

`withValidator` にクロージャを渡すと、`validate()` が内部で使う完全に構築されたValidatorへアクセスできます。`after` などのメソッドで追加のエラーを設定できます。

```php
public function boot()
{
    $this->withValidator(function ($validator) {
        $validator->after(function ($validator) {
            if (str($this->title)->startsWith('"')) {
                $validator->errors()->add('title', 'タイトルは引用符で始められません');
            }
        });
    });
}
```

## 独自のバリデーターを使う

独自の検証システムを使う場合でも、コンポーネント内で投げられた `ValidationException` をLivewireが捕捉し、組み込みの `validate()` と同じようにビューへエラーを提供します。`Validator::make(...)->validate()` の結果を保存処理へ渡せます。

```php
use Illuminate\Support\Facades\Validator;
use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    public $title = '';
    public $content = '';

    public function save()
    {
        $validated = Validator::make(
            ['title' => $this->title, 'content' => $this->content],
            ['title' => 'required|min:3', 'content' => 'required|min:3'],
            ['required' => ':attribute フィールドは必須です'],
        )->validate();

        Post::create($validated);
        return redirect()->to('/posts');
    }
}
```

## バリデーションをテストする

`assertHasErrors()` でエラーの発生を検証できます。

```php
Livewire::test(CreatePost::class)
    ->set('content', 'Sample content...')
    ->call('save')
    ->assertHasErrors('title');
```

```php
public function test_cant_create_post_with_title_shorter_than_3_characters()
{
    Livewire::test(CreatePost::class)
        ->set('title', 'Sa')
        ->set('content', 'Sample content...')
        ->call('save')
        ->assertHasErrors(['title' => ['min:3']]);
}
```

```php
public function test_cant_create_post_without_title_and_content()
{
    Livewire::test(CreatePost::class)
        ->call('save')
        ->assertHasErrors(['title', 'content']);
}
```

ルールを絞り込むには `assertHasErrors(['title' => ['min:3']])`、複数プロパティには `assertHasErrors(['title', 'content'])` を使います。その他のテスト機能は[テストのドキュメント](/testing)を参照してください。

## JavaScriptでエラーへアクセスする

Livewireにはクライアント側から使える `$errors` マジックプロパティがあります。

```blade
<form wire:submit="save">
    <input type="email" wire:model="email">
    <div wire:show="$errors.has('email')">
        <span wire:text="$errors.first('email')"></span>
    </div>
    <button type="submit">保存</button>
</form>
```

### 利用できるメソッド

- `$errors.has('field')` - フィールドにエラーがあるか確認する
- `$errors.missing('field')` - フィールドにエラーがないか確認する
- `$errors.first('field')` - フィールドの最初のエラーメッセージを取得する
- `$errors.get('field')` - フィールドのすべてのエラーメッセージを取得する
- `$errors.all()` - すべてのフィールドの全エラーを取得する
- `$errors.clear()` - すべてのエラーを消去する
- `$errors.clear('field')` - 特定フィールドのエラーを消去する

Alpine.jsからは `$wire.$errors` を使います。

## 非推奨の `#[Rule]` 属性

Livewire v3の初期には、バリデーション属性に `Rule` という名称を使っていました。LaravelのRuleオブジェクトとの衝突を避けるため `Validate` に変更されています。v3では両方がサポートされますが、現在のコードでは `#[Rule]` を `#[Validate]` に変更することを推奨します。

## 関連項目

- **[フォーム](/forms)** — リアルタイムフィードバックで入力を検証する
- **[プロパティ](/properties)** — 保存前にプロパティ値を検証する
- **[Validate属性](/attribute-validate)** — プロパティのバリデーションに `#[Validate]` を使う
- **[アクション](/actions)** — アクションメソッドでデータを検証する

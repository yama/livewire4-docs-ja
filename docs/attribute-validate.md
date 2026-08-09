`#[Validate]`属性はコンポーネントのプロパティにバリデーションルールを関連付け、自動的なリアルタイムバリデーションと、わかりやすいルール宣言を可能にします。

## 基本的な使い方

バリデーションが必要なプロパティに`#[Validate]`を適用します。

```php
<?php // resources/views/components/post/⚡create.blade.php

use Livewire\Attributes\Validate;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Validate('required|min:3')] // [tl! highlight]
    public $title = '';

    #[Validate('required|min:3')] // [tl! highlight]
    public $content = '';

    public function save()
    {
        $this->validate();
        Post::create(['title' => $this->title, 'content' => $this->content]);
        return redirect('/posts');
    }
};
?>

<div>
    <input type="text" wire:model="title">
    @error('title') <span class="error">{{ $message }}</span> @enderror
    <textarea wire:model="content"></textarea>
    @error('content') <span class="error">{{ $message }}</span> @enderror
    <button wire:click="save">投稿を保存</button>
</div>
```

`#[Validate]`を使うと、更新のたびにLivewireがプロパティを自動検証し、すぐにフィードバックを表示します。

## 仕組み

プロパティに`#[Validate]`を追加すると、次のように動作します。

1. **自動バリデーション** — 更新のたびにプロパティを検証する
2. **リアルタイムフィードバック** — ユーザーがすぐにバリデーションエラーを確認できる
3. **手動バリデーション** — すべてのプロパティを検証するため保存前に`$this->validate()`を呼び出す

## リアルタイムバリデーション

デフォルトでは、`#[Validate]`は更新中のプロパティを検証します。

```php
<?php // resources/views/components/⚡registration.blade.php

use Livewire\Attributes\Validate;
use Livewire\Component;

new class extends Component {
    #[Validate('required|email|unique:users,email')]
    public $email = '';
    #[Validate('required|min:8')]
    public $password = '';
};
?>

<div>
    <input type="email" wire:model.live.blur="email">
    @error('email') <span>{{ $message }}</span> @enderror
    <input type="password" wire:model.live.blur="password">
    @error('password') <span>{{ $message }}</span> @enderror
</div>
```

ユーザーがフォームに入力すると、すぐにバリデーション結果が表示されます。

## 自動バリデーションを無効にする

`$this->validate()`を明示的に呼び出したときだけ検証するには、`onUpdate: false`を使います。

```php
<?php // resources/views/components/post/⚡create.blade.php

use Livewire\Attributes\Validate;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Validate('required|min:3', onUpdate: false)] // [tl! highlight]
    public $title = '';
    #[Validate('required|min:3', onUpdate: false)] // [tl! highlight]
    public $content = '';

    public function save()
    {
        $validated = $this->validate();
        Post::create($validated);
        return redirect('/posts');
    }
};
```

これで、`save()`が呼び出されたときだけ検証され、プロパティ更新ごとには実行されません。

## 属性名をカスタマイズする

バリデーションメッセージに表示するフィールド名を変更できます。

```php
#[Validate('required', as: '生年月日')] // [tl! highlight]
public $dob;
```

「dobフィールドは必須です」ではなく「生年月日フィールドは必須です」と表示されます。

## バリデーションメッセージをカスタマイズする

デフォルトのメッセージを上書きできます。

```php
#[Validate('required', message: '投稿タイトルを入力してください')] // [tl! highlight]
public $title;
```

複数のルールには複数の属性を使います。

```php
#[Validate('required', message: '投稿タイトルを入力してください')]
#[Validate('min:3', message: 'タイトルが短すぎます')]
public $title;
```

## 配列のバリデーション

配列プロパティと子要素を検証できます。

```php
<?php // resources/views/components/⚡task-list.blade.php

use Livewire\Attributes\Validate;
use Livewire\Component;

new class extends Component {
    #[Validate([
        'tasks' => 'required|array|min:1',
        'tasks.*' => 'required|string|min:3',
    ])]
    public $tasks = [];

    public function addTask()
    {
        $this->tasks[] = '';
    }
};
```

配列そのものと、個々のタスクを両方検証します。

## 制限

> [!warning] Ruleオブジェクトには対応していない
> PHP属性からLaravelのRuleオブジェクトを直接使うことはできません。`Rule::exists()`のような複雑なルールには、代わりに`rules()`メソッドを使います。
>
> ```php
> protected function rules()
> {
>     return [
>         'email' => ['required', 'email', Rule::unique('users')->ignore($this->userId)],
>     ];
> }
> ```

## 使用する場面

次のような場合に`#[Validate]`を使います。

* リアルタイムフィードバック付きのフォームを作る
* プロパティ定義の近くにバリデーションルールを置く
* シンプルで読みやすいバリデーションロジックを作る
* UX向上のためインラインバリデーションを実装する

次のような場合は`rules()`メソッドを使います。

* LaravelのRuleオブジェクトが必要
* ルールが動的な値に依存する
* 複雑な条件付きバリデーションを扱う
* ルールを一元管理したい

## 例：お問い合わせフォーム

バリデーション付きのお問い合わせフォームです。

```php
<?php // resources/views/pages/⚡contact.blade.php

use Livewire\Attributes\Validate;
use Livewire\Component;
use App\Mail\ContactMessage;
use Illuminate\Support\Facades\Mail;

new class extends Component {
    #[Validate('required|min:2', as: '名前')]
    public $name = '';
    #[Validate('required|email')]
    public $email = '';
    #[Validate('required')]
    public $subject = '';
    #[Validate('required|min:10', as: 'メッセージ')]
    public $message = '';

    public function submit()
    {
        $validated = $this->validate();
        Mail::to('support@example.com')->send(new ContactMessage($validated));
        session()->flash('success', 'メッセージを送信しました！');
        $this->reset();
    }
};
?>

<div>
    @if (session('success'))
        <div class="alert">{{ session('success') }}</div>
    @endif
    <form wire:submit="submit">
        <div>
            <input type="text" wire:model.live.blur="name" placeholder="お名前">
            @error('name') <span class="error">{{ $message }}</span> @enderror
        </div>
        <div>
            <input type="email" wire:model.live.blur="email" placeholder="メールアドレス">
            @error('email') <span class="error">{{ $message }}</span> @enderror
        </div>
        <div>
            <input type="text" wire:model.live.blur="subject" placeholder="件名">
            @error('subject') <span class="error">{{ $message }}</span> @enderror
        </div>
        <div>
            <textarea wire:model.live.blur="message" placeholder="メッセージ"></textarea>
            @error('message') <span class="error">{{ $message }}</span> @enderror
        </div>
        <button type="submit">メッセージを送信</button>
    </form>
</div>
```

ユーザーは入力中すぐフィードバックを受け取り、わかりやすいフィールド名と役立つエラーメッセージを確認できます。

## さらに詳しく

Formオブジェクト、カスタムルール、テストを含むバリデーションの完全な説明は、[バリデーションのドキュメント](/validation)を参照してください。

## リファレンス

```php
#[Validate(
    mixed $rule = null,
    ?string $attribute = null,
    ?string $as = null,
    mixed $message = null,
    bool $onUpdate = true,
    bool $translate = true,
)]
```

| パラメータ | 型 | デフォルト | 説明 |
|-----------|------|---------|-------------|
| `$rule` | `mixed` | `null` | 適用するバリデーションルール |
| `$attribute` | `?string` | `null` | エラーメッセージ用のカスタム属性名 |
| `$as` | `?string` | `null` | エラーメッセージに表示する親しみやすい名前 |
| `$message` | `mixed` | `null` | バリデーション失敗時のカスタムメッセージ |
| `$onUpdate` | `bool` | `true` | プロパティ更新時に検証するか |
| `$translate` | `bool` | `true` | バリデーションメッセージを翻訳するか |

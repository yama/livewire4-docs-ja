# フォーム

フォームは多くのWebアプリケーションの土台です。そのためLivewireには、フォームを構築するための便利な機能が数多く用意されています。単純な入力要素の処理から、リアルタイムバリデーションやファイルアップロードのような複雑な処理まで、Livewireには開発者の負担を減らし、ユーザーに快適な体験を提供する、シンプルで十分に文書化されたツールがあります。

詳しく見ていきましょう。

## フォームを送信する

まず、`post.create`コンポーネントのとても単純なフォームを見てみましょう。このフォームには2つのテキスト入力と送信ボタンがあり、バックエンドにはフォームの状態と送信を管理するコードがあります。

```php
<?php // resources/views/components/post/⚡create.blade.php

use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public $title = '';

    public $content = '';

    public function save()
    {
        Post::create(
            $this->only(['title', 'content'])
        );

        session()->flash('status', '投稿を正常に更新しました。');

        return $this->redirect('/posts');
    }
};
?>

<form wire:submit="save">
    <input type="text" wire:model="title">

    <input type="text" wire:model="content">

    <button type="submit">保存</button>
</form>
```

ご覧のとおり、上のフォームでは`wire:model`を使ってpublicの`$title`と`$content`プロパティを「バインド」しています。これはLivewireで最もよく使われる強力な機能の1つです。

`$title`と`$content`のバインドに加え、「保存」ボタンがクリックされたとき、`wire:submit`を使って`submit`イベントを捕捉し、`save()`アクションを呼び出しています。このアクションはフォームの入力をデータベースに保存します。

新しい投稿がデータベースに作成された後、ユーザーを投稿ページへリダイレクトし、新しい投稿が作成されたことを示すフラッシュメッセージを表示します。

### バリデーションを追加する

不完全または危険なユーザー入力を保存しないため、ほとんどのフォームには何らかの入力バリデーションが必要です。

Livewireでは、バリデーション対象のプロパティの上に`#[Validate]`属性を追加するだけで、フォームを簡単にバリデーションできます。

プロパティに`#[Validate]`属性を付けると、サーバー側でそのプロパティが更新されるたびに、バリデーションルールがプロパティの値へ適用されます。

`post.create`コンポーネントの`$title`と`$content`プロパティに、基本的なバリデーションルールを追加してみましょう。

```php
<?php // resources/views/components/post/⚡create.blade.php

use Livewire\Attributes\Validate; // [tl! highlight]
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Validate('required')] // [tl! highlight]
    public $title = '';

    #[Validate('required')] // [tl! highlight]
    public $content = '';

    public function save()
    {
        $this->validate(); // [tl! highlight]

        Post::create(
            $this->only(['title', 'content'])
        );

        return $this->redirect('/posts');
    }
};
```

Bladeテンプレートも変更して、ページ上にバリデーションエラーを表示します。

```blade
<form wire:submit="save">
    <input type="text" wire:model="title">
    <div>
        @error('title') <span class="error">{{ $message }}</span> @enderror <!-- [tl! highlight] -->
    </div>

    <input type="text" wire:model="content">
    <div>
        @error('content') <span class="error">{{ $message }}</span> @enderror <!-- [tl! highlight] -->
    </div>

    <button type="submit">保存</button>
</form>
```

これで、ユーザーがどのフィールドにも入力せずフォームを送信しようとすると、投稿を保存する前に、どのフィールドが必須なのかを示すバリデーションメッセージが表示されます。

Livewireには、さらに多くのバリデーション機能があります。詳しくは、[バリデーション専用のドキュメントページ](/validation)を参照してください。

### フォームオブジェクトを取り出す

大きなフォームを扱っていて、プロパティやバリデーションロジックなどをすべて別のクラスに取り出したい場合、Livewireにはフォームオブジェクトがあります。

フォームオブジェクトを使うと、コンポーネント間でフォームのロジックを再利用できます。また、フォーム関連のコードを別クラスにまとめられるため、コンポーネントクラスをすっきり保てます。

フォームクラスは手作業で作成することも、便利なArtisanコマンドを使うこともできます。

```shell
php artisan livewire:form PostForm
```

上のコマンドは`app/Livewire/Forms/PostForm.php`というファイルを作成します。

`post.create`コンポーネントを`PostForm`クラスを使うように書き換えてみましょう。

```php
<?php

namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use Livewire\Form;

class PostForm extends Form
{
    #[Validate('required|min:5')]
    public $title = '';

    #[Validate('required|min:5')]
    public $content = '';
}
```

```php
<?php // resources/views/components/post/⚡create.blade.php

use App\Livewire\Forms\PostForm;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public PostForm $form; // [tl! highlight]

    public function save()
    {
        $this->validate();

        Post::create(
            $this->form->only(['title', 'content']) // [tl! highlight]
        );

        return $this->redirect('/posts');
    }
};
```

```blade
<form wire:submit="save">
    <input type="text" wire:model="form.title">
    <div>
        @error('form.title') <span class="error">{{ $message }}</span> @enderror
    </div>

    <input type="text" wire:model="form.content">
    <div>
        @error('form.content') <span class="error">{{ $message }}</span> @enderror
    </div>

    <button type="submit">保存</button>
</form>
```

必要であれば、投稿作成のロジックもフォームオブジェクトへ次のように取り出せます。

```php
<?php

namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use App\Models\Post;
use Livewire\Form;

class PostForm extends Form
{
    #[Validate('required|min:5')]
    public $title = '';

    #[Validate('required|min:5')]
    public $content = '';

    public function store() // [tl! highlight:5]
    {
        $this->validate();

        Post::create($this->only(['title', 'content']));
    }
}
```

これでコンポーネントから`$this->form->store()`を呼び出せます。

```php
<?php // resources/views/components/post/⚡create.blade.php

use App\Livewire\Forms\PostForm;
use Livewire\Component;

new class extends Component {
    public PostForm $form;

    public function save()
    {
        $this->form->store(); // [tl! highlight]

        return $this->redirect('/posts');
    }

    // ...
};
```

このフォームオブジェクトをcreateフォームとupdateフォームの両方で使いたい場合も、両方の用途に対応するよう簡単に適応できます。

同じフォームオブジェクトを`post.edit`コンポーネントで使い、初期データを設定すると次のようになります。

```php
<?php // resources/views/components/post/⚡edit.blade.php

use App\Livewire\Forms\PostForm;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public PostForm $form;

    public function mount(Post $post)
    {
        $this->form->setPost($post);
    }

    public function save()
    {
        $this->form->update();

        return $this->redirect('/posts');
    }
};
```

```php
<?php

namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use Livewire\Form;
use App\Models\Post;

class PostForm extends Form
{
    public ?Post $post;

    #[Validate('required|min:5')]
    public $title = '';

    #[Validate('required|min:5')]
    public $content = '';

    public function setPost(Post $post)
    {
        $this->post = $post;

        $this->title = $post->title;

        $this->content = $post->content;
    }

    public function store()
    {
        $this->validate();

        Post::create($this->only(['title', 'content']));
    }

    public function update()
    {
        $this->validate();

        $this->post->update(
            $this->only(['title', 'content'])
        );
    }
}
```

ご覧のとおり、既存データでフォームを埋められるように`PostForm`オブジェクトへ`setPost()`メソッドを追加し、後で使うために投稿をフォームオブジェクトへ保存しています。また、既存の投稿を更新するための`update()`メソッドも追加しました。

Livewireを使う際にフォームオブジェクトは必須ではありません。しかし、繰り返しの定型コードをコンポーネントから取り除くための抽象化として便利です。

### フォームフィールドをリセットする

フォームオブジェクトを使っている場合、送信後にフォームをリセットしたいことがあります。`reset()`メソッドを呼び出すことでリセットできます。

```php
<?php

namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use App\Models\Post;
use Livewire\Form;

class PostForm extends Form
{
    #[Validate('required|min:5')]
    public $title = '';

    #[Validate('required|min:5')]
    public $content = '';

    // ...

    public function store()
    {
        $this->validate();

        Post::create($this->only(['title', 'content']));

        $this->reset(); // [tl! highlight]
    }
}
```

`reset()`メソッドにプロパティ名を渡せば、特定のプロパティだけをリセットすることもできます。

```php
$this->reset('title');

// または複数を一度に...

$this->reset(['title', 'content']);
```

### フォームフィールドを取り出す

別の方法として、`pull()`メソッドを使うと、フォームのプロパティを取得してリセットする処理を1回の操作で行えます。

```php
<?php

namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use App\Models\Post;
use Livewire\Form;

class PostForm extends Form
{
    #[Validate('required|min:5')]
    public $title = '';

    #[Validate('required|min:5')]
    public $content = '';

    // ...

    public function store()
    {
        $this->validate();

        Post::create(
            $this->pull() // [tl! highlight]
        );
    }
}
```

`pull()`メソッドにプロパティ名を渡して、特定のプロパティだけを取り出すこともできます。

```php
// リセット前に値を返す...
$this->pull('title');

// リセット前にプロパティをキーと値の配列で返す...
$this->pull(['title', 'content']);
```

### Ruleオブジェクトを使う

Laravelの`Rule`オブジェクトが必要な、より高度なバリデーションシナリオでは、代わりに`rules()`メソッドを定義してバリデーションルールを宣言できます。

```php
<?php

namespace App\Livewire\Forms;

use Illuminate\Validation\Rule;
use App\Models\Post;
use Livewire\Form;

class PostForm extends Form
{
    public ?Post $post;

    public $title = '';

    public $content = '';

    protected function rules()
    {
        return [
            'title' => [
                'required',
                Rule::unique('posts')->ignore($this->post), // [tl! highlight]
            ],
            'content' => 'required|min:5',
        ];
    }

    // ...

    public function update()
    {
        $this->validate();

        $this->post->update($this->only(['title', 'content']));

        $this->reset();
    }
}
```

`#[Validate]`の代わりに`rules()`メソッドを使うと、プロパティが更新されるたびではなく、`$this->validate()`を呼び出したときだけLivewireがバリデーションルールを実行します。

リアルタイムバリデーションなど、リクエストのたびに特定のフィールドをLivewireにバリデーションさせたい場合は、ルールを指定せずに`#[Validate]`を使います。

```php
<?php

namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use Illuminate\Validation\Rule;
use App\Models\Post;
use Livewire\Form;

class PostForm extends Form
{
    public ?Post $post;

    #[Validate] // [tl! highlight]
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

    // ...

    public function update()
    {
        $this->validate();

        $this->post->update($this->only(['title', 'content']));

        $this->reset();
    }
}
```

これでフォーム送信前に`$title`プロパティが更新されると（[`wire:model.live.blur`](/wire-model#「blur」イベントで更新する)を使う場合など）、`$title`のバリデーションが実行されます。

### ローディングインジケーターを表示する

デフォルトでは、フォーム送信中、Livewireは送信ボタンを自動的に無効化し、入力を`readonly`にします。これにより、最初の送信を処理中にユーザーがフォームを再送信するのを防ぎます。

しかし、アプリケーションのUIに追加の表示がないと、ユーザーがこの「ローディング」状態に気付きにくいことがあります。

フォームが送信中であることをユーザーに理解してもらうため、`wire:loading`で「保存」ボタンに小さなローディングスピナーを追加する例を見てみましょう。

```blade
<button type="submit">
    保存

    <div wire:loading>
        <svg>...</svg> <!-- SVGローディングスピナー -->
    </div>
</button>
```

別の方法として、TailwindとLivewireが自動的に付与する`data-loading`属性を使うと、よりすっきりしたマークアップになります。

```blade
<button type="submit">
    <span class="in-data-loading:hidden">保存</span>
    <span class="not-in-data-loading:hidden">
        <svg>...</svg> <!-- SVGローディングスピナー -->
    </span>
</button>
```

[ローディング状態について詳しく学ぶ →](/loading-states)

## フィールドをリアルタイムで更新する

デフォルトでは、Livewireはフォームが送信されたとき（または別の[アクション](/actions)が呼び出されたとき）にだけネットワークリクエストを送信します。フォームに入力している間は送信しません。

例えば`post.create`コンポーネントで、ユーザーの入力中に「タイトル」入力欄をバックエンドの`$title`プロパティと同期したい場合、`wire:model`に`.live`モディファイアを追加します。

```blade
<input type="text" wire:model.live="title">
```

これでユーザーが入力欄に文字を入力するたび、`$title`を更新するためサーバーへネットワークリクエストが送信されます。検索ボックスへの入力中にデータセットを絞り込むリアルタイム検索などに便利です。

## _blur_時だけフィールドを更新する

ほとんどの場合、リアルタイムのフォームフィールド更新には`wire:model.live`で十分です。しかし、テキスト入力ではネットワークリソースを使いすぎることがあります。

入力中にリクエストを送信する代わりに、ユーザーがテキスト入力から「タブで移動」したとき（入力の「blur」とも呼ばれます）だけリクエストを送信したい場合は、`.blur`モディファイアを使います。

```blade
<input type="text" wire:model.live.blur="title" >
```

これでユーザーがTabキーを押すかテキスト入力の外側をクリックするまで、サーバー上のコンポーネントクラスは更新されません。

## リアルタイムバリデーション

フォームへの入力中にバリデーションエラーを表示したい場合があります。フォーム全体の入力が終わるまで待つのではなく、早い段階で問題を知らせられます。

Livewireはこの処理を自動で行います。`wire:model`に`.live`または`.blur`を付けると、フォームの入力中にLivewireがネットワークリクエストを送信します。それぞれのネットワークリクエストでは、各プロパティを更新する前に適切なバリデーションルールを実行します。バリデーションに失敗すると、サーバー上のプロパティは更新されず、ユーザーにバリデーションメッセージが表示されます。

```blade
<input type="text" wire:model.live.blur="title">

<div>
    @error('title') <span class="error">{{ $message }}</span> @enderror
</div>
```

```php
#[Validate('required|min:5')]
public $title = '';
```

ユーザーが「タイトル」入力欄に3文字だけ入力し、フォームの次の入力欄をクリックすると、そのフィールドには5文字以上必要だというバリデーションメッセージが表示されます。

詳しくは、[バリデーションのドキュメントページ](/validation)を参照してください。

## フォームをリアルタイムで保存する

ユーザーが「送信」をクリックするまで待たず、入力中にフォームを自動保存したい場合は、Livewireの`updated()`フックを使います。

```php
<?php // resources/views/components/post/⚡edit.blade.php

use Livewire\Attributes\Validate;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    public Post $post;

    #[Validate('required')]
    public $title = '';

    #[Validate('required')]
    public $content = '';

    public function mount(Post $post)
    {
        $this->post = $post;
        $this->title = $post->title;
        $this->content = $post->content;
    }

    public function updated($name, $value) // [tl! highlight:5]
    {
        $this->post->update([
            $name => $value,
        ]);
    }
};
?>

<form wire:submit>
    <input type="text" wire:model.live.blur="title">
    <div>
        @error('title') <span class="error">{{ $message }}</span> @enderror
    </div>

    <input type="text" wire:model.live.blur="content">
    <div>
        @error('content') <span class="error">{{ $message }}</span> @enderror
    </div>
</form>
```

上の例では、ユーザーがフィールドへの入力を終えると（次のフィールドをクリックするかTabで移動すると）、コンポーネントのそのプロパティを更新するためネットワークリクエストが送信されます。クラス上でプロパティが更新された直後、対象のプロパティ名と新しい値を使って`updated()`フックが呼び出されます。

このフックを使って、対象のフィールドだけをデータベースで更新できます。

さらに、これらのプロパティに`#[Validate]`属性が付いているため、プロパティが更新されて`updated()`フックが呼び出される前にバリデーションルールが実行されます。

「updated」ライフサイクルフックやその他のフックについて詳しくは、[ライフサイクルフックのドキュメント](/lifecycle-hooks)を参照してください。

## 変更前のフィールドを示す

上で説明したリアルタイム保存のシナリオでは、フィールドがまだデータベースに保存されていないことをユーザーに示すと便利な場合があります。

例えば、ユーザーが`post.edit`ページを開いてテキスト入力で投稿のタイトルを変更し始めたとします。フォームの下部に「保存」ボタンがない場合、タイトルがデータベースで実際に更新されたタイミングが分かりにくいことがあります。

Livewireには`wire:dirty`ディレクティブがあり、入力値がサーバー側のコンポーネントと異なるときに、要素の切り替えやクラスの変更ができます。

```blade
<input type="text" wire:model.live.blur="title" wire:dirty.class="border-yellow">
```

上の例では、ユーザーが入力欄に文字を入力すると、入力欄の周りに黄色い枠線が表示されます。ユーザーが入力欄からTabで移動するとネットワークリクエストが送信され、枠線が消えます。入力値が保存され、もう「dirty」ではないことを示します。

要素全体の表示・非表示を切り替えたい場合は、`wire:target`と組み合わせて`wire:dirty`を使います。`wire:target`は、どのデータの「dirty」状態を監視するかを指定します。この場合は「タイトル」フィールドです。

```blade
<input type="text" wire:model="title">

<div wire:dirty wire:target="title">未保存...</div>
```

## 入力をデバウンスする

テキスト入力で`.live`を使うとき、ネットワークリクエストを送信する頻度をより細かく制御したい場合があります。デフォルトでは入力に「250ms」のデバウンスが適用されますが、`.debounce`モディファイアでカスタマイズできます。

```blade
<input type="text" wire:model.live.debounce.150ms="title" >
```

フィールドに`.debounce.150ms`を追加すると、このフィールドの入力更新を処理するとき、より短い「150ms」のデバウンスが使われます。つまり、ユーザーが入力しているとき、少なくとも150ミリ秒入力が止まった場合にだけネットワークリクエストが送信されます。

## 入力をスロットルする

前述のとおり、フィールドに入力デバウンスを適用すると、ユーザーが一定時間入力を止めるまでネットワークリクエストは送信されません。ユーザーが長いメッセージを入力し続ける場合、入力が終わるまでリクエストは送信されないということです。

これは望ましくない場合があり、入力を終えたり休止したりしたときではなく、入力中にリクエストを送信したいこともあります。

その場合は`.throttle`を使って、ネットワークリクエストを送信する間隔を指定できます。

```blade
<input type="text" wire:model.live.throttle.150ms="title" >
```

上の例では、ユーザーが「タイトル」フィールドに入力し続けている間、入力が終わるまで150ミリ秒ごとにネットワークリクエストが送信されます。

## 入力フィールドをBladeコンポーネントに取り出す

ここまで説明してきた`post.create`のような小さなコンポーネントでも、バリデーションメッセージやラベルなど、フォームフィールドの定型コードを多く重複して書くことになります。

このような繰り返しのUI要素を専用の[Bladeコンポーネント](https://laravel.com/docs/blade#components)に取り出し、アプリケーション全体で共有すると便利です。

例えば、以下は`post.create`コンポーネントの元のBladeテンプレートです。次の2つのテキスト入力を専用のBladeコンポーネントに取り出します。

```blade
<form wire:submit="save">
    <input type="text" wire:model="title"> <!-- [tl! highlight:3] -->
    <div>
        @error('title') <span class="error">{{ $message }}</span> @enderror
    </div>

    <input type="text" wire:model="content"> <!-- [tl! highlight:3] -->
    <div>
        @error('content') <span class="error">{{ $message }}</span> @enderror
    </div>

    <button type="submit">保存</button>
</form>
```

再利用可能な`<x-input-text>`というBladeコンポーネントに取り出すと、テンプレートは次のようになります。

```blade
<form wire:submit="save">
    <x-input-text name="title" wire:model="title" /> <!-- [tl! highlight] -->

    <x-input-text name="content" wire:model="content" /> <!-- [tl! highlight] -->

    <button type="submit">保存</button>
</form>
```

次に、`x-input-text`コンポーネントのソースを示します。

```blade
<!-- resources/views/components/input-text.blade.php -->

@props(['name'])

<input type="text" name="{{ $name }}" {{ $attributes }}>

<div>
    @error($name) <span class="error">{{ $message }}</span> @enderror
</div>
```

ご覧のとおり、繰り返していたHTMLを専用のBladeコンポーネント内に配置しました。

ほとんどの場合、Bladeコンポーネントには元のコンポーネントから取り出したHTMLだけが含まれます。ただし、2つの要素を追加しています。

* `@props`ディレクティブ
* 入力要素の`{{ $attributes }}`文

これらの追加要素をそれぞれ説明します。

`@props(['name'])`で`name`を「prop」として指定すると、Bladeに対して、このコンポーネントに「name」という属性が設定された場合、その値を受け取り、このコンポーネント内で`$name`として利用可能にするよう伝えられます。

明示的な用途がないその他の属性には、`{{ $attributes }}`文を使いました。これは「属性フォワーディング」、つまりBladeコンポーネントに記述されたHTML属性を、コンポーネント内の要素へ転送するために使います。

これにより、`wire:model="title"`や`disabled`、`class="..."`、`required`などの追加属性が、実際の`<input>`要素へ確実に転送されます。

### カスタムフォームコントロール

前の例では、入力要素を再利用可能なBladeコンポーネントに「ラップ」し、ネイティブHTML入力要素と同じように使いました。

これは非常に便利なパターンですが、ネイティブ入力要素を内部に持たず、入力コンポーネント全体をゼロから作り、それでも`wire:model`でLivewireのプロパティに値をバインドしたい場合があります。

例えば、Alpineで記述した単純な「カウンター」入力の`<x-input-counter />`コンポーネントを作りたいとします。

Bladeコンポーネントを作る前に、参考として純粋なAlpineの「カウンター」コンポーネントを見てみましょう。

```blade
<div x-data="{ count: 0 }">
    <button x-on:click="count--">-</button>

    <span x-text="count"></span>

    <button x-on:click="count++">+</button>
</div>
```

上のコンポーネントは、数値と、その数値を増減する2つのボタンを表示します。

このコンポーネントを`<x-input-counter />`というBladeコンポーネントに取り出し、次のように別のコンポーネント内で使いたいとします。

```blade
<x-input-counter wire:model="quantity" />
```

このコンポーネントの作成自体はほぼ簡単です。カウンターのHTMLを取り出し、`resources/views/components/input-counter.blade.php`のようなBladeコンポーネントのテンプレート内に配置します。

しかし、LivewireコンポーネントからAlpineコンポーネント内の「count」へ簡単にデータをバインドできるよう、`wire:model="quantity"`を機能させるにはもう1つ手順が必要です。

コンポーネントのソースは次のとおりです。

```blade
<!-- resources/view/components/input-counter.blade.php -->

<div x-data="{ count: 0 }" x-modelable="count" {{ $attributes}}>
    <button x-on:click="count--">-</button>

    <span x-text="count"></span>

    <button x-on:click="count++">+</button>
</div>
```

このHTMLで異なるのは`x-modelable="count"`と`{{ $attributes }}`だけです。

`x-modelable`はAlpineのユーティリティで、外部からバインドできるよう、特定のデータを利用可能にするようAlpineに伝えます。[このディレクティブについて詳しくはAlpineのドキュメント](https://alpinejs.dev/directives/modelable)を参照してください。

先ほど説明したように、`{{ $attributes }}`は外部からBladeコンポーネントに渡された属性を転送します。この場合、`wire:model`ディレクティブが転送されます。

`{{ $attributes }}`により、ブラウザでHTMLがレンダリングされると、Alpineコンポーネントのルート`<div>`上で`wire:model="quantity"`が`x-modelable="count"`と並んで次のように表示されます。

```blade
<div x-data="{ count: 0 }" x-modelable="count" wire:model="quantity">
```

`x-modelable="count"`はAlpineに、`x-model`または`wire:model`文を探し、バインドするデータとして「count」を使うよう伝えます。

`x-modelable`は`wire:model`と`x-model`の両方で機能するため、このBladeコンポーネントをLivewireとAlpineで相互に使えます。次は、このBladeコンポーネントをAlpineだけのコンテキストで使う例です。

```blade
<x-input-counter x-model="quantity" />
```

アプリケーションでカスタム入力要素を作成するのは非常に強力ですが、LivewireとAlpineが提供するユーティリティと、それらがどのように連携するかについて、より深い理解が必要です。

## 関連項目

- **[バリデーション](/validation)** — リアルタイムのフィードバックでフォーム入力を検証する
- **[wire:model](/wire-model)** — フォーム入力をコンポーネントのプロパティにバインドする
- **[ファイルアップロード](/uploads)** — フォームでファイルアップロードを処理する
- **[アクション](/actions)** — アクションでフォーム送信を処理する
- **[ローディング状態](/loading-states)** — フォーム送信中にローディングインジケーターを表示する

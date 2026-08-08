Livewireでは、コンポーネントのプロパティをURLのクエリ文字列に保存できます。たとえば、コンポーネントの `$search` プロパティをURLの `https://example.com/users?search=bob` に含められます。フィルタリング、並べ替え、ページネーションなどで特に便利です。ページの特定の状態をユーザーが共有したりブックマークしたりできるためです。

## 基本的な使い方

以下は、テキスト入力で名前からユーザーを検索できる `show-users` コンポーネントです。

```php
<?php // resources/views/components/⚡show-users.blade.php

use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\User;

new class extends Component {
    public $search = '';

    #[Computed]
    public function users()
    {
        return User::search($this->search)->get();
    }
};
```

```blade
<div>
    <input type="text" wire:model.live="search">

    <ul>
        @foreach ($this->users as $user)
            <li wire:key="{{ $user->id }}">{{ $user->name }}</li>
        @endforeach
    </ul>
</div>
```

テキスト入力が `wire:model.live="search"` を使っているため、ユーザーが入力するとネットワークリクエストが送信され、`$search` プロパティが更新されて、絞り込まれたユーザーが表示されます。

ただし、ページを更新すると検索値と結果は失われます。

ページ更新後も検索値を保持し、URLを共有できるようにするには、`$search` プロパティの上に `#[Url]` 属性を追加して検索値をURLのクエリ文字列へ保存します。

```php
<?php // resources/views/components/⚡show-users.blade.php

use Livewire\Attributes\Computed;
use Livewire\Attributes\Url;
use Livewire\Component;
use App\Models\User;

new class extends Component {
    #[Url] // [tl! highlight]
    public $search = '';

    #[Computed]
    public function users()
    {
        return User::search($this->search)->get();
    }
};
```

検索欄へ `bob` と入力すると、ブラウザのURLバーは次のようになります。

```
https://example.com/users?search=bob
```

このURLを新しいブラウザウィンドウで開くと、検索欄には `bob` が入力され、それに応じてユーザーが絞り込まれます。

## URLからプロパティを初期化する

前の例のように、プロパティが `#[Url]` を使うと、更新された値をクエリ文字列へ保存するだけでなく、ページロード時に既存のクエリ文字列も参照します。

たとえば `https://example.com/users?search=bob` にアクセスすると、Livewireは `$search` の初期値を `bob` に設定します。

```php
use Livewire\Attributes\Url;
use Livewire\Component;

class ShowUsers extends Component
{
    #[Url]
    public $search = ''; // 「bob」に設定されます...

    // ...
}
```

### Nullableプロパティ

デフォルトでは、`?search=` のように空のクエリ文字列項目がある状態でページを読み込むと、Livewireは空文字列として扱います。多くの場合はこれで問題ありませんが、`?search=` を `null` として扱いたい場合があります。

この場合はnullableな型宣言を使います。

```php
use Livewire\Attributes\Url;
use Livewire\Component;

class ShowUsers extends Component
{
    #[Url]
    public ?string $search; // [tl! highlight]

    // ...
}
```

型宣言に `?` があるため、Livewireは `?search=` を見つけると、空文字列ではなく `$search` を `null` にします。

逆も同様です。アプリケーションで `$this->search = null` と設定すると、クエリ文字列では `?search=` として表現されます。

## エイリアスを使う

Livewireでは、URLのクエリ文字列に表示する名前を完全に制御できます。たとえば `$search` プロパティを、実際のプロパティ名を隠すため、または `q` に短縮するために別名で表示できます。

`#[Url]` 属性へ `as` パラメータを渡してクエリ文字列のエイリアスを指定します。

```php
use Livewire\Attributes\Url;
use Livewire\Component;

class ShowUsers extends Component
{
    #[Url(as: 'q')]
    public $search = '';

    // ...
}
```

`bob` と入力すると、URLは `?search=bob` ではなく `https://example.com/users?q=bob` になります。

## 特定の値を除外する

デフォルトでは、初期化時の値から変更された場合だけ、Livewireはクエリ文字列へ項目を追加します。多くの場合は望ましい動作ですが、どの値をクエリ文字列から除外するか、より細かく制御したい場合があります。その場合は `except` パラメータを使います。

以下のコンポーネントでは、`mount()` で `$search` の初期値を変更しています。`search` の値が空文字列の場合だけクエリ文字列から除外するため、`#[Url]` に `except` を追加しています。

```php
use Livewire\Attributes\Url;
use Livewire\Component;

class ShowUsers extends Component
{
    #[Url(except: '')]
    public $search = '';

    public function mount() {
        $this->search = auth()->user()->username;
    }

    // ...
}
```

上の例で `except` を使わない場合、`search` の値が `auth()->user()->username` の初期値と同じになるたびに、Livewireはクエリ文字列から `search` 項目を削除します。`except: ''` を使うと、`search` が空文字列の場合を除き、すべてのクエリ文字列値が保持されます。

## ページロード時に表示する

デフォルトでは、ページ上で値が変更された後にだけ、Livewireはクエリ文字列へ値を表示します。たとえば `$search` のデフォルト値が空文字列 `""` の場合、検索入力が空のままならURLに値は表示されません。

値が空でも、`?search` 項目を常にクエリ文字列へ含めたい場合は、`#[Url]` 属性に `keep` パラメータを指定します。

```php
use Livewire\Attributes\Url;
use Livewire\Component;

class ShowUsers extends Component
{
    #[Url(keep: true)]
    public $search = '';

    // ...
}
```

ページロード時、URLは `https://example.com/users?search=` に変更されます。

## 履歴へ保存する

デフォルトでは、Livewireは [`history.pushState()`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) ではなく [`history.replaceState()`](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState) を使ってURLを変更します。つまり、クエリ文字列を更新しても、ブラウザの履歴へ新しい項目を追加せず、現在の履歴項目を変更します。

現在の履歴を「置き換える」ため、ブラウザの「戻る」ボタンを押すと、直前の `?search=` の値ではなく前のページへ移動します。

URLの更新時に `history.pushState` を使うには、`#[Url]` 属性へ `history` パラメータを指定します。

```php
use Livewire\Attributes\Url;
use Livewire\Component;

class ShowUsers extends Component
{
    #[Url(history: true)]
    public $search = '';

    // ...
}
```

上の例で検索値を `bob` から `frank` へ変更してからブラウザの戻るボタンを押すと、前に訪れたページではなく、検索値とURLが `bob` に戻ります。

## queryStringメソッドを使う

クエリ文字列はコンポーネントのメソッドとしても定義できます。プロパティに動的なオプションがある場合に便利です。

```php
use Livewire\Component;

class ShowUsers extends Component
{
    // ...

    protected function queryString()
    {
        return [
            'search' => [
                'as' => 'q',
            ],
        ];
    }
}
```

## Traitフック

クエリ文字列用の[フック](/lifecycle-hooks)も提供されています。

```php
trait WithSorting
{
    // ...

    protected function queryStringWithSorting()
    {
        return [
            'sortBy' => ['as' => 'sort'],
            'sortDirection' => ['as' => 'direction'],
        ];
    }
}
```

## 関連項目

- **[プロパティ](/properties)** — プロパティをURLパラメータと同期する
- **[ナビゲーション](/navigate)** — SPAナビゲーション中もURLの状態を維持する
- **[Url属性](https://livewire.laravel.com/docs/4.x/attribute-url)** — プロパティをURLのクエリ文字列へバインドする
- **[ページ](/pages)** — ルートパラメータを扱う

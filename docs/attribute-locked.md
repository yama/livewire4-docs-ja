`#[Locked]`属性を使うと、クライアント側からプロパティを変更できなくなり、モデルIDなどの機密データをユーザーによる改ざんから守れます。

## 基本的な使い方

フロントエンドから変更させたくないpublicプロパティに`#[Locked]`を適用します。

```php
<?php // resources/views/components/post/⚡show.blade.php

use Livewire\Attributes\Locked;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Locked] // [tl! highlight]
    public $postId;

    public function mount($id)
    {
        $this->postId = $id;
    }

    public function delete()
    {
        Post::find($this->postId)->delete();

        return redirect('/posts');
    }
};
```

ユーザーがDevToolsやリクエストの改ざんでロックされたプロパティを変更しようとすると、Livewireは例外を発生させ、アクションの実行を防ぎます。

> [!warning] バックエンドからの変更は許可される
> `#[Locked]`属性のプロパティは、コンポーネントのPHPコードから変更できます。ロックが防ぐのはクライアント側の改ざんだけです。自分のメソッドで信頼できない入力値をロックされたプロパティへ渡さないよう注意してください。

## 使用する場面

次のような場合に`#[Locked]`を使います。

* ユーザーが絶対に変更できないモデルIDを保存する
* 認可に関わるデータをコンポーネントのライフサイクル全体で保持する
* セキュリティ境界となるpublicプロパティを保護する

> [!tip] モデルプロパティはデフォルトで安全
> Eloquentモデルをpublicプロパティに保存すると、LivewireはIDが改ざんされないよう自動的に保護します。`#[Locked]`属性は必要ありません。
> ```php
> <?php // resources/views/components/post/⚡show.blade.php
>
> use Livewire\Component;
> use App\Models\Post;
>
> new class extends Component {
>     public Post $post; // すでに保護されている [tl! highlight]
>
>     public function mount($id)
>     {
>         $this->post = Post::find($id);
>     }
> };
> ```

## protectedプロパティではだめなのか

機密データに`protected`プロパティを使えないのか疑問に思うかもしれません。

Livewireがリクエスト間で保持するのはpublicプロパティだけです。protectedプロパティは静的なハードコード値なら問題ありませんが、実行時に保存するデータには、リクエスト間で正しく保持するためpublicプロパティが必要です。

`#[Locked]`はここで重要になります。publicプロパティの永続性と、クライアント側の改ざん防止を両立できます。

## Livewireが自動でできないのか

理想的には、Livewireがデフォルトですべてのプロパティをロックし、そのプロパティに`wire:model`が使われた場合だけ変更を許可できるでしょう。

しかし、そのためにはすべてのBladeテンプレートを解析し、`wire:model`などでプロパティが変更されるか理解する必要があります。

さらに技術的・パフォーマンス上のオーバーヘッドが発生し、Alpineやその他のカスタムJavaScriptによる変更を検出することも不可能です。

そのためLivewireは、publicプロパティをデフォルトでは自由に変更できる状態にし、必要な場合に開発者がロックできるツールを提供します。

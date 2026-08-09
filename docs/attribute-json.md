`#[Json]`属性はアクションをJSONエンドポイントとして扱い、データをJavaScriptへ直接返します。バリデーションエラーは構造化されたエラーデータを伴うPromiseのrejectになります。BladeでレンダリングするよりJavaScriptから利用するアクションに適しています。

## 基本的な使い方

JavaScriptから利用するデータを返すアクションメソッドに`#[Json]`を適用します。

```php
<?php // resources/views/components/⚡search.blade.php

use Livewire\Attributes\Json;
use Livewire\Component;
use App\Models\Post;

new class extends Component {
    #[Json] // [tl! highlight]
    public function search($query)
    {
        return Post::where('title', 'like', "%{$query}%")
            ->limit(10)
            ->get();
    }
};
```

```blade
<div x-data="{ query: '', posts: [] }">
    <input
        type="text"
        x-model="query"
        x-on:input.debounce="$wire.search(query).then(data => posts = data)"
    >

    <ul>
        <template x-for="post in posts">
            <li x-text="post.title"></li>
        </template>
    </ul>
</div>
```

`search()`メソッドは投稿をAlpineへ直接返し、`posts`配列に保存してクライアント側で表示します。

## 応答を処理する

JSONメソッドは成功時には戻り値でresolveし、バリデーション失敗時にはrejectします。

**成功時：**
```js
let data = await $wire.search('query')
// data = [ { id: 1, title: '...' }, ...]
```

**バリデーション失敗時：**
```js
try {
    let data = await $wire.save()
} catch (e) {
    // e.status = 422
    // e.errors = { name: ['名前は必須です。'] }
}
```

`.catch()`も使えます。
```js
$wire.save()
    .then(data => {
        // 成功時の処理
        console.log(data)
    })
    .catch(e => {
        if (e.status === 422) {
            // バリデーションエラーの処理
            console.log(e.errors)
        }
    })
```

## エラーrejectの形式

Promiseがrejectされた場合、エラーオブジェクトは次の形式です。

```js
{
    status: 422,    // HTTPステータスコード（バリデーションエラーは422）
    body: null,     // 生のレスポンス本文（バリデーションエラーはnull）
    json: null,     // パース済みJSON（バリデーションエラーはnull）
    errors: {...}   // バリデーションエラーオブジェクト
}
```

HTTPエラー（500など）も形式は同じですが、実際のレスポンスデータが入ります。

```js
{
    status: 500,
    body: '<html>...</html>',
    json: null,
    errors: null
}
```

## 動作

`#[Json]`属性は自動的に2つの動作を適用します。

1. **レンダリングをスキップする** — 応答はJavaScriptが消費するため、アクション完了後にコンポーネントを再レンダリングしない
2. **非同期で実行する** — 他のリクエストをブロックせずアクションを並列実行する

API形式のエンドポイントに期待される動作と同じです。

## 使用する場面

次のような場合に`#[Json]`を使います。

* **動的検索・オートコンプリート** — ドロップダウンや候補一覧の結果を取得する
* **JavaScriptへデータを読み込む** — チャート、地図などJS駆動のUIへデータを入れる
* **JavaScriptでフォームを処理する** — 成功・エラー状態をJavaScriptで扱う
* **サードパーティライブラリと統合する** — 独自にレンダリングを管理するライブラリへデータを渡す

> [!warning] バリデーションエラーは分離される
> JSONメソッドのバリデーションエラーはPromiseのrejectからのみ返されます。`$wire.$errors`やコンポーネントのエラーバッグには現れません。これは意図した動作です。JSONメソッドは自己完結しており、コンポーネントのレンダリング状態に影響しません。

## 関連項目

- **[アクション](/actions)** — メソッドの呼び出しと戻り値の受け取り
- **[バリデーション](/validation)** — Livewireコンポーネントのサーバーサイドバリデーション
- **[Async属性](/attribute-async)** — ブロックせずアクションを並列実行する
- **[Renderless属性](/attribute-renderless)** — アクション後の再レンダリングをスキップする

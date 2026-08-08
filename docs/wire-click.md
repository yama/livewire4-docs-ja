Livewireには、ページ上の特定の要素がクリックされたときにコンポーネントのメソッド（アクションとも呼ばれます）を呼び出すための、シンプルな`wire:click`ディレクティブがあります。

たとえば、次の`ShowInvoice`コンポーネントがあるとします。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Invoice;

class ShowInvoice extends Component
{
    public Invoice $invoice;

    public function download()
    {
        return response()->download(
            $this->invoice->file_path, 'invoice.pdf'
        );
    }
}
```

上のクラスにある`download()`メソッドは、`wire:click="download"`を追加することで、「請求書をダウンロード」ボタンがクリックされたときに呼び出せます。

```html
<button type="button" wire:click="download"> <!-- [tl! highlight] -->
    請求書をダウンロード
</button>
```

## パラメータの渡し方

`wire:click`ディレクティブで、アクションに直接パラメータを渡せます。

```blade
<button wire:click="delete({{ $post->id }})">削除</button>
```

ボタンがクリックされると、`delete()`メソッドが投稿のIDを受け取って呼び出されます。

> [!warning] アクションのパラメータを信頼しない
> アクションのパラメータはHTTPリクエストの入力値と同じように扱い、信頼してはいけません。データを更新する前に、必ず所有権を認可してください。

## リンクでの使用

`<a>`タグで`wire:click`を使う場合は、デフォルトのリンク動作を防ぐために`.prevent`を追加する必要があります。追加しないと、ブラウザは指定された`href`へ移動します。

```blade
<a href="#" wire:click.prevent="show">詳細を表示</a>
```

## 再レンダリングを防ぐ

アクションの完了後にコンポーネントを再レンダリングしないようにするには、`.renderless`を使います。ログ記録やアナリティクスのように、副作用だけを実行するアクションで便利です。

```blade
<button wire:click.renderless="trackClick">イベントを追跡</button>
```

## スクロール位置を維持する

デフォルトでは、コンテンツの更新によってスクロール位置が変わることがあります。現在のスクロール位置を維持するには、`.preserve-scroll`を使います。

```blade
<button wire:click.preserve-scroll="loadMore">さらに読み込む</button>
```

## 並列実行

デフォルトでは、Livewireは同じコンポーネント内のアクションをキューに入れます。アクションを並列実行できるようにするには、`.async`を使います。

```blade
<button wire:click.async="process">処理</button>
```

## さらに詳しく

`wire:click`ディレクティブは、Livewireで利用できるさまざまなイベントリスナーの1つにすぎません。`wire:click`やその他のイベントリスナーの機能について詳しくは、[Livewireのアクションドキュメント](/actions)を参照してください。

## 関連項目

- **[アクション](/actions)** — コンポーネントアクションの完全ガイド
- **[イベント](/events)** — クリックハンドラーからイベントをディスパッチする
- **[wire:confirm](/wire-confirm)** — アクションに確認ダイアログを追加する

## リファレンス

```blade
wire:click="methodName"
wire:click="methodName(param1, param2)"
```

### モディファイア

| モディファイア | 説明 |
|----------|-------------|
| `.prevent` | ブラウザのデフォルト動作を防ぐ |
| `.stop` | イベントの伝播を停止する |
| `.self` | この要素で発生したイベントの場合のみトリガーする |
| `.once` | リスナーが1回だけ呼び出されるようにする |
| `.debounce` | ハンドラーを250ms単位でデバウンスする（任意の時間には`.debounce.500ms`を使う） |
| `.throttle` | ハンドラーの実行を最低250ms間隔に制限する（任意の時間には`.throttle.500ms`を使う） |
| `.window` | `window`オブジェクトのイベントをリッスンする |
| `.document` | `document`オブジェクトのイベントをリッスンする |
| `.outside` | 要素の外側で発生したクリックのみをリッスンする |
| `.passive` | スクロールのパフォーマンスを妨げない |
| `.capture` | キャプチャリングフェーズでリッスンする |
| `.camel` | イベント名をキャメルケースに変換する |
| `.dot` | イベント名をドット記法に変換する |
| `.renderless` | アクション完了後の再レンダリングをスキップする |
| `.preserve-scroll` | 更新中もスクロール位置を維持する |
| `.async` | キューに入れる代わりにアクションを並列実行する |

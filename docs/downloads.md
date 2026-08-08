Livewireのファイルダウンロードは、Laravelそのものの場合とほぼ同じように動作します。通常はLaravelのダウンロードユーティリティをLivewireコンポーネント内で使えば、期待どおり動作します。

ただし内部では、標準的なLaravelアプリケーションとは異なる方法で処理されます。Livewireではファイルの内容をBase64エンコードしてフロントエンドへ送り、クライアント側でバイナリへ戻して直接ダウンロードします。

## 基本的な使い方

Livewireでファイルダウンロードを起動するには、通常のLaravelダウンロードレスポンスを返すだけです。

以下は、請求書PDFをダウンロードする「show-invoice」コンポーネントの例です。

```php
<?php // resources/views/components/⚡show-invoice.blade.php

use Livewire\Component;
use App\Models\Invoice;

new class extends Component {
    public Invoice $invoice;

    public function mount(Invoice $invoice)
    {
        $this->invoice = $invoice;
    }

    public function download()
    {
        return response()->download( // [tl! highlight:2]
            $this->invoice->file_path, 'invoice.pdf'
        );
    }
};
```

```blade
<div>
    <h1>{{ $invoice->title }}</h1>

    <span>{{ $invoice->date }}</span>
    <span>{{ $invoice->amount }}</span>

    <button type="button" wire:click="download">ダウンロード</button> <!-- [tl! highlight] -->
</div>
```

Laravelのコントローラーと同じく、`Storage` ファサードでもダウンロードを開始できます。

```php
public function download()
{
    return Storage::disk('invoices')->download('invoice.csv');
}
```

## ストリーミングダウンロード

Livewireではストリーミングダウンロードもできます。ただし本当の意味でストリーミングされるわけではありません。ファイルの内容が集められてブラウザへ届けられるまで、ダウンロードは開始されません。

```php
public function download()
{
    return response()->streamDownload(function () {
        echo '...'; // ダウンロード内容を直接出力...
    }, 'invoice.pdf');
}
```

## ファイルダウンロードをテストする

`->assertFileDownloaded()` メソッドを使うと、指定した名前のファイルがダウンロードされたことを簡単にテストできます。

```php
use App\Models\Invoice;

public function test_can_download_invoice()
{
    $invoice = Invoice::factory();

    Livewire::test(ShowInvoice::class)
        ->call('download')
        ->assertFileDownloaded('invoice.pdf');
}
```

`->assertNoFileDownloaded()` メソッドを使えば、ファイルがダウンロードされなかったこともテストできます。

```php
use App\Models\Invoice;

public function test_does_not_download_invoice_if_unauthorised()
{
    $invoice = Invoice::factory();

    Livewire::test(ShowInvoice::class)
        ->call('download')
        ->assertNoFileDownloaded();
}
```

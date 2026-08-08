Livewireは、コンポーネント内でのファイルアップロードを強力にサポートしています。

まず、コンポーネントへ `WithFileUploads` traitを追加します。traitを追加すると、他の入力タイプと同じようにファイル入力へ `wire:model` を使え、残りの処理はLivewireが行います。

写真をアップロードするシンプルなコンポーネントの例です。

```php
<?php // resources/views/components/⚡upload-photo.blade.php

use Livewire\Attributes\Validate;
use Livewire\WithFileUploads;
use Livewire\Component;

new class extends Component {
    use WithFileUploads;

    #[Validate('image|max:1024')] // 最大1MB
    public $photo;

    public function save()
    {
        $this->validate();
        $this->photo->store(path: 'photos');
    }
};
```

```blade
<form wire:submit="save">
    <input type="file" wire:model="photo">

    @error('photo') <span class="error">{{ $message }}</span> @enderror

    <button type="submit">写真を保存</button>
</form>
```

> [!warning] 「upload」メソッドは予約されている
> 上の例で「upload」ではなく「save」メソッドを使っていることに注目してください。これはよくある注意点です。「upload」という名前はLivewireで予約されています。コンポーネントのメソッド名やプロパティ名には使えません。

開発者の視点では、ファイル入力の扱いは他の入力タイプと変わりません。`<input>` タグへ `wire:model` を追加すれば、残りはLivewireが処理します。

ただし、Livewireでファイルアップロードを動かすために、内部ではさらに多くの処理が行われています。ユーザーがアップロードするファイルを選択したときの流れは次のとおりです。

1. 新しいファイルが選択されると、LivewireのJavaScriptがまずサーバー上のコンポーネントへリクエストを送り、一時的な「署名付き」アップロードURLを取得します。
2. URLを受け取ると、JavaScriptがその署名付きURLへ実際の「アップロード」を行います。Livewireが指定した一時ディレクトリへ保存し、新しい一時ファイルの一意なハッシュIDを返します。
3. ファイルがアップロードされて一意なハッシュIDが生成されると、LivewireのJavaScriptがサーバー上のコンポーネントへ最後のリクエストを送り、指定したpublicプロパティを新しい一時ファイルに「設定」します。
4. これでpublicプロパティ（この場合は `$photo`）に一時ファイルが設定され、いつでも保存やバリデーションを行える状態になります。

## アップロードしたファイルを保存する

前の例は、アプリケーションのデフォルトファイルシステムディスクの `photos` ディレクトリへ一時アップロードファイルを移動する、最も基本的な保存方法です。

保存するファイル名を変更したり、ファイルを保存する特定のストレージ「ディスク」（S3など）を指定したりしたい場合もあるでしょう。

> [!tip] 元のファイル名
> 一時アップロードの元のファイル名は、`->getClientOriginalName()` メソッドを呼び出して取得できます。

LivewireはLaravelがファイル保存に使うAPIと同じものを利用します。詳しくは[Laravelのファイルアップロードドキュメント](https://laravel.com/docs/filesystem#file-uploads)を参照してください。よくある保存方法は次のとおりです。

```php
public function save()
{
    // デフォルトファイルシステムディスクの「photos」ディレクトリへ保存
    $this->photo->store(path: 'photos');

    // 設定済みの「s3」ディスクの「photos」ディレクトリへ保存
    $this->photo->store(path: 'photos', options: 's3');

    // ファイル名を「avatar.png」として「photos」ディレクトリへ保存
    $this->photo->storeAs(path: 'photos', name: 'avatar');

    // 設定済みの「s3」ディスクへ「avatar.png」という名前で保存
    $this->photo->storeAs(path: 'photos', name: 'avatar', options: 's3');

    // 設定済みの「s3」ディスクへpublic可視性で保存
    $this->photo->storePublicly(path: 'photos', options: 's3');

    // 設定済みの「s3」ディスクへ「avatar.png」という名前、public可視性で保存
    $this->photo->storePubliclyAs(path: 'photos', name: 'avatar', options: 's3');
}
```

## 複数ファイルを扱う

Livewireは `<input>` タグの `multiple` 属性を検出して、複数ファイルのアップロードを自動的に扱います。

以下は `$photos` という配列プロパティを持つコンポーネントです。フォームのファイル入力へ `multiple` を追加すると、Livewireは新しいファイルをこの配列へ自動的に追加します。

```php
<?php // resources/views/components/⚡upload-photos.blade.php

use Livewire\Attributes\Validate;
use Livewire\WithFileUploads;
use Livewire\Component;

new class extends Component {
    use WithFileUploads;

    #[Validate(['photos.*' => 'image|max:1024'])]
    public $photos = [];

    public function save()
    {
        $this->validate();

        foreach ($this->photos as $photo) {
            $photo->store(path: 'photos');
        }
    }
};
```

```blade
<form wire:submit="save">
    <input type="file" wire:model="photos" multiple>

    @error('photos.*') <span class="error">{{ $message }}</span> @enderror

    <button type="submit">写真を保存</button>
</form>
```

## ファイルをバリデーションする

ファイルアップロードのバリデーションは、通常のLaravelコントローラーでファイルを扱う場合と同じです。

> [!warning] S3が正しく設定されていることを確認する
> ファイルに関係するバリデーションルールの多くは、ファイルへのアクセスを必要とします。[S3へ直接アップロードする](#amazon-s3へ直接アップロードする)場合、S3のファイルオブジェクトがpublicにアクセスできなければ、これらのバリデーションルールは失敗します。

ファイルバリデーションの詳細は、[Laravelのファイルバリデーションドキュメント](https://laravel.com/docs/validation#available-validation-rules)を参照してください。

## 一時プレビューURL

ユーザーがファイルを選択したら、通常はフォームを送信してファイルを保存する前に、そのファイルのプレビューを表示します。

アップロードしたファイルの `->temporaryUrl()` メソッドを使うと簡単に実現できます。

> [!info] 一時URLは画像に限定される
> セキュリティ上の理由により、一時プレビューURLは画像MIMEタイプのファイルだけに対応しています。

画像プレビュー付きファイルアップロードの例です。

```php
<?php // resources/views/components/⚡upload-photo.blade.php

use Livewire\Attributes\Validate;
use Livewire\WithFileUploads;
use Livewire\Component;

new class extends Component {
    use WithFileUploads;

    #[Validate('image|max:1024')]
    public $photo;

    // ...
};
```

```blade
<form wire:submit="save">
    @if ($photo) <!-- [tl! highlight:2] -->
        <img src="{{ $photo->temporaryUrl() }}">
    @endif

    <input type="file" wire:model="photo">

    @error('photo') <span class="error">{{ $message }}</span> @enderror

    <button type="submit">写真を保存</button>
</form>
```

前述のとおり、Livewireは一時ファイルを非公開ディレクトリへ保存します。そのため通常、一時ファイルのpublicなURLをユーザーへ公開して画像をプレビューする簡単な方法はありません。

しかしLivewireは、アップロードした画像のように振る舞う一時的な署名付きURLを提供することで、この問題を解決します。これによりページ上で画像プレビューを表示できます。

このURLは、一時ディレクトリより上のディレクトリにあるファイルを表示できないよう保護されています。また署名付きなので、ユーザーがこのURLを悪用してシステム上の他のファイルをプレビューすることもできません。

> [!tip] S3の一時署名付きURL
> 一時ファイルの保存先としてS3を使うようLivewireを設定している場合、`->temporaryUrl()` はS3へ直接、一時的な署名付きURLを生成します。そのため画像プレビューはLaravelアプリケーションサーバーから読み込まれません。

## ファイルアップロードをテストする

Laravelに既存のファイルアップロードテストヘルパーを使って、ファイルアップロードをテストできます。

以下は `UploadPhoto` コンポーネントの完全なテスト例です。

```php
<?php

namespace Tests\Feature\Livewire;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Livewire\UploadPhoto;
use Livewire\Livewire;
use Tests\TestCase;

class UploadPhotoTest extends TestCase
{
    public function test_can_upload_photo()
    {
        Storage::fake('avatars');

        $file = UploadedFile::fake()->image('avatar.png');

        Livewire::test(UploadPhoto::class)
            ->set('photo', $file)
            ->call('upload', 'uploaded-avatar.png');

        Storage::disk('avatars')->assertExists('uploaded-avatar.png');
    }
}
```

前のテストを通すために必要な `upload-photo` コンポーネントの例です。

```php
<?php // resources/views/components/⚡upload-photo.blade.php

use Livewire\WithFileUploads;
use Livewire\Component;

new class extends Component {
    use WithFileUploads;

    public $photo;

    public function upload($name)
    {
        $this->photo->storeAs('/', $name, disk: 'avatars');
    }

    // ...
};
```

ファイルアップロードのテストについて詳しくは、[Laravelのファイルアップロードテストドキュメント](https://laravel.com/docs/http-tests#testing-file-uploads)を参照してください。

## Amazon S3へ直接アップロードする

前述のとおり、Livewireは開発者がファイルを永続保存するまで、すべてのアップロードを一時ディレクトリに保存します。

デフォルトでは、Livewireはデフォルトファイルシステムディスクの設定（通常は `local`）を使い、`livewire-tmp/` ディレクトリ内へファイルを保存します。

そのため、後からS3バケットへ保存する場合でも、ファイルアップロードは常にアプリケーションサーバーを利用します。

アプリケーションサーバーを経由せず、Livewireの一時アップロードをS3バケットへ保存するには、`.env` ファイルの `LIVEWIRE_TEMPORARY_FILE_UPLOAD_DISK` 環境変数を `s3`（または `s3` ドライバーを使う別のカスタムディスク）に設定します。

```env
LIVEWIRE_TEMPORARY_FILE_UPLOAD_DISK=s3
```

これでユーザーがファイルをアップロードしても、ファイルはサーバーへ実際に保存されません。代わりにS3バケットの `livewire-tmp/` サブディレクトリへ直接アップロードされます。

> [!tip]
> 代わりに `php artisan livewire:config` でLivewireの設定ファイルをpublishし、`temporary_file_upload` 設定を完全に制御することもできます。

### ファイルの自動クリーンアップを設定する

Livewireの一時アップロードディレクトリはすぐにファイルでいっぱいになるため、24時間より古いファイルを削除するようS3を設定することが重要です。

ファイルアップロードにS3バケットを利用している環境で、次のArtisanコマンドを実行します。

```shell
php artisan livewire:configure-s3-upload-cleanup
```

これで24時間より古い一時ファイルは、S3によって自動的に削除されます。

> [!info]
> ファイル保存にS3を使っていない場合、Livewireがファイルのクリーンアップを自動的に行うため、上のコマンドを実行する必要はありません。

## ローディング表示

ファイルアップロードの `wire:model` は内部では他の `wire:model` 入力タイプと異なる動作をしますが、ローディング表示のインターフェースは同じです。

`wire:loading` を使って、ファイルアップロードに限定したローディング表示を出せます。

```blade
<input type="file" wire:model="photo">

<div wire:loading wire:target="photo">アップロード中...</div>
```

Livewireが自動追加する `data-loading` 属性を使えば、さらに簡単です。

```blade
<div>
    <input type="file" wire:model="photo">

    <div class="not-data-loading:hidden">アップロード中...</div>
</div>
```

ファイルのアップロード中は「アップロード中...」が表示され、完了すると非表示になります。

[ローディング状態について詳しく読む →](/loading-states)

## 進捗表示

Livewireのファイルアップロード操作はすべて、対応する `<input>` 要素でJavaScriptイベントをディスパッチします。これにより、独自のJavaScriptでイベントを捕捉できます。

Event | Description
--- | ---
`livewire-upload-start` | アップロード開始時にディスパッチ
`livewire-upload-finish` | アップロードが正常に完了したときにディスパッチ
`livewire-upload-cancel` | アップロードが途中でキャンセルされたときにディスパッチ
`livewire-upload-error` | アップロードが失敗したときにディスパッチ
`livewire-upload-progress` | アップロードの進行中に、進捗率を含めてディスパッチ

以下は、LivewireのファイルアップロードをAlpineコンポーネントで囲み、アップロード進捗バーを表示する例です。

```blade
<form wire:submit="save">
    <div
        x-data="{ uploading: false, progress: 0 }"
        x-on:livewire-upload-start="uploading = true"
        x-on:livewire-upload-finish="uploading = false"
        x-on:livewire-upload-cancel="uploading = false"
        x-on:livewire-upload-error="uploading = false"
        x-on:livewire-upload-progress="progress = $event.detail.progress"
    >
        <!-- ファイル入力 -->
        <input type="file" wire:model="photo">

        <!-- 進捗バー -->
        <div x-show="uploading">
            <progress max="100" x-bind:value="progress"></progress>
        </div>
    </div>

    <!-- ... -->
</form>
```

## アップロードをキャンセルする

アップロードに時間がかかっている場合、ユーザーはキャンセルしたいかもしれません。JavaScriptのLivewire `$cancelUpload()` 関数でこの機能を提供できます。

`wire:click` でクリックイベントを処理し、Livewireコンポーネントに「アップロードをキャンセル」ボタンを作る例です。

```blade
<form wire:submit="save">
    <!-- ファイル入力 -->
    <input type="file" wire:model="photo">

    <!-- アップロードキャンセルボタン -->
    <button type="button" wire:click="$cancelUpload('photo')">アップロードをキャンセル</button>

    <!-- ... -->
</form>
```

「アップロードをキャンセル」を押すと、ファイルアップロードのリクエストが中断され、ファイル入力がクリアされます。ユーザーは別のファイルで再度アップロードできます。

Alpineから `cancelUpload(...)` を呼び出すこともできます。

```blade
<button type="button" x-on:click="$wire.cancelUpload('photo')">アップロードをキャンセル</button>
```

## JavaScriptアップロードAPI

単純な `<input type="file" wire:model="...">` より細かい制御が必要なサードパーティのファイルアップロードライブラリを統合する場合があります。

その場合、Livewireは専用のJavaScript関数を提供します。これらの関数はJavaScriptコンポーネントオブジェクトにあり、コンポーネントのテンプレート内では便利な `$wire` オブジェクトからアクセスできます。

```blade
<script>
    let file = $wire.el.querySelector('input[type="file"]').files[0]

    // ファイルをアップロード...
    $wire.upload('photo', file, (uploadedFilename) => {
        // 成功時のコールバック...
    }, () => {
        // エラー時のコールバック...
    }, (event) => {
        // 進捗コールバック...
        // event.detail.progressには進捗中の1〜100の数値が入る
    }, () => {
        // キャンセル時のコールバック...
    })

    // 複数ファイルをアップロード...
    $wire.uploadMultiple('photos', [file], successCallback, errorCallback, progressCallback, cancelledCallback)

    // 複数ファイルから単一ファイルを削除...
    $wire.removeUpload('photos', uploadedFilename, successCallback)

    // アップロードをキャンセル...
    $wire.cancelUpload('photos')
</script>
```

## 設定

Livewireは開発者がすべてのファイルをバリデーションまたは保存するまで一時保存するため、すべてのファイルアップロードにデフォルトの処理を適用します。

### グローバルバリデーション

デフォルトでは、Livewireはすべての一時ファイルアップロードを `file|max:12288`（12MB未満のファイル）でバリデーションします。

ルールを変更するには、アプリケーションの `config/livewire.php` で設定します。

```php
'temporary_file_upload' => [
    // ...
    'rules' => 'file|mimes:png,jpg,pdf|max:102400', // 最大100MB、PNG・JPEG・PDFのみ
],
```

### グローバルミドルウェア

一時ファイルアップロードのエンドポイントには、デフォルトでスロットリング用ミドルウェアが割り当てられます。設定で使うミドルウェアを変更できます。

```php
'temporary_file_upload' => [
    // ...
    'middleware' => 'throttle:5,1', // ユーザーごとに1分あたり5件だけ許可
],
```

### 一時アップロードディレクトリ

一時ファイルは指定したディスクの `livewire-tmp/` ディレクトリへアップロードされます。設定でディレクトリを変更できます。

```php
'temporary_file_upload' => [
    // ...
    'directory' => 'tmp',
],
```

## 関連項目

- **[フォーム](/forms)** — フォームでファイルアップロードを扱う
- **[バリデーション](/validation)** — アップロードしたファイルを検証する
- **[ローディング状態](/loading-states)** — アップロードの進捗表示を行う
- **[wire:model](https://livewire.laravel.com/docs/4.x/wire-model)** — ファイル入力をプロパティへバインドする

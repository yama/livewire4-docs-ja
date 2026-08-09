Livewireコントリビューションガイドへようこそ。このガイドでは、新機能の追加、失敗するテストの修正、バグ解決によってLivewireへ貢献する方法を説明します。

## LivewireとAlpineをローカルにセットアップする

LivewireとAlpineのリポジトリをローカルに用意すると、変更とテストを簡単に実行できます。

### リポジトリをフォーク・クローンする

[GitHub CLI](https://cli.github.com/)でリポジトリをフォーク・クローンします。手動の場合はLivewireの[リポジトリページ](https://github.com/livewire/livewire)からForkを選びます。

```shell
# Livewireをフォーク・クローン
gh repo fork livewire/livewire --default-branch-only --clone=true -- livewire
cd livewire
composer install
vendor/bin/dusk-updater detect --no-interaction
```

Alpineには[NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)を用意し、次を実行します。[Alpineリポジトリ](https://github.com/alpinejs/alpine)から手動でForkすることもできます。

```shell
gh repo fork alpinejs/alpine --default-branch-only --clone=true --remote=false -- alpine
cd alpine
npm install
npm run build
cd packages/alpinejs && npm link && cd ../../
cd packages/anchor && npm link && cd ../../
cd packages/collapse && npm link && cd ../../
cd packages/csp && npm link && cd ../../
cd packages/docs && npm link && cd ../../
cd packages/focus && npm link && cd ../../
cd packages/history && npm link && cd ../../
cd packages/intersect && npm link && cd ../../
cd packages/mask && npm link && cd ../../
cd packages/morph && npm link && cd ../../
cd packages/navigate && npm link && cd ../../
cd packages/persist && npm link && cd ../../
cd packages/sort && npm link && cd ../../
cd packages/ui && npm link && cd ../../
cd ../livewire
npm link alpinejs @alpinejs/anchor @alpinejs/collapse @alpinejs/csp @alpinejs/docs @alpinejs/focus @alpinejs/history @alpinejs/intersect @alpinejs/mask @alpinejs/morph @alpinejs/navigate @alpinejs/persist @alpinejs/sort @alpinejs/ui
npm run build
```

## 失敗するテストに貢献する

バグの解決方法が不明な場合は、失敗するテストを追加するのが最も簡単です。Livewireのコアも調べて動作を理解することを推奨します。

### 1. テストを追加する場所を決める

コアは機能ごとのフォルダーに分かれています。たとえば次のような場所があります。

```shell
src/Features/SupportAccessingParent
src/Features/SupportAttributes
src/Features/SupportAutoInjectedAssets
src/Features/SupportBladeAttributes
src/Features/SupportChecksumErrorDebugging
src/Features/SupportComputed
src/Features/SupportConsoleCommands
src/Features/SupportDataBinding
//...
```

バグに関連する機能を探します。見つからなければ1つ選び、正しい機能セットへの配置に助けが必要だとPRに書いてください。

### 2. テストの種類を決める

1. **ユニットテスト**：LivewireのPHP実装を検証する
2. **ブラウザテスト**：実ブラウザで手順を実行し、主にJavaScript実装を検証する

迷う場合は、アプリケーションとブラウザでバグを再現するブラウザテストから始めます。ユニットテストは`UnitTest.php`、ブラウザテストは`BrowserTest.php`に追加し、ファイルがなければ作成します。

**ユニットテスト**
```php
use Tests\TestCase;
class UnitTest extends TestCase
{
    public function test_livewire_can_run_action(): void
    {
       // ...
    }
}
```

**ブラウザテスト**
```php
use Tests\BrowserTestCase;
class BrowserTest extends BrowserTestCase
{
    public function test_livewire_can_run_action()
    {
        // ...
    }
}
```

> [!tip] テストの書き方がわからない場合
> 既存のユニット・ブラウザテストを調べてください。既存テストをコピーするのもよい出発点です。

### 3. テストを実行する

PRを送る前にテストが通ることを確認します。

```shell
vendor/bin/phpunit --filter "test_can_make_method_a_computed" # 特定テスト
vendor/bin/phpunit # すべてのテスト
```

ブラウザテストはデフォルトでheadedモードです。headlessにするにはリポジトリのルートに`.env`を作り、`DUSK_HEADLESS_DISABLED=false`を追加します。

### 4. PRブランチを準備する

完成した機能や失敗テストは`main`ではない別ブランチへコミットします。

```shell
git checkout -b my-feature
```

説明的なブランチ名を使い、`git add .`と`git commit -m "Add my feature"`でコミットします。Forkしたリポジトリへpushします。

```shell
git push origin my-feature

Enumerating objects: 13, done.
Counting objects: 100% (13/13), done.
Delta compression using up to 8 threads
Compressing objects: 100% (6/6), done.

To github.com:Username/livewire.git
 * [new branch]        my-feature -> my-feature
```

### 5. PRを送信する

ForkしたLivewireリポジトリ（`https://github.com/<your-username>/livewire`）を開き、「Compare & pull request」をクリックします。タイトルを付け、説明テンプレートの質問にすべて回答してください。

```text
Review the contribution guide first at: https://livewire.laravel.com/docs/contribution-guide

1️⃣ Is this something that is wanted/needed? Did you create a discussion about it first?
Yes, you can find the discussion here: https://github.com/livewire/livewire/discussions/999999

2️⃣ Did you create a branch for your fix/feature? (Main branch PR's will be closed)
Yes, the branch is named `my-feature`

3️⃣ Does it contain multiple, unrelated changes? Please separate the PRs out.
No, the changes are only related to my feature.

4️⃣ Does it include tests? (Required)
Yes

5️⃣ Please include a thorough description (including small code snippets if possible) of the improvement and reasons why it's useful.

These changes will improve memory usage. You can see the benchmark results here:

// ...
```

「Create pull request」をクリックすれば完了です。メンテナーはレビューや修正依頼を行うことがありますので、できるだけ早く対応してください。

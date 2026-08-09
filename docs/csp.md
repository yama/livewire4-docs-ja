# CSP（Content Security Policy）ビルド

LivewireにはCSPセーフビルドがあり、`'unsafe-eval'`を禁止する厳格なCSPヘッダー環境でもアプリケーションを使えます。

## Content Security Policy（CSP）とは

CSPはXSSやコードインジェクションなどの攻撃を防ぐセキュリティ標準です。ブラウザが読み込み・実行できるリソースを開発者が制御できます。

最も制限の強いディレクティブの1つが`'unsafe-eval'`です。省略すると`eval()`や`new Function()`など、実行時に文字列をコードとしてコンパイル・実行する関数をJavaScriptが使えません。

### CSPがLivewireに与える影響

Livewire（および内部のAlpine.js）はデフォルトで`new Function()`を使い、次のようなHTML属性のJavaScript式をコンパイル・実行します。

```html
<button wire:click="$set('count', count + 1)">増加</button>
<div wire:show="user.role === 'admin'">管理パネル</div>
```

`eval()`を直接使うより高速・安全ですが、多くのセキュリティ重視アプリケーションが強制する`'unsafe-eval'`に違反します。

## CSPセーフモードを有効にする

アプリケーション設定を変更します。

### 設定

`config/livewire.php`で`csp_safe`を`true`にします。

```php
'csp_safe' => true,
```

## Alpine.jsへの影響

**重要：** LivewireでCSPセーフモードを有効にすると、アプリケーション内のすべてのAlpine.js機能にも影響します。AlpineはCSPセーフ評価器を自動的に使い、アプリ全体のAlpine式が同じ解析制限を受けます。

## 対応しているもの

### 基本的なLivewire式
```html
<!-- ✅ 動作する -->
<button wire:click="increment">+</button>
<button wire:click="decrement">-</button>
<button wire:click="reset">リセット</button>
<button wire:click="save">保存</button>
<input wire:model="name">
<input wire:model.live="search">
```

### パラメータ付きメソッド呼び出し
```html
<!-- ✅ 動作する -->
<button wire:click="updateUser('John', 25)">ユーザーを更新</button>
<button wire:click="setCount(42)">カウントを設定</button>
<button wire:click="saveData({ name: 'John', age: 30 })">オブジェクトを保存</button>
```

### プロパティのアクセスと更新
```html
<!-- ✅ 動作する -->
<input wire:model="user.name">
<input wire:model="settings.theme">
<button wire:click="$set('user.active', true)">有効化</button>
<div wire:show="user.role === 'admin'">管理パネル</div>
```

### Alpineの基本式
```html
<!-- ✅ 動作する -->
<div x-data="{ count: 0, name: 'Livewire' }" wire:ignore>
    <button x-on:click="count++">増加</button>
    <span x-text="count"></span>
    <span x-text="'Hello ' + name"></span>
    <div x-show="count > 5">カウントが大きい！</div>
</div>
```

## 対応していないもの

### 複雑なJavaScript式
```html
<!-- ❌ 動作しない -->
<button wire:click="items.filter(i => i.active).length">有効数</button>
<div wire:show="users.some(u => u.role === 'admin')">管理者あり</div>
<button wire:click="(() => console.log('Hi'))()">複雑な関数</button>
```

### テンプレートリテラルと高度な構文
```html
<!-- ❌ 動作しない -->
<div x-text="`Hello ${name}`">不可</div>
<div x-data="{ ...defaults }">不可</div>
<button x-on:click="() => doSomething()">不可</button>
```

### 動的なプロパティアクセス
```html
<!-- ❌ 動作しない -->
<div wire:show="user[dynamicProperty]">不可</div>
<button wire:click="this[methodName]()">不可</button>
```

## 制限への対処

複雑なAlpine式には`Alpine.data()`を使うか、ロジックをメソッドへ移します。

```html
<div x-data="users">
    <div x-show="hasActiveAdmins">管理パネルを利用できます</div>
    <span x-text="activeUserCount">0</span>
</div>

<script nonce="[nonce]">
    Alpine.data('users', () => ({
        users: ...,
        get hasActiveAdmins() {
            return this.users.filter(u => u.active && u.role === 'admin').length > 0;
        },
        get activeUserCount() {
            return this.users.filter(u => u.active).length;
        }
    }));
</script>
```

## CSPヘッダーの例

```text
Content-Security-Policy: default-src 'self';
                        script-src 'nonce-[random]' 'strict-dynamic';
                        style-src 'self' 'unsafe-inline';
```

要点は次のとおりです。

- `script-src`から`'unsafe-eval'`を削除する
- `'nonce-[random]'`によるnonceベースのスクリプト読み込みを使う
- 動的に読み込まれるスクリプトとの互換性向上のため`'strict-dynamic'`を検討する

## パフォーマンス上の注意

CSPセーフビルドは別の式評価器を使います。
- **解析**：初回解析が少し遅い（通常は無視できる程度）
- **実行時**：単純な式は同程度
- **バンドルサイズ**：カスタムパーサーのため少し大きい

多くのアプリケーションでは差は感じられませんが、用途に合わせてテストしてください。

## CSP実装をテストする

1. WebサーバーまたはアプリケーションでCSPヘッダーを有効にする
2. ブラウザの開発者ツールでテストする（違反はコンソールに表示される）
3. 式が動作することを確認する
4. コンソールエラーがないことを確認する（`unsafe-eval`違反がない）

## CSPセーフモードを使う場面

* 厳格なCSP準拠が必要
* セキュリティ重視の環境向けアプリケーションを作る
* 組織のセキュリティポリシーで`'unsafe-eval'`が禁止されている
* CSP制限が必須のプラットフォームへデプロイする

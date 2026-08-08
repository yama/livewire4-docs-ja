Livewireでは、`wire:model`を使ってフォーム入力とコンポーネントプロパティの値を簡単にバインドできます。

以下は、「投稿を作成」コンポーネントで`$title`と`$content`プロパティをフォーム入力へバインドする例です。

```php
use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    public $title = '';

    public $content = '';

    public function save()
    {
		$post = Post::create([
			'title' => $this->title
			'content' => $this->content
		]);

        // ...
    }
}
```

```blade
<form wire:submit="save">
    <label>
        <span>タイトル</span>

        <input type="text" wire:model="title"> <!-- [tl! highlight] -->
    </label>

    <label>
        <span>本文</span>

        <textarea wire:model="content"></textarea> <!-- [tl! highlight] -->
    </label>

	<button type="submit">保存</button>
</form>
```

両方の入力が`wire:model`を使っているため、「保存」ボタンを押すと値がサーバー上のプロパティと同期されます。

> [!warning] 「入力中にコンポーネントがリアルタイム更新されないのはなぜですか？」
> ブラウザで試してタイトルが自動更新されないのは、Livewireがユーザーの入力時ではなく、送信ボタンを押すような「アクション」が送信されたときだけコンポーネントを更新するためです。これによりネットワークリクエストを減らし、パフォーマンスを向上させます。入力中の「ライブ」更新を有効にするには、代わりに`wire:model.live`を使います。[データバインディングについて詳しく見る](/properties#data-binding)

## 更新タイミングをカスタマイズする

デフォルトでは、`wire:model`入力が更新されたときではなく、アクション（`wire:click`や`wire:submit`など）が実行されたときだけネットワークリクエストを送信します。

これによりネットワークリクエストが減り、Livewireのパフォーマンスが大幅に向上して、より滑らかな体験を提供できます。

ただし、リアルタイムバリデーションなど、より頻繁にサーバーを更新したい場合もあります。

### ライブ更新

入力欄への入力中にプロパティの更新をサーバーへ送るには、`wire:model`に`.live`モディファイアを追加します。

```html
<input type="text" wire:model.live="title">
```

#### デバウンスをカスタマイズする

`wire:model.live`を使うと、デフォルトでサーバー更新に150ミリ秒のデバウンスが追加されます。入力を続けている間、入力が150ミリ秒止まるまでLivewireがリクエストを待つという意味です。

`.live`の後に`.debounce.Xms`を追加すると、この時間を変更できます。デバウンスを250ミリ秒にする例です。

```html
<input type="text" wire:model.live.debounce.250ms="title">
```

### 「blur」イベントで更新する

`.blur`モディファイアを使うと、入力欄からクリックして離れるまで同期を遅延できます。

```html
<input type="text" wire:model.blur="title">
```

blur時にネットワークリクエストも送信するには、`.live`を追加します。

```html
<input type="text" wire:model.blur.live="title">
```

### 「change」イベントで更新する

`.change`モディファイアはchangeイベントでトリガーされ、select要素に便利です。

```html
<select wire:model.change="state">...</select>

<!-- ネットワークリクエスト付き -->
<select wire:model.change.live="state">...</select>
```

### 「enter」キーで更新する

`.enter`モディファイアはEnterキーを押したときに同期します。

```html
<input type="text" wire:model.enter="search">

<!-- ネットワークリクエスト付き -->
<input type="text" wire:model.enter.live="search">
```

## 入力フィールド

Livewireはほとんどのネイティブ入力要素をそのままサポートします。ブラウザの入力要素に`wire:model`を付けるだけで、プロパティを簡単にバインドできます。

利用可能な入力タイプと、Livewireでの使い方を説明します。

### テキスト入力

まず、テキスト入力は多くのフォームの基礎です。`title`という名前のプロパティをバインドする方法は次のとおりです。

```blade
<input type="text" wire:model="title">
```

### textarea入力

textarea要素も同様に簡単です。textareaに`wire:model`を追加するだけで値がバインドされます。

```blade
<textarea type="text" wire:model="content"></textarea>
```

`content`が文字列で初期化されていれば、Livewireがtextareaをその値で埋めるため、次のようにする必要はありません。

```blade
<!-- 警告：これはしてはいけないことを示す例です... -->

<textarea type="text" wire:model="content">{{ $content }}</textarea>
```

### チェックボックス

チェックボックスは、booleanプロパティの切り替えのような単一値にも、関連する値のグループから1つの値を切り替える用途にも使えます。両方を説明します。

#### 単一チェックボックス

登録フォームの最後に、メール更新を受け取るためのチェックボックスを置くとします。このプロパティを`$receiveUpdates`と呼ぶことにします。`wire:model`を使って簡単にバインドできます。

```blade
<input type="checkbox" wire:model="receiveUpdates">
```

`$receiveUpdates`が`false`ならチェックが外れ、`true`ならチェックされます。

#### 複数チェックボックス

更新を受け取るかどうかに加え、複数の更新タイプから選べる`$updateTypes`配列プロパティがクラスにあるとします。

```php
public $updateTypes = [];
```

複数のチェックボックスを`$updateTypes`にバインドすると、複数のタイプを選択でき、`$updateTypes`配列に追加されます。

```blade
<input type="checkbox" value="email" wire:model="updateTypes">
<input type="checkbox" value="sms" wire:model="updateTypes">
<input type="checkbox" value="notification" wire:model="updateTypes">
```

最初の2つをチェックして3つ目をチェックしなければ、`$updateTypes`の値は`["email", "sms"]`になります。

### ラジオボタン

1つのプロパティで2つの値を切り替えるには、ラジオボタンを使えます。

```blade
<input type="radio" value="yes" wire:model="receiveUpdates">
<input type="radio" value="no" wire:model="receiveUpdates">
```

### selectドロップダウン

Livewireでは`<select>`ドロップダウンも簡単に扱えます。ドロップダウンに`wire:model`を追加すると、現在選択されている値が指定したプロパティ名にバインドされ、その逆も行われます。

選択するoptionに手動で`selected`を付ける必要もありません。Livewireが自動的に処理します。

静的な州リストを入れたselectの例です。

```blade
<select wire:model="state">
    <option value="AL">アラバマ州</option>
    <option value="AK">アラスカ州</option>
    <option value="AZ">アリゾナ州</option>
    ...
</select>
```

「アラスカ州」を選ぶと、コンポーネントの`$state`プロパティは`AK`になります。`AK`ではなく「アラスカ州」を値にしたい場合は、`<option>`要素の`value=""`属性を完全に省略できます。

Bladeでドロップダウンの選択肢を動的に構築することもよくあります。

```blade
<select wire:model="state">
    @foreach (\App\Models\State::all() as $state)
        <option value="{{ $state->id }}">{{ $state->label }}</option>
    @endforeach
</select>
```

デフォルトで選択された項目がない場合は、「州を選択」のような薄いプレースホルダーを表示できます。

```blade
<select wire:model="state">
    <option disabled value="">州を選択...</option>

    @foreach (\App\Models\State::all() as $state)
        <option value="{{ $state->id }}">{{ $state->label }}</option>
    @endforeach
</select>
```

テキスト入力のようなselectメニューの`placeholder`属性はありません。そのため、リストの最初に`disabled`なoption要素を追加します。

### 依存するselectドロップダウン

あるselectメニューを別のselectメニューに依存させたいことがあります。たとえば、選択された州に応じて都市一覧を変える場合です。

ほとんどは期待どおり動きますが、重要な注意点があります。選択肢が変わったときにLivewireが値を正しく更新できるよう、変化するselectに`wire:key`を追加する必要があります。

州用と都市用の2つのselectの例です。

```blade
<!-- 州のselect... -->
<select wire:model.live="selectedState">
    @foreach (State::all() as $state)
        <option value="{{ $state->id }}">{{ $state->label }}</option>
    @endforeach
</select>

<!-- 州に依存する都市のselect... -->
<select wire:model.live="selectedCity" wire:key="{{ $selectedState }}"> <!-- [tl! highlight] -->
    @foreach (City::whereStateId($selectedState->id)->get() as $city)
        <option value="{{ $city->id }}">{{ $city->label }}</option>
    @endforeach
</select>
```

ここで標準と異なるのは2つ目のselectに追加された`wire:key`だけです。これにより州が変わったとき、`selectedCity`の値が正しくリセットされます。

### 複数選択ドロップダウン

`multiple`なselectメニューも期待どおり動作します。次の例では、選択した州が`$states`配列プロパティに追加され、選択を解除すると削除されます。

```blade
<select wire:model="states" multiple>
    <option value="AL">アラバマ州</option>
    <option value="AK">アラスカ州</option>
    <option value="AZ">アリゾナ州</option>
    ...
</select>
```

## イベントの伝播

デフォルトでは、`wire:model`は要素自身から直接発生したinput/changeイベントだけをリッスンし、子要素からバブルアップしたイベントはリッスンしません。これにより、ほかのフォーム入力を含むモーダルやアコーディオンなどのコンテナ要素で予期しない動作を防ぎます。

たとえば、`wire:model="showModal"`を持つモーダル内に入力欄があっても、その入力をクリアしたchangeイベントがバブルアップしてモーダルを誤って閉じることはありません。

### 子要素のイベントをリッスンする

まれに、子要素からバブルアップするイベントにも`wire:model`を応答させたい場合は、`.deep`モディファイアを使います。

```blade
<div wire:model.deep="value">
    <input type="text"> <!-- ここでの変更が$valueを更新する -->
</div>
```

> [!warning] `.deep`は慎重に使う
> 多くの用途では子要素のイベントをリッスンする必要はありません。子孫要素からのイベントを捕捉する必要がある場合だけ`.deep`を使ってください。

## ネストしたプロパティへアクセスする

`wire:model`は、ネストしたプロパティ、配列要素、フォームオブジェクトのフィールドへのバインドにドット記法をサポートします。

```blade
<input type="text" wire:model="address.city">

<input type="text" wire:model="items.0.name">

<input type="text" wire:model="form.title">
```

代替としてブラケット記法も使えます。

```blade
<input type="text" wire:model="address['city']">

<input type="text" wire:model="items[0].name">
```

どちらも同じ意味で、`address['city']`は`address.city`と同じパスに解決されます。1つの式の中でブラケット記法とドット記法を自由に混在できます。

## レンダリングをスキップする

`.renderless`モディファイアは、コンポーネントを再レンダリングせずにライブモデルの更新をサーバーへ送ります。

```blade
<input type="text" wire:model.renderless.live="search">
```

サーバーにモデルの更新を保存する必要はあるものの、メッセージ完了後に現在のDOMをモーフィングしたくない場合に便利です。

`.renderless`はサーバーメッセージにだけ影響するため、`.live`と一緒に使ってください。

## さらに詳しく

HTMLフォームで`wire:model`を使う詳しい説明は、[Livewireのフォームドキュメント](/forms)を参照してください。

## 関連項目

- **[フォーム](/forms)** — Livewireでフォームを構築する完全ガイド
- **[プロパティ](/properties)** — データバインディングとプロパティ管理を理解する
- **[バリデーション](/validation)** — バインドしたプロパティをリアルタイムでバリデーションする
- **[ファイルアップロード](/uploads)** — `wire:model`でファイル入力をバインドする

## リファレンス

```blade
wire:model="propertyName"
wire:model="property.nested"
wire:model="property['nested']"
wire:model="property[0]"
```

### モディファイア

| モディファイア | 説明 |
|----------|-------------|
| `.live` | 更新をサーバーへ送る |
| `.blur` | blur時だけ更新する |
| `.change` | change時だけ更新する |
| `.enter` | Enterキーでだけ更新する |
| `.lazy` | change時に更新してネットワークリクエストを送る（v3互換） |
| `.debounce.Xms` | 更新をデバウンスする（`.live`と一緒に使う） |
| `.throttle.Xms` | 更新をスロットリングする（`.live`と一緒に使う） |
| `.number` | サーバー上で値を`int`にキャストする |
| `.boolean` | サーバー上で値を`bool`にキャストする |
| `.fill` | HTMLの`value`属性にある初期値を使う |
| `.deep` | 子要素からのイベントもリッスンする |
| `.renderless` | ライブモデル更新後の再レンダリングをスキップする |
| `.preserve-scroll` | 更新中もスクロール位置を維持する |

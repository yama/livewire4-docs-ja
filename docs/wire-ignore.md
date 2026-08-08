Livewireがページを更新できることが「ライブ」である理由ですが、ページの一部をLivewireに更新させたくない場合もあります。

その場合は `wire:ignore` ディレクティブを使い、リクエスト間で変更されても特定の要素の内容をLivewireが無視するよう指示できます。

これは、カスタムフォーム入力など、サードパーティのJavaScriptライブラリと連携するときに特に便利です。

以下はサードパーティライブラリが生成したHTMLへLivewireが干渉しないよう、ライブラリが使う要素を `wire:ignore` で囲む例です。

```blade
<form>
    <!-- ... -->

    <div wire:ignore>
        <!-- サードパーティライブラリが初期化時に参照する要素... -->
        <input id="id-for-date-picker-library">
    </div>

    <!-- ... -->
</form>
```

`wire:ignore.self` を使うと、要素の内容ではなくルート要素の属性変更だけを無視するようLivewireへ指示できます。

```blade
<div wire:ignore.self>
    <!-- ... -->
</div>
```

## リファレンス

```blade
wire:ignore
```

### 修飾子

| 修飾子 | 説明 |
| --- | --- |
| `.self` | 子要素ではなく、要素自身の属性変更だけを無視する |

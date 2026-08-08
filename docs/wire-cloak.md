`wire:cloak` は、Livewireが完全に初期化されるまでページロード時に要素を隠すディレクティブです。Livewireが初期化する前にページが読み込まれることで発生する「スタイル未適用コンテンツのちらつき」を防ぐのに便利です。

## 基本的な使い方

ページロード中に隠したい要素へディレクティブを追加します。

```blade
<div wire:cloak>
    Livewireの読み込みが完了するまで、この内容は隠されます
</div>
```

### 動的なコンテンツ

`wire:cloak` は、`wire:show` で表示・非表示を切り替える要素など、初期化されていない動的コンテンツをユーザーに見せたくない場合に特に便利です。

```blade
<div>
    <div wire:show="starred" wire:cloak>
        <!-- 黄色い星のアイコン... -->
    </div>

    <div wire:show="!starred" wire:cloak>
        <!-- 灰色の星のアイコン... -->
    </div>
</div>
```

上の例で `wire:cloak` がなければ、Livewireの初期化前に両方のアイコンが表示されます。`wire:cloak` があると、初期化が完了するまで両方の要素が隠されます。

## リファレンス

```blade
wire:cloak
```

このディレクティブに修飾子はありません。

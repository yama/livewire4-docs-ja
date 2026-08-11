---
name: review-web-ui
description: WebページをPlaywrightでdesktop/mobile確認し、DOM・CSS・spacing・typographyと視覚的な関係を診断し、ユーザーがレビューのみを求めていない限り実装修正・再計測・再評価まで行う。spacing・alignment・typography・contrast・container・responsive behaviorなどの問題を根拠付きで改善するときに使う。
---

# Web UIデザインレビュー

## 目的

「整っていない」「AI生成っぽい」「一見きれいだが違和感がある」を、好みではなく観測事実・デザイン原則・ページ文脈から説明する。CSSの機械的な採点ではなく、デザイン上の選択が視覚的・意味的に説明できるかを評価する。

## 標準改善ループ

レビューのみが明示されていない場合は、次のループを完了させる。問題を報告しただけで完了扱いにしない。

`Observe → Diagnose → Edit → Render → Measure → Judge → Iterate`

1. **Observe**: Playwrightでdesktop/mobileをレンダリングし、full-page screenshot、DOM、bounding box、computed style、spacing rhythm、typographyを保存する。
2. **Diagnose**: screenshot上の視覚判断とDOM/CSSの事実を分離し、重要度の高い問題から改善仮説を立てる。
3. **Edit**: 対象プロジェクトのHTML/CSS/コンポーネントを修正する。既存のデザイン意図と機能を維持し、ページ全体の規則性から値を決める。単独の数値置換で済ませない。
4. **Render**: 同じURL・同じdesktop/mobile viewportで再レンダリングし、修正後のscreenshotを保存する。
5. **Measure**: 同じ計測を再実行し、spacing、typography、alignment、overflow、主要要素の位置を修正前後で比較する。
6. **Judge**: 修正した箇所だけでなく、screenshot全体をVisual Designとして再レビューする。新しい不整合、desktop/mobile間の副作用、既存機能の破損を確認する。
7. **Iterate**: 重要な問題が残る、または副作用がある場合は追加修正して再度Render以降を行う。十分に改善したら、変更ファイル・比較結果・残課題を報告する。

ユーザーが「レビューのみ」「診断のみ」を明示した場合は、Diagnoseまでで停止し、編集しない。ユーザーがコンテンツ変更を禁止した場合はCSS・レイアウト・タイポグラフィ・色・余白だけを編集対象にする。コンテンツ変更が不可欠な場合は、先に理由と最小変更案を示して確認を求める。

## 観測手順

1. 対象URL、ページ目的、想定ユーザー、主要な行動を確認する。分からない場合は、ページ内容から仮説を置き、仮説であると明記する。
2. **Playwrightを必ずヘッドレスで実行する。** desktop（1440×900程度）とmobile（390×844程度）の両方をレンダリングし、各viewportのfull-pageスクリーンショットを保存する。通常は `node .agents/skills/review-web-ui/scripts/capture-web-ui.mjs <URL> <出力ルート> <run-label>` を使い、`before` と `after` のように別ラベルで保存して比較可能にする。同じ出力先を再利用して既存artifactを上書きしない。localhostを確認するときだけ `ALLOW_LOCALHOST_REVIEW=1` を明示する。Playwrightまたはブラウザが未導入なら、レビューを完了扱いにせず、導入方法を示して停止する。
3. スクリーンショットを目視し、視線、余白、整列、折返し、表示順、密度、装飾、操作対象を確認する。desktopとmobileで同じ問題が再現するか、viewport固有の問題かを分ける。
4. 同じPlaywrightセッションまたは取得JSONからDOM、見出し階層、繰り返しコンポーネント、文章量、リンク・ボタンの役割、bounding box、computed styleを確認する。
5. **スクリーンショットからの視覚判断と、DOM/CSSから確認した事実を分けて記録し、最後に組み合わせる。** 視覚判断だけで数値を推測せず、DOM/CSSだけで「見た目」を断定しない。
6. 主要要素のbounding boxから、隣接要素間の実距離を計測する。少なくとも `header→hero title→tagline→CTA→features→本文→footer`、本文がある場合は段落間も確認する。個々のmargin値ではなく、視覚的な境界から次の視覚的な境界までの距離を使う。
7. spacing rhythmを、近接（同一グループ）、中距離（同一セクション内の階層）、遠距離（セクション分離）に分類する。距離の大小とDOM上のグループ構造が一致しない箇所を、余白の不揃い・階層の弱さ・過剰な空白の候補として検討する。
8. typographyはcomputed styleを列挙するだけで終えず、ページ内の文字階層をまとめる。font-size、font-weight、line-height、colorの組み合わせをグループ化し、近似したサイズ・weightが多すぎて階層差が知覚しにくくなっていないか確認する。日本語では、英字と和文の見かけの大きさ・折返しもスクリーンショットで確認する。
9. 以下の順に診断する。各段階で、観測事実と解釈を分ける。
   - **観測可能な規則**: spacing scale、整列、font-size/line-height、色とコントラスト、container幅、border/radius/shadow、responsive behavior、アクセシビリティ。
   - **関係性**: グループ内とグループ間の余白、視覚的な基準線、情報の強弱、見出し階層、密度、同種コンポーネントの一貫性、文章量と形のバランス。
   - **文脈依存の仮説**: CTAの強さ、headerとmainの境界、ブランド性、技術文書としての密度、装飾の必要性。目的が不明なら断定しない。
10. 影響の大きい構造・階層・可読性の問題を先に並べる。8pxなどの単一ルールに合わせること自体を目的にしない。数値の不一致は、関係性や意味を損ねるときだけ問題化する。
11. ユーザーがvisual-only、CSS-onlyなど範囲を指定した場合は、コンテンツ変更案を出さない。範囲外の原因は「未評価」または「次回検討」と記録する。

## 指摘の形式

各指摘を次の形式で書く。

- **問題箇所**: selector、領域、見出し、スクリーンショット位置などを具体化する。
- **スクリーンショット上の判断**: 見た目として何が不自然か、desktop/mobileのどちらで見えるかを示す。
- **DOM/CSS上の事実**: selector、bounding box、computed style、文章量、繰り返しを示す。取得できなかった値は推測で補わない。
- **spacing rhythm**: 隣接要素間の実距離、同一グループ内外の距離、desktop/mobile差を示す。
- **typography hierarchy**: 文字階層の段階数、各段階の代表値、近似値が集中している箇所を示す。
- **違和感の原因**: 視線、関連性、階層、密度、可読性などへの影響を説明する。
- **根拠となる原則**: `references/design-principles.md` の該当原則を使う。
- **重要度**: 高（理解・操作・主要目的を阻害）、中（品質や一貫性を下げる）、低（局所的な磨き込み）。
- **改善案**: 最小の変更、必要ならコンテンツ変更、確認すべき代替案を分ける。
- **確信度**: 高（複数の観測で再現）、中（観測はあるが文脈依存）、低（仮説・ヒューリスティック）。低い場合は断定せず「仮説」と書く。

最後に、最初に直す3項目、良い点、未確認事項を短くまとめる。問題がない項目を無理に作らない。

## 参照資料

原則の詳細や日本語資料の位置づけは [references/design-principles.md](references/design-principles.md) を必要なときだけ読む。ブラウザ確認や計測方法を追加するときも、まずこのSKILL.mdの観測→解釈→文脈の分離を維持する。

## 実行リソース

- `scripts/capture-web-ui.mjs`: desktop/mobileのスクリーンショットと、見出し・主要要素のbounding box・computed styleを取得する。

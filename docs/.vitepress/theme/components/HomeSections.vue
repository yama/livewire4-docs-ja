<script setup lang="ts">
import {
  ArrowRight,
  Bolt,
  BookOpen,
  Cable,
  Check,
  Code2,
  FileText,
  FlaskConical,
  GitFork,
  HeartHandshake,
  Layers3,
  MousePointerClick,
  ShieldCheck,
} from '@lucide/vue'
</script>

<template>
  <section class="livewire-home" aria-label="Livewire 4 日本語ドキュメントの案内">
    <div class="livewire-benefits">
      <article class="benefit benefit-reactive">
        <Bolt aria-hidden="true" />
        <div>
          <h2>リアルタイムな体験</h2>
          <p>ページをリロードせず、サーバー側の状態をUIへ自然に反映できます。</p>
        </div>
      </article>
      <article class="benefit benefit-laravel">
        <HeartHandshake aria-hidden="true" />
        <div>
          <h2>Laravel に統合</h2>
          <p>Laravelのエコシステムとつながり、開発の流れを保てます。</p>
        </div>
      </article>
      <article class="benefit benefit-simple">
        <Code2 aria-hidden="true" />
        <div>
          <h2>シンプルで直感的</h2>
          <p>BladeとPHPを中心に、インタラクティブな機能を組み立てられます。</p>
        </div>
      </article>
      <article class="benefit benefit-dx">
        <ShieldCheck aria-hidden="true" />
        <div>
          <h2>開発者に優しい DX</h2>
          <p>テスト、デバッグ、保守を意識した実践的なガイドを提供します。</p>
        </div>
      </article>
    </div>

    <div class="livewire-home-grid">
      <article class="home-panel getting-started">
        <div class="panel-heading"><BookOpen aria-hidden="true" /><h2>はじめよう</h2></div>
        <p>Livewireを使い始めるための、最短の3ステップです。</p>
        <a href="/installation"><span>1</span><strong>インストール</strong><ArrowRight aria-hidden="true" /></a>
        <a href="/quickstart"><span>2</span><strong>最初のコンポーネント</strong><ArrowRight aria-hidden="true" /></a>
        <a href="/forms"><span>3</span><strong>データのやり取り</strong><ArrowRight aria-hidden="true" /></a>
      </article>

      <article class="home-panel directives-panel">
        <div class="panel-heading"><MousePointerClick aria-hidden="true" /><h2>よく使う Wire ディレクティブ</h2></div>
        <div class="directive-list">
          <a href="/wire-click"><code>wire:click</code><span>クリックイベントを処理します。</span></a>
          <a href="/wire-model"><code>wire:model</code><span>入力とプロパティを同期します。</span></a>
          <a href="/wire-submit"><code>wire:submit</code><span>フォーム送信を安全に扱います。</span></a>
          <a href="/wire-loading"><code>wire:loading</code><span>処理中の状態を表示します。</span></a>
          <a href="/wire-poll"><code>wire:poll</code><span>定期的にデータを更新します。</span></a>
          <a href="/wire-navigate"><code>wire:navigate</code><span>ページ遷移を高速にします。</span></a>
        </div>
      </article>

      <article class="home-panel updates-panel">
        <div class="panel-heading"><Layers3 aria-hidden="true" /><h2>Livewire 4 の主要ガイド</h2></div>
        <ul>
          <li><Check aria-hidden="true" />コンポーネントとページの設計</li>
          <li><Check aria-hidden="true" />イベントとローディング状態</li>
          <li><Check aria-hidden="true" />テストとセキュリティ</li>
        </ul>
        <a class="panel-link" href="/components">コンポーネントを読む <ArrowRight aria-hidden="true" /></a>
      </article>
    </div>

    <div class="home-resource-links">
      <a href="/alpine"><Cable aria-hidden="true" /><span><strong>Alpine.jsとの連携</strong><small>軽量なフロントエンド操作を組み合わせる</small></span><ArrowRight aria-hidden="true" /></a>
      <a href="/testing"><FlaskConical aria-hidden="true" /><span><strong>テストを学ぶ</strong><small>自信を持ってコンポーネントを保守する</small></span><ArrowRight aria-hidden="true" /></a>
      <a href="https://github.com/yama/livewire4-docs-ja"><GitFork aria-hidden="true" /><span><strong>GitHubで参加する</strong><small>翻訳へのフィードバックと改善提案</small></span><ArrowRight aria-hidden="true" /></a>
    </div>

    <aside class="unofficial-notice">
      <FileText aria-hidden="true" />
      <p><strong>このサイトについて</strong> このサイトはLivewire 4公式ドキュメントをもとにした非公式日本語版です。内容に差異がある場合は、<a href="https://livewire.laravel.com/docs/4.x/quickstart">公式Docs</a>を優先してください。</p>
    </aside>
  </section>
</template>

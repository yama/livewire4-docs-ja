import { defineConfig } from 'vitepress'

const alpineDocsUrl = 'https://alpinejs-docs-ja.kyms.jp'
const alpineDocsOrigin = 'https://alpinejs.dev'

function rewriteAlpineDocsLink(href: string) {
  if (href === alpineDocsOrigin || href === `${alpineDocsOrigin}/`) {
    return alpineDocsUrl
  }

  if (href.startsWith(`${alpineDocsOrigin}/`)) {
    return `${alpineDocsUrl}${href.slice(alpineDocsOrigin.length)}`
  }

  return href
}

export default defineConfig({
  lang: 'ja',
  title: 'Livewire 4 日本語ドキュメント',
  description: 'Livewire 4 公式ドキュメントの非公式日本語版',
  cleanUrls: true,
  markdown: {
    config(md) {
      const defaultLinkOpenRenderer = md.renderer.rules.link_open

      md.renderer.rules.link_open = (tokens, index, options, env, self) => {
        const href = tokens[index].attrGet('href')

        if (href) {
          tokens[index].attrSet('href', rewriteAlpineDocsLink(href))
        }

        return defaultLinkOpenRenderer
          ? defaultLinkOpenRenderer(tokens, index, options, env, self)
          : self.renderToken(tokens, index, options)
      }
    },
  },
  themeConfig: {
    siteTitle: '<strong>Livewire 4</strong> <small>日本語ドキュメント</small>',
    nav: [
      { text: 'はじめに', link: '/quickstart', activeMatch: '^/(quickstart|installation|upgrading)(/|$|\\.md$)' },
      { text: '基本', link: '/components', activeMatch: '^/(components|pages|properties|actions|forms|events|lifecycle-hooks|nesting|testing)(/|$|\\.md$)' },
      { text: '機能', link: '/alpine', activeMatch: '^/(alpine|styles|navigate|islands|lazy|loading-states|validation|uploads|pagination|url|computed-properties|redirecting|downloads|teleport)(/|$|\\.md$)' },
      { text: 'HTMLディレクティブ', link: '/wire-bind', activeMatch: '^/wire-(bind|click|submit|model|loading|navigate|current|cloak|dirty|confirm|transition|init|intersect|poll|offline|ignore|ref|replace|show|sort|stream|text)(/|$|\\.md$)' },
      { text: 'PHPアトリビュート', link: '/attribute-async', activeMatch: '^/attribute-(async|computed|defer|isolate|js|json|layout|lazy|locked|modelable|on|reactive|renderless|session|title|transition|url|validate)(/|$|\\.md$)' },
      { text: 'Bladeディレクティブ', link: '/directive-island', activeMatch: '^/directive-(island|placeholder|persist|teleport)(/|$|\\.md$)' },
      { text: 'アドバンス', link: '/morph', activeMatch: '^/(morph|hydration|understanding-nesting|troubleshooting|security|csp|javascript|synthesizers|packages|contribution-guide)(/|$|\\.md$)' },
    ],
    sidebar: [
      {
        text: 'はじめに',
        items: [
          { text: 'クイックスタート', link: '/quickstart' },
          { text: 'インストール', link: '/installation' },
          { text: 'アップグレードガイド', link: '/upgrading' },
        ],
      },
      {
        text: '基本',
        items: [
          { text: 'コンポーネント', link: '/components' },
          { text: 'ページ', link: '/pages' },
          { text: 'プロパティ', link: '/properties' },
          { text: 'アクション', link: '/actions' },
          { text: 'フォーム', link: '/forms' },
          { text: 'イベント', link: '/events' },
          { text: 'ライフサイクルフック', link: '/lifecycle-hooks' },
          { text: 'コンポーネントのネスト', link: '/nesting' },
          { text: 'テスト', link: '/testing' },
        ],
      },
      {
        text: '機能',
        items: [
          { text: 'Alpine', link: '/alpine' },
          { text: 'スタイル', link: '/styles' },
          { text: 'ナビゲーション', link: '/navigate' },
          { text: 'Island', link: '/islands' },
          { text: '遅延読み込み', link: '/lazy' },
          { text: 'ローディング状態', link: '/loading-states' },
          { text: 'バリデーション', link: '/validation' },
          { text: 'ファイルアップロード', link: '/uploads' },
          { text: 'ページネーション', link: '/pagination' },
          { text: 'URLクエリパラメータ', link: '/url' },
          { text: '算出プロパティ', link: '/computed-properties' },
          { text: 'リダイレクト', link: '/redirecting' },
          { text: 'ファイルダウンロード', link: '/downloads' },
          { text: 'Teleport', link: '/teleport' },
        ],
      },
      {
        text: 'HTMLディレクティブ',
        items: [
          { text: 'wire:bind', link: '/wire-bind' },
          { text: 'wire:click', link: '/wire-click' },
          { text: 'wire:submit', link: '/wire-submit' },
          { text: 'wire:model', link: '/wire-model' },
          { text: 'wire:loading', link: '/wire-loading' },
          { text: 'wire:navigate', link: '/wire-navigate' },
          { text: 'wire:current', link: '/wire-current' },
          { text: 'wire:cloak', link: '/wire-cloak' },
          { text: 'wire:dirty', link: '/wire-dirty' },
          { text: 'wire:confirm', link: '/wire-confirm' },
          { text: 'wire:transition', link: '/wire-transition' },
          { text: 'wire:init', link: '/wire-init' },
          { text: 'wire:intersect', link: '/wire-intersect' },
          { text: 'wire:poll', link: '/wire-poll' },
          { text: 'wire:offline', link: '/wire-offline' },
          { text: 'wire:ignore', link: '/wire-ignore' },
          { text: 'wire:ref', link: '/wire-ref' },
          { text: 'wire:replace', link: '/wire-replace' },
          { text: 'wire:show', link: '/wire-show' },
          { text: 'wire:sort', link: '/wire-sort' },
          { text: 'wire:stream', link: '/wire-stream' },
          { text: 'wire:text', link: '/wire-text' },
        ],
      },
      {
        text: 'PHPアトリビュート',
        items: [
          { text: 'Async', link: '/attribute-async' },
          { text: 'Computed', link: '/attribute-computed' },
          { text: 'Defer', link: '/attribute-defer' },
          { text: 'Isolate', link: '/attribute-isolate' },
          { text: 'Js', link: '/attribute-js' },
          { text: 'Json', link: '/attribute-json' },
          { text: 'Layout', link: '/attribute-layout' },
          { text: 'Lazy', link: '/attribute-lazy' },
          { text: 'Locked', link: '/attribute-locked' },
          { text: 'Modelable', link: '/attribute-modelable' },
          { text: 'On', link: '/attribute-on' },
          { text: 'Reactive', link: '/attribute-reactive' },
          { text: 'Renderless', link: '/attribute-renderless' },
          { text: 'Session', link: '/attribute-session' },
          { text: 'Title', link: '/attribute-title' },
          { text: 'Transition', link: '/attribute-transition' },
          { text: 'Url', link: '/attribute-url' },
          { text: 'Validate', link: '/attribute-validate' },
        ],
      },
      {
        text: 'Bladeディレクティブ',
        items: [
          { text: '@island', link: '/directive-island' },
          { text: '@placeholder', link: '/directive-placeholder' },
          { text: '@persist', link: '/directive-persist' },
          { text: '@teleport', link: '/directive-teleport' },
        ],
      },
      {
        text: 'アドバンス',
        items: [
          { text: 'Morphing', link: '/morph' },
          { text: 'Hydration', link: '/hydration' },
          { text: 'Nesting', link: '/understanding-nesting' },
          { text: 'Troubleshooting', link: '/troubleshooting' },
          { text: 'Security', link: '/security' },
          { text: 'CSP', link: '/csp' },
          { text: 'JavaScript', link: '/javascript' },
          { text: 'Synthesizers', link: '/synthesizers' },
          { text: 'Package Development', link: '/packages' },
          { text: 'Contribution Guide', link: '/contribution-guide' },
        ],
      },
    ],
    outline: 2,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yama/livewire4-docs-ja' },
    ],
    footer: {
      message: 'Livewire 公式プロジェクトによる公式日本語版ではありません。',
      copyright: 'Copyright © Caleb Porzio. Japanese translation is unofficial.',
    },
  },
})

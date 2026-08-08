import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'ja',
  title: 'Livewire 4 日本語ドキュメント',
  description: 'Livewire 4 公式ドキュメントの非公式日本語版',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: 'ホーム', link: '/' },
      { text: 'ドキュメント', link: '/quickstart' },
      { text: '公式Docs', link: 'https://livewire.laravel.com/docs/4.x/quickstart' },
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

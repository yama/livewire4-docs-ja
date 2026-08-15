<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import { useLocalNav } from 'vitepress/theme'

type SidebarItem = { text: string; link: string; external?: boolean }
type SidebarGroup = { items?: SidebarItem[] }

const { theme } = useData()
const route = useRoute()
const { headers } = useLocalNav()
const nav = ref<HTMLElement | null>(null)
const outlineOpen = ref(false)
const menuOpen = ref(false)
let menuButtonObserver: MutationObserver | undefined

const pageItems = computed(() => {
  const groups = Array.isArray(theme.value.sidebar) ? theme.value.sidebar as SidebarGroup[] : []
  return groups.flatMap(group => group.items ?? []).filter(item => !item.external)
})

const currentIndex = computed(() => pageItems.value.findIndex(item => item.link === route.path))
const previous = computed(() => currentIndex.value > 0 ? pageItems.value[currentIndex.value - 1] : undefined)
const next = computed(() => currentIndex.value >= 0 ? pageItems.value[currentIndex.value + 1] : undefined)

function toggleMenu() {
  closeOutline()
  const menuButton = document.querySelector<HTMLButtonElement>('.VPLocalNav .menu')
  if (!menuButton) {
    menuOpen.value = false
    return
  }

  if (menuButton.getAttribute('aria-expanded') === 'true') {
    document.querySelector<HTMLElement>('.VPBackdrop')?.click()
  } else {
    menuButton.click()
  }
}

function syncMenuState() {
  const menuButton = document.querySelector<HTMLButtonElement>('.VPLocalNav .menu')
  menuOpen.value = menuButton?.getAttribute('aria-expanded') === 'true'
}

function closeOutline() {
  outlineOpen.value = false
}

function handlePointerDown(event: PointerEvent) {
  if (outlineOpen.value && nav.value && !nav.value.contains(event.target as Node)) {
    closeOutline()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeOutline()
}

watch(() => route.path, () => {
  closeOutline()
  menuOpen.value = false
})

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDown)
  document.addEventListener('keydown', handleKeydown)
  syncMenuState()

  const menuButton = document.querySelector<HTMLButtonElement>('.VPLocalNav .menu')
  if (menuButton) {
    menuButtonObserver = new MutationObserver(syncMenuState)
    menuButtonObserver.observe(menuButton, { attributes: true, attributeFilter: ['aria-expanded'] })
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown)
  document.removeEventListener('keydown', handleKeydown)
  menuButtonObserver?.disconnect()
})
</script>

<template>
  <nav ref="nav" class="mobile-bottom-nav" aria-label="ページナビゲーション">
    <button type="button" :aria-label="menuOpen ? 'サイドメニューを閉じる' : 'サイドメニューを開く'" aria-controls="VPSidebarNav" :aria-expanded="menuOpen" @click="toggleMenu">
      <span aria-hidden="true">☰</span>
      <span>メニュー</span>
    </button>
    <a v-if="previous" class="mobile-bottom-nav-page previous" :href="previous.link" aria-label="前のページ" @click="closeOutline">
      <span aria-hidden="true">‹</span>
      <span>前へ</span>
    </a>
    <button type="button" :disabled="!headers.length" :aria-expanded="outlineOpen" aria-controls="mobile-bottom-outline" @click="headers.length && (outlineOpen = !outlineOpen)">
      <span>目次</span>
      <span aria-hidden="true">⌃</span>
    </button>
    <a v-if="next" class="mobile-bottom-nav-page next" :href="next.link" aria-label="次のページ" @click="closeOutline">
      <span>次へ</span>
      <span aria-hidden="true">›</span>
    </a>
    <div v-if="outlineOpen" id="mobile-bottom-outline" class="mobile-bottom-outline">
      <a v-for="header in headers" :key="header.link" :href="header.link" :class="`level-${header.level}`" @click="closeOutline">{{ header.title }}</a>
    </div>
  </nav>
</template>

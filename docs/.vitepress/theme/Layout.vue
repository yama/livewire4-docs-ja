<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import DefaultTheme from 'vitepress/theme'
import HomeHeroArt from './components/HomeHeroArt.vue'
import HomeSections from './components/HomeSections.vue'
import MobileBottomNav from './MobileBottomNav.vue'

const mobileQuery = '(max-width: 639px)'
let lastScrollY = 0
let scrollTicking = false
let scrollFrame: number | undefined
let mobileMediaQuery: MediaQueryList | undefined

function setChromeVisibility(hidden: boolean) {
  document.documentElement.classList.toggle('mobile-chrome-hidden', hidden)
  document.querySelector<HTMLElement>('.VPNav')?.toggleAttribute('inert', hidden)
  document.querySelector<HTMLElement>('.mobile-bottom-nav')?.toggleAttribute('inert', hidden)
}

function setChromeVisible() {
  setChromeVisibility(false)
}

function updateChromeVisibility() {
  scrollTicking = false

  if (!mobileMediaQuery?.matches) {
    setChromeVisible()
    lastScrollY = window.scrollY
    return
  }

  const currentScrollY = window.scrollY
  const scrollDelta = currentScrollY - lastScrollY
  const menuIsOpen = document.querySelector('.VPLocalNav .menu')?.getAttribute('aria-expanded') === 'true'

  if (currentScrollY <= 8 || scrollDelta < 0 || menuIsOpen) {
    setChromeVisible()
  } else if (scrollDelta > 0) {
    setChromeVisibility(true)
  }

  lastScrollY = currentScrollY
}

function handleScroll() {
  if (!scrollTicking) {
    scrollTicking = true
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = undefined
      updateChromeVisibility()
    })
  }
}

function handleMobileBreakpointChange() {
  setChromeVisible()
  lastScrollY = window.scrollY
}

onMounted(() => {
  mobileMediaQuery = window.matchMedia(mobileQuery)
  lastScrollY = window.scrollY
  mobileMediaQuery.addEventListener('change', handleMobileBreakpointChange)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  if (scrollFrame !== undefined) {
    window.cancelAnimationFrame(scrollFrame)
    scrollFrame = undefined
    scrollTicking = false
  }
  mobileMediaQuery?.removeEventListener('change', handleMobileBreakpointChange)
  window.removeEventListener('scroll', handleScroll)
  setChromeVisible()
})
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-hero-image>
      <HomeHeroArt />
    </template>
    <template #home-hero-after>
      <HomeSections />
    </template>
    <template #doc-after>
      <MobileBottomNav />
    </template>
  </DefaultTheme.Layout>
</template>

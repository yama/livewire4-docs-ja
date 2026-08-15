<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import DefaultTheme from 'vitepress/theme'
import HomeHeroArt from './components/HomeHeroArt.vue'
import HomeSections from './components/HomeSections.vue'
import MobileBottomNav from './MobileBottomNav.vue'

const mobileQuery = '(max-width: 639px)'
let lastScrollY = 0
let scrollTicking = false
let mobileMediaQuery: MediaQueryList | undefined

function setChromeVisible() {
  document.documentElement.classList.remove('mobile-chrome-hidden')
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
  const menuIsOpen = document.querySelector('.VPBackdrop') !== null

  if (currentScrollY <= 8 || scrollDelta < 0 || menuIsOpen) {
    setChromeVisible()
  } else if (scrollDelta > 0) {
    document.documentElement.classList.add('mobile-chrome-hidden')
  }

  lastScrollY = currentScrollY
}

function handleScroll() {
  if (!scrollTicking) {
    scrollTicking = true
    window.requestAnimationFrame(updateChromeVisibility)
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

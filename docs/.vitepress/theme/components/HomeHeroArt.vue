<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const { isDark } = useData()
const isDesktop = ref(false)
let mediaQuery: MediaQueryList | undefined

const heroImage = computed(() =>
  isDark.value ? '/images/livewire-hero-dark.png' : '/images/livewire-hero-light.png',
)

const updateViewport = (event?: MediaQueryListEvent) => {
  isDesktop.value = event?.matches ?? mediaQuery?.matches ?? false
}

onMounted(() => {
  mediaQuery = window.matchMedia('(min-width: 640px)')
  updateViewport()
  mediaQuery.addEventListener('change', updateViewport)
})

onUnmounted(() => {
  mediaQuery?.removeEventListener('change', updateViewport)
})
</script>

<template>
  <div v-if="isDesktop" class="livewire-hero-art" aria-hidden="true">
    <img class="hero-art-image" :src="heroImage" alt="" />
  </div>
</template>

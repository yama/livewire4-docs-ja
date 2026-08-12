<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import HomeHeroArt from './components/HomeHeroArt.vue'
import HomeSections from './components/HomeSections.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-hero-image>
      <HomeHeroArt />
    </template>
    <template #home-hero-after>
      <HomeSections />
    </template>
  </DefaultTheme.Layout>
</template>

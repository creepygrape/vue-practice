<script setup>
import UnitToggler from './components/practices/exercise/UnitToggler.vue'
</script>
<template>
  <div style="padding: 20px">
    <nav class="navigation-bar">
      <RouterLink to="/" class="nav-item">Home</RouterLink>
      <span class="divider">|</span>
      <RouterLink to="/about" class="nav-item">About</RouterLink>
      <UnitToggler />
    </nav>
    <RouterView v-slot="{ Component }">
      <KeepAlive include="WeatherHomeView">
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </div>
</template>
<style>
@import '@/assets/exercise.css';
</style>

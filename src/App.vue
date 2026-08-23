<script setup>
import UnitToggler from './components/practices/exercise/UnitToggler.vue'
</script>
<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-inner">
        <RouterLink to="/" class="app-brand">
          <span class="brand-icon" aria-hidden="true">🌤️</span>
          <span>오늘의 날씨</span>
        </RouterLink>
        <nav class="navigation-bar" aria-label="주요 메뉴">
          <RouterLink to="/" class="nav-item">Home</RouterLink>
          <RouterLink to="/about" class="nav-item">About</RouterLink>
        </nav>
        <UnitToggler />
      </div>
    </header>
    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <KeepAlive include="WeatherHomeView">
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </main>
  </div>
</template>

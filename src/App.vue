<script setup></script>
<template>
  <div style="padding: 20px">
    <nav class="navigation-bar">
      <RouterLink to="/" class="nav-item">Home</RouterLink>
      <span class="divider">|</span>
      <RouterLink to="/about" class="nav-item">About</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>
<style>
@import '@/assets/exercise.css';
</style>

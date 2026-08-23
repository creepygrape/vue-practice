<script setup>
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()
</script>

<template>
  <div class="app-unit-control" aria-label="기온 단위">
    <button
      type="button"
      :class="{ active: configStore.unit === 'celsius' }"
      aria-label="섭씨로 표시"
      @click="configStore.unit !== 'celsius' && configStore.toggleUnit()"
    >
      ℃
    </button>
    <button
      type="button"
      :class="{ active: configStore.unit === 'fahrenheit' }"
      aria-label="화씨로 표시"
      @click="configStore.unit !== 'fahrenheit' && configStore.toggleUnit()"
    >
      ℉
    </button>
  </div>
</template>

<style scoped>
.app-unit-control {
  display: inline-grid;
  grid-template-columns: repeat(2, 42px);
  justify-self: end;
  padding: 3px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface-soft);
}
.app-unit-control button {
  height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-muted);
  font-weight: 700;
}
.app-unit-control button.active {
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 4px 10px rgb(22 119 232 / 22%);
}
</style>

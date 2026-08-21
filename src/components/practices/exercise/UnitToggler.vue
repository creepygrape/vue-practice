<script setup>
import { useConfigStroe } from '@/stores/configStore'

const configStore = useConfigStroe()
</script>

<template>
  <div style="text-align: center; margin-left: auto; display: inline-flex; align-items: center; gap: 8px">
    <span
      >날씨단위: <strong>{{ configStore.unit === 'celsius' ? '섭씨(℃)' : '화씨(℉)' }}</strong></span
    >
    <button @click="configStore.toggleUnit" class="toggle-btn">단위변경</button>
  </div>
</template>

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStroe = defineStore('config', () => {
  // 1. 섭씨/화씨 단위 변경
  const unit = ref('celsius') // 섭씨 or 화씨

  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '℃' : '℉' // 현재 상테에 알맞은 단위
  })

  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  return {
    unit,
    unitSymbol,
    toggleUnit,
  }
})

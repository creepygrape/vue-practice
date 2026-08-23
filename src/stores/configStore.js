import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  // 1. 섭씨/화씨 단위 변경
  const unit = ref('celsius') // 섭씨 or 화씨

  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '℃' : '℉' // 현재 상테에 알맞은 단위
  })

  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  // 2. 도시 즐겨찾기
  const FAVORITE_STORAGE_KEY = 'weather-favorite-city-ids'
  function loadFavorites() {
    try {
      const savedFavorites = localStorage.getItem(FAVORITE_STORAGE_KEY)

      return savedFavorites ? JSON.parse(savedFavorites) : []
    } catch {
      return []
    }
  }
  function saveFavorites() {
    localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(favoriteCityIds.value))
  }

  const favoriteCityIds = ref(loadFavorites())

  function isFavorite(cityId) {
    return favoriteCityIds.value.includes(cityId)
  }

  function toggleFavorite(cityId) {
    if (isFavorite(cityId)) {
      favoriteCityIds.value = favoriteCityIds.value.filter((id) => id !== cityId)
      saveFavorites()
      return
    }

    favoriteCityIds.value.push(cityId)
    saveFavorites()
  }

  function removeFavorite(cityId) {
    if (!isFavorite(cityId)) return
    favoriteCityIds.value = favoriteCityIds.value.filter((id) => id !== cityId)
    saveFavorites()
  }

  return {
    unit,
    unitSymbol,
    toggleUnit,
    favoriteCityIds,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  }
})

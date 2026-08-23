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
  const normalizeFavoriteId = (cityId) => String(cityId).replace(/^weather:/, '')

  function loadFavorites() {
    try {
      const savedFavorites = localStorage.getItem(FAVORITE_STORAGE_KEY)
      const parsedFavorites = savedFavorites ? JSON.parse(savedFavorites) : []
      if (!Array.isArray(parsedFavorites)) return []

      const normalizedFavorites = [
        ...new Set(parsedFavorites.filter((cityId) => typeof cityId === 'string' || typeof cityId === 'number').map(normalizeFavoriteId)),
      ]
      localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(normalizedFavorites))
      return normalizedFavorites
    } catch {
      return []
    }
  }
  function saveFavorites() {
    localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(favoriteCityIds.value))
  }

  const favoriteCityIds = ref(loadFavorites())

  function isFavorite(cityId) {
    return favoriteCityIds.value.includes(normalizeFavoriteId(cityId))
  }

  function toggleFavorite(cityId) {
    const favoriteId = normalizeFavoriteId(cityId)

    if (isFavorite(favoriteId)) {
      favoriteCityIds.value = favoriteCityIds.value.filter((id) => id !== favoriteId)
      saveFavorites()
      return
    }

    favoriteCityIds.value.push(favoriteId)
    saveFavorites()
  }

  function removeFavorite(cityId) {
    const favoriteId = normalizeFavoriteId(cityId)
    if (!isFavorite(favoriteId)) return
    favoriteCityIds.value = favoriteCityIds.value.filter((id) => id !== favoriteId)
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

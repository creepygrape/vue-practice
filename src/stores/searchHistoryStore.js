import { ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'weather-search-history'
const MAX_HISTORY_COUNT = 5

const loadSearchHistory = () => {
  try {
    const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(savedHistory)) return []

    return savedHistory
      .filter(
        (item) =>
          item && typeof item.locationKey === 'string' && typeof item.name === 'string' && Number.isFinite(item.lat) && Number.isFinite(item.lon),
      )
      .slice(0, MAX_HISTORY_COUNT)
  } catch {
    return []
  }
}

export const useSearchHistoryStore = defineStore('searchHistory', () => {
  const searchHistory = ref(loadSearchHistory())

  const saveSearchHistory = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory.value))
  }

  const addSearchHistory = (candidate) => {
    const historyItem = {
      locationKey: candidate.key,
      name: candidate.displayName,
      addressName: candidate.addressName,
      region1: candidate.region1,
      lat: candidate.lat,
      lon: candidate.lon,
      searchedAt: Date.now(),
    }

    searchHistory.value = [historyItem, ...searchHistory.value.filter((item) => item.locationKey !== historyItem.locationKey)].slice(
      0,
      MAX_HISTORY_COUNT,
    )
    saveSearchHistory()
  }

  const removeSearchHistory = (locationKey) => {
    searchHistory.value = searchHistory.value.filter((item) => item.locationKey !== locationKey)
    saveSearchHistory()
  }

  const clearSearchHistory = () => {
    searchHistory.value = []
    saveSearchHistory()
  }

  return {
    searchHistory,
    addSearchHistory,
    removeSearchHistory,
    clearSearchHistory,
  }
})

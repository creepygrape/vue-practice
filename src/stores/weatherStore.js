import { ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'weather-added-locations'

const loadLocations = () => {
  try {
    const savedLocations = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(savedLocations)) return []

    return savedLocations.filter(
      (location) =>
        location &&
        typeof location.locationKey === 'string' &&
        typeof location.name === 'string' &&
        Number.isFinite(location.lat) &&
        Number.isFinite(location.lon),
    )
  } catch {
    return []
  }
}

export const useWeatherStore = defineStore('weather', () => {
  const addedLocations = ref(loadLocations())

  const saveLocations = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addedLocations.value))
  }

  const addLocation = (location) => {
    if (addedLocations.value.some((item) => item.locationKey === location.locationKey)) return false

    addedLocations.value.push({
      locationKey: location.locationKey,
      name: location.name,
      lat: location.lat,
      lon: location.lon,
    })
    saveLocations()
    return true
  }

  const removeLocation = (locationKey) => {
    addedLocations.value = addedLocations.value.filter((item) => item.locationKey !== locationKey)
    saveLocations()
  }

  return { addedLocations, addLocation, removeLocation }
})

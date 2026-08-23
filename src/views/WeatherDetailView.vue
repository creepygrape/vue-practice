<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WeatherForecast from '@/components/practices/exercise/WeatherForecast.vue'
import AirPollutionInfo from '@/components/practices/exercise/AirPollutionInfo.vue'
import WeatherLifeIndices from '@/components/practices/exercise/WeatherLifeIndices.vue'
import CurrentWeatherInfo from '@/components/practices/exercise/CurrentWeatherInfo.vue'
import { fetchAirPollution, fetchCurrentWeather, fetchWeatherForecast, WEATHER_API_MESSAGES } from '@/services/weatherApi'

const route = useRoute()
const router = useRouter()

const goBack = () => {
  if (window.history.state?.back) router.back()
  else router.push('/')
}

const cityItem = ref(null)
const isLoading = ref(false)
const currentWeatherErrorMessage = ref('')
const forecasts = ref([])
const timezoneOffset = ref(0)
const isForecastLoading = ref(false)
const forecastErrorMessage = ref('')
const airPollution = ref(null)
const isAirPollutionLoading = ref(false)
const airPollutionErrorMessage = ref('')

const fetchRealTimeWeather = async () => {
  isLoading.value = true
  currentWeatherErrorMessage.value = ''

  try {
    const weather = await fetchCurrentWeather(
      route.query.lat && route.query.lon ? { lat: route.query.lat, lon: route.query.lon } : { id: route.params.cityId },
    )

    cityItem.value = {
      id: route.query.locationKey || weather.weatherId,
      name: route.query.name || weather.apiName,
      ...weather,
    }
  } catch (error) {
    console.error('현재 날씨 정보 불러오기 실패:', error)
    currentWeatherErrorMessage.value = WEATHER_API_MESSAGES.current
  } finally {
    isLoading.value = false
  }
}

const fetchForecast = async () => {
  if (!route.query.lat || !route.query.lon) {
    forecastErrorMessage.value = '예보를 조회할 지역 좌표가 없습니다.'
    return
  }

  isForecastLoading.value = true
  forecastErrorMessage.value = ''

  try {
    const result = await fetchWeatherForecast({
      lat: route.query.lat,
      lon: route.query.lon,
    })
    forecasts.value = result.forecasts
    timezoneOffset.value = result.timezoneOffset
  } catch (error) {
    console.error('예보 정보 불러오기 실패:', error)
    forecastErrorMessage.value = WEATHER_API_MESSAGES.forecast
  } finally {
    isForecastLoading.value = false
  }
}

const loadAirPollution = async () => {
  if (!route.query.lat || !route.query.lon) {
    airPollutionErrorMessage.value = '대기질을 조회할 지역 좌표가 없습니다.'
    return
  }

  isAirPollutionLoading.value = true
  airPollutionErrorMessage.value = ''

  try {
    airPollution.value = await fetchAirPollution({
      lat: route.query.lat,
      lon: route.query.lon,
    })
  } catch (error) {
    console.error('대기질 정보 불러오기 실패:', error)
    airPollutionErrorMessage.value = WEATHER_API_MESSAGES.airPollution
  } finally {
    isAirPollutionLoading.value = false
  }
}

onMounted(() => {
  fetchRealTimeWeather()
  fetchForecast()
  loadAirPollution()
})
</script>

<template>
  <div class="detail-container">
    <div class="detail-heading">
      <button class="back-btn" type="button" @click="goBack">← 목록으로 돌아가기</button>
      <div>
        <span>WEATHER DETAIL</span>
        <h2>{{ cityItem?.name ?? '지역 상세 날씨' }}</h2>
      </div>
    </div>

    <div class="detail-dashboard">
      <aside class="detail-sidebar">
        <CurrentWeatherInfo :city-item="cityItem" :is-loading="isLoading" :error-message="currentWeatherErrorMessage" />
        <AirPollutionInfo :air-pollution="airPollution" :is-loading="isAirPollutionLoading" :error-message="airPollutionErrorMessage" />
        <WeatherLifeIndices :current-weather="cityItem" :forecasts="forecasts" :air-pollution="airPollution" :timezone-offset="timezoneOffset" />
      </aside>
      <div class="detail-forecast-panel">
        <WeatherForecast
          :forecasts="forecasts"
          :timezone-offset="timezoneOffset"
          :is-loading="isForecastLoading"
          :error-message="forecastErrorMessage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-container {
  width: 100%;
}
.detail-heading {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  margin-bottom: 18px;
}
.detail-heading > div {
  text-align: center;
}
.detail-heading span {
  color: var(--color-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.3px;
}
.detail-heading h2 {
  margin: 2px 0 0;
  font-size: 23px;
  font-weight: 850;
}
.back-btn {
  justify-self: start;
  padding: 9px 13px;
  background: var(--color-surface);
  color: var(--color-text);
}
.detail-dashboard {
  display: grid;
  grid-template-columns: minmax(300px, 0.38fr) minmax(0, 0.62fr);
  gap: 18px;
  align-items: start;
}
.detail-sidebar {
  display: grid;
  gap: 16px;
}
.detail-forecast-panel {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}
@media (max-width: 960px) {
  .detail-dashboard {
    grid-template-columns: 1fr;
  }
  .detail-heading {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .detail-heading > div {
    grid-row: 1;
    text-align: left;
  }
  .back-btn {
    grid-row: 2;
  }
}
</style>

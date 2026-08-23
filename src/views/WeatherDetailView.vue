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
    <h3>📊 지역별 상세 기상 관측 정보</h3>
    <hr />

    <CurrentWeatherInfo :city-item="cityItem" :is-loading="isLoading" :error-message="currentWeatherErrorMessage" />

    <AirPollutionInfo :air-pollution="airPollution" :is-loading="isAirPollutionLoading" :error-message="airPollutionErrorMessage" />

    <WeatherLifeIndices :current-weather="cityItem" :forecasts="forecasts" :air-pollution="airPollution" :timezone-offset="timezoneOffset" />

    <WeatherForecast :forecasts="forecasts" :timezone-offset="timezoneOffset" :is-loading="isForecastLoading" :error-message="forecastErrorMessage" />

    <button @click="goBack" class="back-btn">← 메인 대시보드로 돌아가기</button>
  </div>
</template>

<style scoped>
.detail-container {
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.back-btn {
  padding: 8px 12px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>

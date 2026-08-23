<script setup>
import { useConfigStore } from '@/stores/configStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import WeatherForecast from '@/components/practices/exercise/WeatherForecast.vue'
import AirPollutionInfo from '@/components/practices/exercise/AirPollutionInfo.vue'
import WeatherLifeIndices from '@/components/practices/exercise/WeatherLifeIndices.vue'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()

const goBack = () => {
  if (window.history.state?.back) router.back()
  else router.push('/')
}

// OpenWeather API
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = import.meta.env.VITE_OPENWEATHER_BASE_URL
const FORECAST_URL =
  import.meta.env.VITE_OPENWEATHER_FORECAST_URL || 'https://api.openweathermap.org/data/2.5/forecast'
const AIR_POLLUTION_URL =
  import.meta.env.VITE_OPENWEATHER_AIR_POLLUTION_URL || 'https://api.openweathermap.org/data/2.5/air_pollution'
const cityItem = ref(null)
const isLoading = ref(false)
const forecasts = ref([])
const timezoneOffset = ref(0)
const isForecastLoading = ref(false)
const forecastErrorMessage = ref('')
const airPollution = ref(null)
const isAirPollutionLoading = ref(false)
const airPollutionErrorMessage = ref('')

const fetchRealTimeWeather = async () => {
  isLoading.value = true

  try {
    // element-plus loading 확인용
    // await new Promise((resolve) => setTimeout(resolve, 2000))

    const response = await axios.get(BASE_URL, {
      params: {
        ...(route.query.lat && route.query.lon ? { lat: route.query.lat, lon: route.query.lon } : { id: route.params.cityId }),
        appid: API_KEY,
        units: 'metric',
        lang: 'kr',
      },
    })
    console.log(response)

    cityItem.value = {
      id: route.query.locationKey || String(response.data.id),
      name: route.query.name || response.data.name,
      temp: response.data.main.temp,
      status: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      wind: response.data.wind.speed,
      feelsLike: response.data.main.feels_like,
      weatherMain: response.data.weather[0].main,
      isPrecipitating:
        Boolean(response.data.rain || response.data.snow) ||
        ['Rain', 'Drizzle', 'Thunderstorm', 'Snow'].includes(response.data.weather[0].main),
    }
    console
  } catch (error) {
    console.log('뭔가 잘못됨;;; | ' + error)
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
    const { data } = await axios.get(FORECAST_URL, {
      params: {
        lat: route.query.lat,
        lon: route.query.lon,
        appid: API_KEY,
        units: 'metric',
        lang: 'kr',
      },
    })
    forecasts.value = data.list
    timezoneOffset.value = data.city.timezone
  } catch (error) {
    console.error('예보 정보 불러오기 실패:', error)
    forecastErrorMessage.value = '시간별·5일 예보를 불러오지 못했습니다.'
  } finally {
    isForecastLoading.value = false
  }
}

const fetchAirPollution = async () => {
  if (!route.query.lat || !route.query.lon) {
    airPollutionErrorMessage.value = '대기질을 조회할 지역 좌표가 없습니다.'
    return
  }

  isAirPollutionLoading.value = true
  airPollutionErrorMessage.value = ''

  try {
    const { data } = await axios.get(AIR_POLLUTION_URL, {
      params: {
        lat: route.query.lat,
        lon: route.query.lon,
        appid: API_KEY,
      },
    })
    const result = data.list[0]
    airPollution.value = {
      aqi: result.main.aqi,
      pm25: Math.round(result.components.pm2_5 * 10) / 10,
      pm10: Math.round(result.components.pm10 * 10) / 10,
    }
  } catch (error) {
    console.error('대기질 정보 불러오기 실패:', error)
    airPollutionErrorMessage.value = '대기질·미세먼지 정보를 불러오지 못했습니다.'
  } finally {
    isAirPollutionLoading.value = false
  }
}

onMounted(() => {
  fetchRealTimeWeather()
  fetchForecast()
  fetchAirPollution()
})

const displayTemp = computed(() => {
  const rawTemp = cityItem.value.temp // 기본 원본 데이터는 섭씨 숫자
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32) // 화씨 변환 연산
  }
  return rawTemp // 'celsius'일 때는 원본 그대로 반환
})
</script>

<template>
  <div class="detail-container">
    <h3>📊 지역별 상세 기상 관측 정보</h3>
    <hr />

    <div v-if="isLoading" v-loading="isLoading" element-loading-text="상세 정보를 불러오는 중입니다... ☁️" class="info-card loading-area"></div>
    <div v-else-if="cityItem" class="info-card">
      <h4>📍 지정 지역: {{ cityItem.name }}</h4>
      <button class="btn-favorite" @click.stop="configStore.toggleFavorite(cityItem.id)">
        {{ configStore.isFavorite(cityItem.id) ? '★' : '☆' }}
      </button>
      <p>
        실시간 기온: <strong>{{ displayTemp }}{{ configStore.unitSymbol }}</strong>
      </p>
      <p>기상 현황: {{ cityItem.status }}</p>
      <p>대기 습도: {{ cityItem.humidity }}%</p>
      <p>현재 풍속: {{ cityItem.wind }}ms</p>
    </div>
    <div v-else class="weather-card">
      <p>해당 지역의 상세 정보가 존재하지 않습니다.</p>
    </div>

    <AirPollutionInfo
      :air-pollution="airPollution"
      :is-loading="isAirPollutionLoading"
      :error-message="airPollutionErrorMessage"
    />

    <WeatherLifeIndices
      :current-weather="cityItem"
      :forecasts="forecasts"
      :air-pollution="airPollution"
      :timezone-offset="timezoneOffset"
    />

    <WeatherForecast
      :forecasts="forecasts"
      :timezone-offset="timezoneOffset"
      :is-loading="isForecastLoading"
      :error-message="forecastErrorMessage"
    />

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
.info-card {
  background: #f1f2f6;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
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

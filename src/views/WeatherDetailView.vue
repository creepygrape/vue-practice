<script setup>
import { useConfigStroe } from '@/stores/configStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cityPool } from '@/constants/weather'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStroe()

// OpenWeather API
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = import.meta.env.VITE_OPENWEATHER_BASE_URL
const weather = ref(null)
const isLoading = ref(false)

const fetchRealTimeWeather = async () => {
  isLoading.value = true

  try {
    // element-plus loading 확인용
    // await new Promise((resolve) => setTimeout(resolve, 2000))

    const response = await axios.get(BASE_URL, {
      params: {
        id: route.params.cityId,
        appid: API_KEY,
        units: 'metric',
        lang: 'kr',
      },
    })
    console.log(response)

    const matchedCity = cityPool.find((city) => {
      const apiCityName = city.query.split(',')[0]
      return apiCityName === response.data.name
    })

    weather.value = {
      id: String(response.data.id),
      name: matchedCity?.name ?? response.data.name,
      temp: response.data.main.temp,
      status: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      wind: response.data.wind.speed,
    }
    console
  } catch (error) {
    console.log('뭔가 잘못됨;;; | ' + error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchRealTimeWeather()
})

const displayTemp = computed(() => {
  const rawTemp = weather.value.temp // 기본 원본 데이터는 섭씨 숫자
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
    <div v-else-if="weather" class="info-card">
      <h4>📍 지정 지역: {{ weather.name }}</h4>
      <p>
        실시간 기온: <strong>{{ displayTemp }}{{ configStore.unitSymbol }}</strong>
      </p>
      <p>기상 현황: {{ weather.status }}</p>
      <p>대기 습도: {{ weather.humidity }}</p>
      <p>현재 풍속: {{ weather.wind }}</p>
    </div>
    <div v-else class="weather-card">
      <p>해당 지역의 상세 정보가 존재하지 않습니다.</p>
    </div>

    <button @click="router.push('/')" class="back-btn">← 메인 대시보드로 돌아가기</button>
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

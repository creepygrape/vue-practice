<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import BaseDashboardCard from '@/components/practices/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/practices/exercise/SearchBar.vue'
import WeatherCard from '@/components/practices/exercise/WeatherCard.vue'
import { useRouter } from 'vue-router'
import { cityPool } from '@/constants/weather'
import axios from 'axios'

const router = useRouter()
const searchCity = ref('')
const selectedCity = ref('')

const selectedStatus = ref('전체')

const fashionList = ref([
  { id: 'fashion_01', status: '맑음', recommendation: '반팔 티셔츠, 얇은 셔츠, 선글라스', emoji: '🕶️' },
  { id: 'fashion_02', status: '흐림', recommendation: '긴팔 티셔츠나 가벼운 가디건', emoji: '🧥' },
  { id: 'fashion_03', status: '구름', recommendation: '반팔 또는 얇은 긴팔, 가벼운 겉옷', emoji: '👕' },
  { id: 'fashion_04', status: '비', recommendation: '방수 재킷, 우산, 미끄럽지 않은 신발', emoji: '☔' },
  { id: 'fashion_05', status: '바람', recommendation: '바람막이와 긴 바지', emoji: '🌬️' },
])

// const showDetail = (cityName, status) => {
//   window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
// }

// const isCelsius = ref(true)

// const displayTemperature = (celsius) => {
//   if (isCelsius.value) {
//     return celsius
//   }

//   return ((celsius * 9) / 5 + 32).toFixed(1)
// }

const matchesWeatherFilter = (item) => {
  if (selectedStatus.value === '전체') return true

  if (selectedStatus.value === '맑음') {
    return item.status.includes('맑음')
  }

  if (selectedStatus.value === '흐림') {
    return item.status.includes('흐림')
  }

  if (selectedStatus.value === '구름') {
    return item.status.includes('구름')
  }

  if (selectedStatus.value === '비') {
    return item.status.includes('비')
  }

  if (selectedStatus.value === '바람') {
    return item.wind >= 7 // 기준값: 풍속 7m/s 이상
  }

  return true
}

const filteredWeatherList = computed(() => {
  const keyword = searchCity.value.trim()

  return weatherList.value.filter((item) => {
    const matchesCity = item.name.includes(keyword)
    const matchesStatus =  matchesWeatherFilter(item)

    return matchesCity && matchesStatus
  })
})

const selectedCityInfo = computed(() => {
  if (!selectedCity.value) {
    return '카드를 클릭하거나 검색해 보세요'
  }

  return selectedCity.value + '이(가) 선택됐습니다.'
})

watch(selectedCity, (newVal, oldVal) => {
  console.log(`🤖 watch selectedCity: 선택된 도시가 [${oldVal}]에서 [${newVal}]로 변경됐습니다.`)
})

watchEffect(() => {
  console.log(`👁️‍🗨️ watchEffect searchCity: 검색어가 [${searchCity.value}]로 변경됐습니다.`)
})

watch(selectedStatus, (newVal, oldVal) => {
  console.log(`🤖 watch selectedStatus: 선택된 날씨가 [${oldVal}]에서 [${newVal}]로 변경됐습니다.`)
})

const handleChangeSearchKeyword = (newValue) => {
  searchCity.value = newValue
}

const handleSelectCity = (newValue) => {
  selectedCity.value = newValue.name
}

const handleClickDetail = (newValue) => {
  // showDetail(newValue.name, newValue.status)
  // router.push({
  //   name: 'WeatherDetail',
  //   params: {cityId: newValue.id}
  // })
  router.push('/weather/' + newValue.id)
}

// OpenWeather API
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = import.meta.env.VITE_OPENWEATHER_BASE_URL
const weatherList = ref([])
const isLoading = ref(false)

const fetchRealTimeWeather = async () => {
  isLoading.value = true

  try {
    const responses = await Promise.all(
      cityPool.map((city) =>
        axios.get(BASE_URL, {
          params: {
            q: city.query,
            appid: API_KEY,
            units: 'metric',
            lang: 'kr',
          },
        }),
      ),
    )
    console.log(responses)
    weatherList.value = responses.map(({ data }, index) => ({
      id: String(data.id),
      name: cityPool[index].name,
      temp: data.main.temp,
      status: data.weather[0].description,
      humidity: data.main.humidity,
      wind: data.wind.speed,
    }))
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
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <SearchBar :search-city="searchCity" @change-search-keyword="handleChangeSearchKeyword" />
    </BaseDashboardCard>
    <BaseDashboardCard>
      <h3>🏙️ 지역별 날씨 현황</h3>
      <select v-model="selectedStatus">
        <option value="전체">전체</option>
        <option value="맑음">맑음</option>
        <option value="흐림">흐림</option>
        <option value="구름">구름</option>
        <option value="비">비</option>
        <option value="바람">바람</option>
      </select>
      <div v-if="isLoading" class="weather-card">
        <p>날씨 정보를 불러오는 중입니다... ☁️</p>
      </div>
      <div v-else-if="filteredWeatherList.length === 0" class="weather-card">
        <p>검색 결과와 일치하는 도시가 없습니다.</p>
      </div>
      <WeatherCard
        v-for="item in filteredWeatherList"
        :key="item.id"
        :city-item="item"
        @select-card="handleSelectCity"
        @click-detail="handleClickDetail"
      />
    </BaseDashboardCard>
    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>

<style></style>

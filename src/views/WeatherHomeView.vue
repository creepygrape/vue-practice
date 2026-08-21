<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import BaseDashboardCard from '@/components/practices/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/practices/exercise/SearchBar.vue'
import WeatherCard from '@/components/practices/exercise/WeatherCard.vue'
import { useRouter } from 'vue-router'
import { cityPool } from '@/constants/weather'
import axios from 'axios'
import PaginationBar from '@/components/practices/exercise/PaginationBar.vue'

const router = useRouter()
const searchCity = ref('')
const selectedCity = ref('')

const selectedStatus = ref('전체')

const currentPage = ref(1)
const pageSize = 5

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
    const matchesStatus = matchesWeatherFilter(item)

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
  currentPage.value = 1
  console.log(`👁️‍🗨️ watchEffect searchCity: 검색어가 [${searchCity.value}]로 변경됐습니다.`)
})

watch(selectedStatus, (newVal, oldVal) => {
  currentPage.value = 1
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
    // element-plus loading 확인용
    // await new Promise((resolve) => setTimeout(resolve, 2000))

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

// Pagination
const paginatedWeatherList = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return filteredWeatherList.value.slice(start, start + pageSize)
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
      <div v-if="isLoading" v-loading="isLoading" element-loading-text="날씨 정보를 불러오는 중입니다... ☁️" class="weather-card loading-area"></div>
      <div v-else-if="filteredWeatherList.length === 0" class="weather-card">
        <p>검색 결과와 일치하는 도시가 없습니다.</p>
      </div>

      <WeatherCard
        v-for="item in paginatedWeatherList"
        :key="item.id"
        :city-item="item"
        @select-card="handleSelectCity"
        @click-detail="handleClickDetail"
      />
    </BaseDashboardCard>
    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
    <div class="pagination-area">
      <PaginationBar v-if="!isLoading" v-model:current-page="currentPage" :page-size="5" :total="filteredWeatherList.length" />
    </div>
  </div>
</template>

<style></style>

<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

const searchCity = ref('')
const selectedCity = ref('')

const isCelsius = ref(true)
const selectedStatus = ref('전체')

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 30.0, status: '흐림', humidity: 45, wind: 2.3 },
  { id: 'city_02', name: '인천', temp: 28.1, status: '맑음', humidity: 20, wind: 2.1 },
  { id: 'city_03', name: '강릉', temp: 16.6, status: '구름', humidity: 35, wind: 1.5 },
  { id: 'city_04', name: '포항', temp: 22.7, status: '비', humidity: 40, wind: 2.2 },
  { id: 'city_05', name: '대전', temp: 30.9, status: '바람', humidity: 70, wind: 1.3 },
  { id: 'city_06', name: '광주', temp: 27.0, status: '흐림', humidity: 35, wind: 0.8 },
  { id: 'city_07', name: '제주', temp: 18.0, status: '맑음', humidity: 25, wind: 1.7 },
  { id: 'city_08', name: '부산', temp: 30.8, status: '구름', humidity: 55, wind: 1.2 },
  { id: 'city_09', name: '울산', temp: 29.9, status: '비', humidity: 60, wind: 0.6 },
  { id: 'city_10', name: '강원도', temp: 14.3, status: '맑음', humidity: 40, wind: 1.8 },
])

const fashionList = ref([
  { id: 'fashion_01', status: '맑음', recommendation: '반팔 티셔츠, 얇은 셔츠, 선글라스', emoji: '🕶️' },
  { id: 'fashion_02', status: '흐림', recommendation: '긴팔 티셔츠나 가벼운 가디건', emoji: '🧥' },
  { id: 'fashion_03', status: '구름', recommendation: '반팔 또는 얇은 긴팔, 가벼운 겉옷', emoji: '👕' },
  { id: 'fashion_04', status: '비', recommendation: '방수 재킷, 우산, 미끄럽지 않은 신발', emoji: '☔' },
  { id: 'fashion_05', status: '바람', recommendation: '바람막이와 긴 바지', emoji: '🌬️' },
])

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}

const displayTemperature = (celsius) => {
  if (isCelsius.value) {
    return celsius
  }

  return ((celsius * 9) / 5 + 32).toFixed(1)
}

const filteredWeatherList = computed(() => {
  const keyword = searchCity.value.trim()

  return weatherList.value.filter((item) => {
    const matchesCity = item.name.includes(keyword)
    const matchesStatus = selectedStatus.value === '전체' || item.status === selectedStatus.value

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
  showDetail(newValue.name, newValue.status)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <SearchBar :search-city="searchCity" @change-search-keyword="handleChangeSearchKeyword" />
    </BaseDashboardCard>
    <BaseDashboardCard>
      <h3>🏙️ 지역별 날씨 현황</h3>
      <button @click="isCelsius = !isCelsius">
        {{ isCelsius ? '화씨(°F)로 보기' : '섭씨(°C)로 보기' }}
      </button>
      <select v-model="selectedStatus">
        <option value="전체">전체</option>
        <option value="맑음">맑음</option>
        <option value="흐림">흐림</option>
        <option value="구름">구름</option>
        <option value="비">비</option>
        <option value="바람">바람</option>
      </select>
      <div v-if="filteredWeatherList.length === 0" class="weather-card">
        <p>검색 결과와 일치하는 도시가 없습니다.</p>
      </div>
      <WeatherCard
        :filtered-weather-list="filteredWeatherList"
        :is-celsius="isCelsius"
        :display-temperature="displayTemperature"
        @select-card="handleSelectCity"
        @click-detail="handleClickDetail"
      />
    </BaseDashboardCard>
    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>

<style scoped>

</style>

<script setup>
import { ref, computed, watch, watchEffect, onMounted, onBeforeUnmount, onActivated } from 'vue'
import BaseDashboardCard from '@/components/practices/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/practices/exercise/SearchBar.vue'
import WeatherCard from '@/components/practices/exercise/WeatherCard.vue'
import { useRouter } from 'vue-router'
import { cityPool } from '@/constants/weather'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import PaginationBar from '@/components/practices/exercise/PaginationBar.vue'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'

defineOptions({ name: 'WeatherHomeView' })

const router = useRouter()
const searchCity = ref('')
const selectedCity = ref('')
const locationCandidates = ref([])
const isSearchingLocation = ref(false)
const locationSearchMessage = ref('')
const duplicateLocationMessage = ref('')
let searchTimer = null
let searchRequestId = 0

const selectedStatus = ref('전체')
const selectedSort = ref('default')

const currentPage = ref(1)
const pageSize = 4

const configStore = useConfigStore()
const weatherStore = useWeatherStore()
const showFavoritesOnly = ref(false)

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
    const matchesCity = [item.name, ...(item.aliases ?? [])].some((name) => name.includes(keyword))
    const matchesStatus = matchesWeatherFilter(item)
    const matchesFavorite = !showFavoritesOnly.value || configStore.isFavorite(item.id)

    return matchesCity && matchesStatus && matchesFavorite
  })
})

const sortedWeatherList = computed(() => {
  const items = [...filteredWeatherList.value]

  if (selectedSort.value === 'name') {
    return items.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  }
  if (selectedSort.value === 'temp-desc') {
    return items.sort((a, b) => b.temp - a.temp)
  }
  if (selectedSort.value === 'temp-asc') {
    return items.sort((a, b) => a.temp - b.temp)
  }
  if (selectedSort.value === 'latest') {
    const addedOrderByKey = new Map(
      weatherStore.addedLocations.map((location, index) => [location.locationKey, index]),
    )
    return items.sort((a, b) => {
      if (a.isCustom !== b.isCustom) return a.isCustom ? -1 : 1
      if (a.isCustom) return addedOrderByKey.get(b.locationKey) - addedOrderByKey.get(a.locationKey)
      return a.initialOrder - b.initialOrder
    })
  }

  return items
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

watch(selectedSort, () => {
  currentPage.value = 1
})

const handleChangeSearchKeyword = (newValue) => {
  searchCity.value = newValue
}

const KAKAO_GEO_URL = import.meta.env.VITE_KAKAO_GEO_URL
const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY

const getCandidateName = (document) => {
  const address = document.address
  if (!address) return document.address_name

  return [address.region_1depth_name, address.region_2depth_name, address.region_3depth_name].filter(Boolean).join(' ')
}

const isSameLocation = (candidate) =>
  weatherList.value.some((item) => {
    if (item.locationKey === candidate.key || item.name === candidate.displayName) return true

    const topLevelName = candidate.region1.replace(/(특별시|광역시|특별자치시|특별자치도|도)$/u, '')
    return item.name === topLevelName && candidate.displayName === candidate.region1
  })

const searchLocationCandidates = async (keyword, requestId) => {
  isSearchingLocation.value = true
  locationSearchMessage.value = ''

  try {
    const { data } = await axios.get(KAKAO_GEO_URL, {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
      params: { query: keyword, size: 30 },
    })

    if (requestId !== searchRequestId) return

    const uniqueCandidates = new Map()
    const legalDistrictDocuments = data.documents.filter((document) => document.address?.b_code)
    legalDistrictDocuments.forEach((document) => {
      const bCode = document.address.b_code
      const displayName = getCandidateName(document)
      const candidate = {
        key: bCode,
        displayName,
        addressName: document.address_name,
        region1: document.address?.region_1depth_name ?? '',
        lat: Number(document.y),
        lon: Number(document.x),
      }

      if (!uniqueCandidates.has(bCode)) {
        uniqueCandidates.set(bCode, candidate)
      }
    })

    locationCandidates.value = [...uniqueCandidates.values()]
    if (!locationCandidates.value.length) {
      locationSearchMessage.value = '추가할 수 있는 법정동 후보가 없습니다.'
    }
  } catch (error) {
    if (requestId !== searchRequestId) return
    console.error('카카오 지역 검색 실패:', error)
    locationCandidates.value = []
    locationSearchMessage.value = '지역 후보를 불러오지 못했습니다.'
  } finally {
    if (requestId === searchRequestId) isSearchingLocation.value = false
  }
}

watch(searchCity, (value) => {
  clearTimeout(searchTimer)
  const keyword = value.trim()
  const requestId = ++searchRequestId
  locationCandidates.value = []
  locationSearchMessage.value = ''
  duplicateLocationMessage.value = ''
  isSearchingLocation.value = false

  if (keyword.length < 2) return
  searchTimer = setTimeout(() => searchLocationCandidates(keyword, requestId), 400)
})

onBeforeUnmount(() => clearTimeout(searchTimer))

const handleSelectCity = (newValue) => {
  selectedCity.value = newValue.name
}

const handleClickDetail = (newValue) => {
  // showDetail(newValue.name, newValue.status)
  // router.push({
  //   name: 'WeatherDetail',
  //   params: {cityId: newValue.id}
  // })
  router.push({
    path: '/weather/' + newValue.weatherId,
    query: {
      name: newValue.name,
      lat: newValue.lat,
      lon: newValue.lon,
      locationKey: newValue.locationKey,
    },
  })
}

// OpenWeather API
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = import.meta.env.VITE_OPENWEATHER_BASE_URL
const AIR_POLLUTION_URL =
  import.meta.env.VITE_OPENWEATHER_AIR_POLLUTION_URL || 'https://api.openweathermap.org/data/2.5/air_pollution'
const weatherList = ref([])
const isLoading = ref(false)
const isRefreshing = ref(false)
const lastFetchedAt = ref(0)
const WEATHER_TTL = 30 * 60 * 1000
const addingLocationKey = ref('')

const fetchAirPollution = async (lat, lon) => {
  try {
    const { data } = await axios.get(AIR_POLLUTION_URL, {
      params: { lat, lon, appid: API_KEY },
    })
    const result = data.list[0]
    return {
      aqi: result.main.aqi,
      pm25: Math.round(result.components.pm2_5 * 10) / 10,
      pm10: Math.round(result.components.pm10 * 10) / 10,
    }
  } catch (error) {
    console.warn('대기질 정보 불러오기 실패:', error)
    return null
  }
}

const handleSelectCandidate = async (candidate) => {
  if (isSameLocation(candidate)) {
    duplicateLocationMessage.value = `이미 추가한 도시입니다: ${candidate.displayName}`
    return
  }
  if (addingLocationKey.value) return

  duplicateLocationMessage.value = ''
  addingLocationKey.value = candidate.key
  locationSearchMessage.value = '선택한 지역의 날씨를 불러오는 중입니다...'

  try {
    const [{ data }, airPollution] = await Promise.all([
      axios.get(BASE_URL, {
        params: {
          lat: candidate.lat,
          lon: candidate.lon,
          appid: API_KEY,
          units: 'metric',
          lang: 'kr',
        },
      }),
      fetchAirPollution(candidate.lat, candidate.lon),
    ])

    weatherList.value.push({
      id: candidate.key,
      weatherId: String(data.id),
      locationKey: candidate.key,
      name: candidate.displayName,
      lat: candidate.lat,
      lon: candidate.lon,
      temp: data.main.temp,
      status: data.weather[0].description,
      humidity: data.main.humidity,
      wind: data.wind.speed,
      isCustom: true,
      airPollution,
    })
    weatherStore.addLocation({
      locationKey: candidate.key,
      name: candidate.displayName,
      lat: candidate.lat,
      lon: candidate.lon,
    })
    locationSearchMessage.value = '새 날씨 카드를 추가했습니다.'
  } catch (error) {
    console.error('OpenWeather 좌표 날씨 조회 실패:', error)
    locationSearchMessage.value = '선택한 지역의 날씨를 불러오지 못했습니다.'
  } finally {
    addingLocationKey.value = ''
  }
}

const fetchRealTimeWeather = async () => {
  if (isLoading.value || isRefreshing.value) return

  const isInitialLoad = weatherList.value.length === 0
  if (isInitialLoad) isLoading.value = true
  else isRefreshing.value = true

  try {
    // element-plus loading 확인용
    // await new Promise((resolve) => setTimeout(resolve, 2000))

    const locations = [
      ...cityPool.map((city, index) => ({ ...city, isCustom: false, initialOrder: index })),
      ...weatherStore.addedLocations.map((location) => ({ ...location, isCustom: true })),
    ]
    const responses = await Promise.all(
      locations.map(async (location) => {
        const [{ data }, airPollution] = await Promise.all([
          axios.get(BASE_URL, {
            params: {
              lat: location.lat,
              lon: location.lon,
              appid: API_KEY,
              units: 'metric',
              lang: 'kr',
            },
          }),
          fetchAirPollution(location.lat, location.lon),
        ])
        return { data, airPollution }
      }),
    )
    console.log(responses)
    weatherList.value = responses.map(({ data, airPollution }, index) => ({
      id: locations[index].isCustom ? locations[index].locationKey : String(data.id),
      weatherId: String(data.id),
      locationKey: locations[index].isCustom ? locations[index].locationKey : `weather:${data.id}`,
      name: locations[index].name,
      aliases: locations[index].aliases,
      lat: locations[index].lat,
      lon: locations[index].lon,
      temp: data.main.temp,
      status: data.weather[0].description,
      humidity: data.main.humidity,
      wind: data.wind.speed,
      isCustom: locations[index].isCustom,
      initialOrder: locations[index].initialOrder,
      airPollution,
    }))
    lastFetchedAt.value = Date.now()
    console
  } catch (error) {
    console.log('날씨 정보 불러오기 실패 | ' + error)
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

onMounted(() => {
  fetchRealTimeWeather()
})

onActivated(() => {
  const isWeatherStale = Date.now() - lastFetchedAt.value >= WEATHER_TTL
  if (isWeatherStale) fetchRealTimeWeather()
})

const handleDeleteCard = async (item) => {
  try {
    await ElMessageBox.confirm(`${item.name}을(를) 삭제할까요?`, '지역 삭제', {
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      confirmButtonClass: 'el-button--danger',
      type: 'warning',
    })

    weatherStore.removeLocation(item.locationKey)
    configStore.removeFavorite(item.id)
    weatherList.value = weatherList.value.filter((weather) => weather.locationKey !== item.locationKey)
    if (selectedCity.value === item.name) selectedCity.value = ''
    ElMessage.success(`${item.name}을(를) 삭제했습니다.`)
  } catch {
    // 사용자가 삭제를 취소한 경우 상태를 변경하지 않습니다.
  }
}

// Pagination
const paginatedWeatherList = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return sortedWeatherList.value.slice(start, start + pageSize)
})
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <SearchBar
        :search-city="searchCity"
        :candidates="locationCandidates"
        :is-searching="isSearchingLocation"
        :search-message="locationSearchMessage"
        :duplicate-message="duplicateLocationMessage"
        @change-search-keyword="handleChangeSearchKeyword"
        @select-candidate="handleSelectCandidate"
      />
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
      <select v-model="selectedSort" aria-label="카드 정렬 기준">
        <option value="default">기본순</option>
        <option value="name">이름순</option>
        <option value="temp-desc">기온 높은 순</option>
        <option value="temp-asc">기온 낮은 순</option>
        <option value="latest">최신 추가순</option>
      </select>
      <button @click="showFavoritesOnly = !showFavoritesOnly">
        {{ showFavoritesOnly ? '★ 즐겨찾기만 보는 중' : '☆ 즐겨찾기만 보기' }}
      </button>
      <span v-if="isRefreshing" class="refreshing-message">날씨 갱신 중...</span>
      <div v-if="isLoading" v-loading="isLoading" element-loading-text="날씨 정보를 불러오는 중입니다... ☁️" class="weather-card loading-area"></div>
      <div v-else-if="filteredWeatherList.length === 0" class="weather-card">
        <p v-if="showFavoritesOnly">즐겨찾기한 도시가 없습니다.</p>
        <p v-else>검색 결과와 일치하는 도시가 없습니다.</p>
      </div>

      <WeatherCard
        v-for="item in paginatedWeatherList"
        :key="item.id"
        :city-item="item"
        @select-card="handleSelectCity"
        @click-detail="handleClickDetail"
        @delete-card="handleDeleteCard"
      />
    </BaseDashboardCard>
    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
    <div class="pagination-area">
      <PaginationBar v-if="!isLoading" v-model:current-page="currentPage" :page-size="pageSize" :total="filteredWeatherList.length" />
    </div>
  </div>
</template>

<style scoped>
.refreshing-message {
  margin-left: 8px;
  color: #909399;
  font-size: 13px;
}
</style>
